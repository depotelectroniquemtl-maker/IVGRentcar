-- Demandes de réservation soumises depuis la vitrine publique (/reservar), avant
-- confirmation par le staff. Distinct de `reservations` (qui lie un client et un
-- véhicule précis une fois la demande traitée) : ici on ne connaît que la catégorie
-- souhaitée et les dates, pas encore de véhicule ni de fiche client.
--
-- Appliquée directement sur le projet distant (usipxmbcslwhaggqhozr) via un autre
-- outil le 2026-08-22 ; ce fichier ne fait que synchroniser l'historique local
-- (confirmé via list_migrations/list_tables MCP — ne pas réappliquer).

create table public.demandes_reservation (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  whatsapp text not null,
  email text,
  categorie_id uuid not null references public.categories_vehicules (id),
  date_debut date not null,
  date_fin date not null,
  lieu_prise_en_charge text,
  notes text,
  statut text not null default 'nouvelle'
    check (statut in ('nouvelle', 'contactee', 'convertie', 'rejetee')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dates_valides_demande check (date_fin >= date_debut)
);

create index idx_demandes_reservation_statut on public.demandes_reservation (statut);
create index idx_demandes_reservation_categorie on public.demandes_reservation (categorie_id);

alter table public.demandes_reservation enable row level security;

-- Insertion anonyme autorisée (formulaire public /reservar, sans authentification) ;
-- lecture/modification réservées au staff.
create policy "demandes_insert_public" on public.demandes_reservation
  for insert with check (true);
create policy "demandes_select_staff" on public.demandes_reservation
  for select using (public.est_staff());
create policy "demandes_update_staff" on public.demandes_reservation
  for update using (public.est_staff()) with check (public.est_staff());
create policy "demandes_delete_admin" on public.demandes_reservation
  for delete using (public.est_admin());

create trigger set_updated_at before update on public.demandes_reservation
  for each row execute function public.set_updated_at();

-- Disponibilité en direct pour une catégorie sur une plage de dates : au moins un
-- véhicule actif/disponible de cette catégorie sans réservation (non annulée) qui
-- chevauche la plage demandée. Utilisée par le formulaire public avant soumission.
create or replace function public.disponibilite_categorie(
  p_categorie_id uuid, p_date_debut date, p_date_fin date
) returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.vehicules v
    where v.categorie_id = p_categorie_id
      and v.actif and v.etat_operationnel = 'disponible'
      and not exists (
        select 1 from public.reservations r
        where r.vehicule_id = v.id and r.statut <> 'annulee'
          and daterange(r.date_debut, r.date_fin, '[]')
              && daterange(p_date_debut, p_date_fin, '[]')
      )
  );
$$;

revoke execute on function public.disponibilite_categorie(uuid, date, date) from public;
grant execute on function public.disponibilite_categorie(uuid, date, date) to anon, authenticated;
