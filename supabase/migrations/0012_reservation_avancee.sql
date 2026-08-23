-- Prépare le modèle de données pour le module de réservation avancé demandé :
-- réservation par véhicule précis (pas juste par catégorie), horaires de prise en
-- charge/retour, calcul automatique du prix, et blocages manuels de disponibilité
-- (entretien, réservation hors-système, etc.) distincts d'une vraie réservation.

-- 1. Horaires + lieu sur les réservations opérationnelles (déjà présents sur les
--    demandes, absents ici — les deux doivent être alignés).
alter table public.reservations
  add column heure_debut time,
  add column heure_fin time,
  add column lieu_prise_en_charge text;

-- 2. Demandes de réservation publiques : passage d'une sélection par catégorie à une
--    sélection par véhicule précis (décision produit). La table est vide (0 ligne),
--    migration directe sans étape de bascule des données existantes.
alter table public.demandes_reservation
  drop constraint demandes_reservation_categorie_id_fkey;
drop index if exists public.idx_demandes_reservation_categorie;
alter table public.demandes_reservation
  drop column categorie_id;

alter table public.demandes_reservation
  add column vehicule_id uuid not null references public.vehicules (id),
  add column heure_debut time,
  add column heure_fin time,
  add column prix_estime_usd numeric check (prix_estime_usd is null or prix_estime_usd >= 0);

create index idx_demandes_reservation_vehicule on public.demandes_reservation (vehicule_id);

-- 3. Blocages manuels de disponibilité par véhicule (entretien, réservation prise
--    hors-système, indisponibilité ponctuelle...) — participent au même calcul de
--    disponibilité que les réservations, sans être une réservation eux-mêmes.
create table public.indisponibilites_vehicule (
  id uuid primary key default gen_random_uuid(),
  vehicule_id uuid not null references public.vehicules (id),
  date_debut date not null,
  date_fin date not null,
  motif text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dates_valides_indispo check (date_fin >= date_debut),
  constraint pas_de_chevauchement_indispo
    exclude using gist (vehicule_id with =, daterange(date_debut, date_fin, '[]') with &&)
);

create index idx_indisponibilites_vehicule on public.indisponibilites_vehicule (vehicule_id);

alter table public.indisponibilites_vehicule enable row level security;

create policy "indispo_select_staff"
  on public.indisponibilites_vehicule for select
  using (public.est_staff());

create policy "indispo_insert_staff"
  on public.indisponibilites_vehicule for insert
  with check (public.est_staff());

create policy "indispo_update_staff"
  on public.indisponibilites_vehicule for update
  using (public.est_staff())
  with check (public.est_staff());

create policy "indispo_delete_staff"
  on public.indisponibilites_vehicule for delete
  using (public.est_staff());

create trigger set_updated_at before update on public.indisponibilites_vehicule
  for each row execute function public.set_updated_at();

-- 4. Calcul automatique du prix total à partir de la grille tarifaire par palier
--    (1-3j / 4j+ / 15j+), déjà publique — pas besoin de security definer.
create or replace function public.calculer_prix_total(
  p_categorie_id uuid,
  p_date_debut date,
  p_date_fin date
)
returns numeric
language sql
stable
set search_path = public
as $$
  with jours as (
    select greatest(p_date_fin - p_date_debut, 1) as n
  ),
  tarif_applicable as (
    select t.prix_usd
    from public.tarifs t, jours
    where t.categorie_id = p_categorie_id
      and t.palier = case
        when jours.n >= 15 then '15_plus_jours'
        when jours.n >= 4 then '4_plus_jours'
        else '1_3_jours'
      end
  )
  select tarif_applicable.prix_usd * jours.n
  from tarif_applicable, jours
$$;

revoke execute on function public.calculer_prix_total(uuid, date, date) from public;
grant execute on function public.calculer_prix_total(uuid, date, date) to anon, authenticated;

-- 5. Disponibilité d'un véhicule PRÉCIS (remplace le besoin de vérifier seulement par
--    catégorie côté public désormais que la sélection se fait par véhicule) : combine
--    réservations non annulées + blocages manuels + état opérationnel du véhicule.
create or replace function public.disponibilite_vehicule(
  p_vehicule_id uuid,
  p_date_debut date,
  p_date_fin date
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    exists (
      select 1 from public.vehicules v
      where v.id = p_vehicule_id and v.actif and v.etat_operationnel = 'disponible'
    )
    and not exists (
      select 1 from public.reservations r
      where r.vehicule_id = p_vehicule_id
        and r.statut <> 'annulee'
        and daterange(r.date_debut, r.date_fin, '[]') && daterange(p_date_debut, p_date_fin, '[]')
    )
    and not exists (
      select 1 from public.indisponibilites_vehicule i
      where i.vehicule_id = p_vehicule_id
        and daterange(i.date_debut, i.date_fin, '[]') && daterange(p_date_debut, p_date_fin, '[]')
    )
$$;

revoke execute on function public.disponibilite_vehicule(uuid, date, date) from public;
grant execute on function public.disponibilite_vehicule(uuid, date, date) to anon, authenticated;

-- 6. Périodes indisponibles d'un véhicule, pour dessiner un calendrier (dates
--    uniquement — aucune donnée client ou interne exposée).
create or replace function public.periodes_indisponibles_vehicule(
  p_vehicule_id uuid
)
returns table (date_debut date, date_fin date, source text)
language sql
security definer
set search_path = public
stable
as $$
  select r.date_debut, r.date_fin, 'reservation'::text as source
  from public.reservations r
  where r.vehicule_id = p_vehicule_id
    and r.statut <> 'annulee'
  union all
  select i.date_debut, i.date_fin, 'indisponibilite'::text as source
  from public.indisponibilites_vehicule i
  where i.vehicule_id = p_vehicule_id
$$;

revoke execute on function public.periodes_indisponibles_vehicule(uuid) from public;
grant execute on function public.periodes_indisponibles_vehicule(uuid) to anon, authenticated;

-- 7. Liste des véhicules publiquement sélectionnables pour une catégorie — champs
--    volontairement limités (jamais plaque ni notes internes).
create or replace function public.vehicules_publics_par_categorie(
  p_categorie_id uuid
)
returns table (id uuid, categorie_id uuid, annee integer, photo_url text)
language sql
security definer
set search_path = public
stable
as $$
  select v.id, v.categorie_id, v.annee, v.photo_url
  from public.vehicules v
  where v.categorie_id = p_categorie_id
    and v.actif
    and v.etat_operationnel = 'disponible'
  order by v.created_at
$$;

revoke execute on function public.vehicules_publics_par_categorie(uuid) from public;
grant execute on function public.vehicules_publics_par_categorie(uuid) to anon, authenticated;
