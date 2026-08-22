-- IVGRentcar — schéma initial
-- Principes appliqués dès cette première migration (leçons du projet gestion-stock) :
--   1) RLS par rôle dès le départ (fonction est_admin(), pas juste "authenticated")
--   2) Séparation données de référence (catégories, tarifs, véhicules) vs transactionnelles (réservations, clients)
--   3) Statuts calculés plutôt que saisis à la main quand c'est possible (voir vues en bas)
--   4) Une location n'est pas une vente : pas de "quantité en stock", mais un calendrier de
--      disponibilité par véhicule individuel, avec une contrainte DB qui empêche le double-booking.

create extension if not exists "btree_gist";
create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. PROFILS / RÔLES
-- ============================================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nom text not null,
  role text not null default 'employe' check (role in ('admin', 'employe')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Un profil par compte staff (admin ou employé). Pas de rôle "client" ici : les clients de location sont dans la table clients, séparée.';

-- Fonction utilisée par les policies pour savoir si l'utilisateur connecté est admin.
-- security definer + search_path fixe pour éviter les pièges classiques de RLS récursive.
create or replace function public.est_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Vrai pour tout compte staff connecté (admin ou employé), utilisé partout où
-- "n'importe quel membre de l'équipe" doit avoir accès (par opposition à "authenticated"
-- tout court, qui inclurait un jour d'éventuels comptes clients publics).
create or replace function public.est_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.est_admin());

create policy "profiles_insert_admin"
  on public.profiles for insert
  with check (public.est_admin());

create policy "profiles_update_admin"
  on public.profiles for update
  using (public.est_admin())
  with check (public.est_admin());

create policy "profiles_delete_admin"
  on public.profiles for delete
  using (public.est_admin());

-- ============================================================================
-- 2. DONNÉES DE RÉFÉRENCE : catégories de véhicules + tarifs par palier
-- ============================================================================

create table public.categories_vehicules (
  id uuid primary key default gen_random_uuid(),
  nom text not null unique,
  type text not null default 'voiture' check (type in ('voiture', 'quad', 'scooter')),
  capacite_personnes int,
  actif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.categories_vehicules is 'Catégorie/modèle générique (ex: "Tucson 4x4"), séparée des unités physiques individuelles (table vehicules).';

create table public.tarifs (
  id uuid primary key default gen_random_uuid(),
  categorie_id uuid not null references public.categories_vehicules (id) on delete cascade,
  palier text not null check (palier in ('1_3_jours', '4_plus_jours', '15_plus_jours')),
  prix_usd numeric(10, 2) not null check (prix_usd >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (categorie_id, palier)
);

comment on table public.tarifs is 'Grille tarifaire par catégorie et palier de durée — table séparée et modifiable, indépendante du client (pas de prix par revendeur ici, contrairement à gestion-stock).';

alter table public.categories_vehicules enable row level security;
alter table public.tarifs enable row level security;

create policy "categories_select_staff" on public.categories_vehicules for select using (public.est_staff());
create policy "categories_write_admin" on public.categories_vehicules for insert with check (public.est_admin());
create policy "categories_update_admin" on public.categories_vehicules for update using (public.est_admin()) with check (public.est_admin());
create policy "categories_delete_admin" on public.categories_vehicules for delete using (public.est_admin());

create policy "tarifs_select_staff" on public.tarifs for select using (public.est_staff());
create policy "tarifs_write_admin" on public.tarifs for insert with check (public.est_admin());
create policy "tarifs_update_admin" on public.tarifs for update using (public.est_admin()) with check (public.est_admin());
create policy "tarifs_delete_admin" on public.tarifs for delete using (public.est_admin());

-- ============================================================================
-- 3. VÉHICULES — unités physiques individuelles (plaque, état mécanique)
-- ============================================================================

create table public.vehicules (
  id uuid primary key default gen_random_uuid(),
  categorie_id uuid not null references public.categories_vehicules (id) on delete restrict,
  plaque text not null unique,
  annee int,
  photo_url text,
  -- état MÉCANIQUE/opérationnel : c'est une vraie décision humaine (le staff sait si un
  -- véhicule est en panne), donc saisi à la main. Ce n'est PAS le statut "loué en ce moment",
  -- qui lui est toujours calculé à partir des réservations (voir vue vehicules_disponibilite).
  etat_operationnel text not null default 'disponible'
    check (etat_operationnel in ('disponible', 'maintenance', 'hors_service')),
  notes text,
  actif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vehicules enable row level security;

create policy "vehicules_select_staff" on public.vehicules for select using (public.est_staff());
create policy "vehicules_insert_admin" on public.vehicules for insert with check (public.est_admin());
create policy "vehicules_update_staff" on public.vehicules for update using (public.est_staff()) with check (public.est_staff());
create policy "vehicules_delete_admin" on public.vehicules for delete using (public.est_admin());

-- ============================================================================
-- 4. CLIENTS (locataires) — données transactionnelles
-- ============================================================================

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  telephone text,
  email text,
  numero_permis text,
  notes text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clients enable row level security;

create policy "clients_select_staff" on public.clients for select using (public.est_staff());
create policy "clients_insert_staff" on public.clients for insert with check (public.est_staff());
create policy "clients_update_staff" on public.clients for update using (public.est_staff()) with check (public.est_staff());
create policy "clients_delete_admin" on public.clients for delete using (public.est_admin());

-- ============================================================================
-- 5. RÉSERVATIONS — le cœur du modèle "location, pas vente"
-- ============================================================================

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  vehicule_id uuid not null references public.vehicules (id) on delete restrict,
  client_id uuid not null references public.clients (id) on delete restrict,
  date_debut date not null,
  date_fin date not null,
  -- Décision métier (le staff confirme ou annule) — pas calculable, donc saisi à la main.
  -- La phase temporelle (à venir / en cours / terminée) elle EST calculée : voir la vue
  -- reservations_avec_phase plus bas, plutôt que d'ajouter ici un statut "en_cours" qu'on
  -- oublierait de mettre à jour chaque jour.
  statut text not null default 'confirmee' check (statut in ('en_attente', 'confirmee', 'annulee')),
  prix_total_usd numeric(10, 2),
  caution_usd numeric(10, 2),
  notes text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dates_valides check (date_fin >= date_debut)
);

-- Empêche au niveau base de données deux réservations actives qui se chevauchent sur le
-- même véhicule — impossible à contourner depuis l'interface, contrairement à une simple
-- vérification côté application.
alter table public.reservations
  add constraint pas_de_chevauchement
  exclude using gist (
    vehicule_id with =,
    daterange(date_debut, date_fin, '[]') with &&
  )
  where (statut <> 'annulee');

alter table public.reservations enable row level security;

create policy "reservations_select_staff" on public.reservations for select using (public.est_staff());
create policy "reservations_insert_staff" on public.reservations for insert with check (public.est_staff());
create policy "reservations_update_staff" on public.reservations for update using (public.est_staff()) with check (public.est_staff());
create policy "reservations_delete_admin" on public.reservations for delete using (public.est_admin());

-- ============================================================================
-- 6. STATUTS CALCULÉS — vues, jamais de colonne à mettre à jour manuellement
-- ============================================================================

create view public.reservations_avec_phase as
select
  r.*,
  case
    when r.statut = 'annulee' then 'annulee'
    when current_date < r.date_debut then 'a_venir'
    when current_date between r.date_debut and r.date_fin then 'en_cours'
    else 'terminee'
  end as phase
from public.reservations r;

create view public.vehicules_disponibilite as
select
  v.*,
  c.nom as categorie_nom,
  exists (
    select 1 from public.reservations r
    where r.vehicule_id = v.id
      and r.statut <> 'annulee'
      and current_date between r.date_debut and r.date_fin
  ) as loue_aujourd_hui
from public.vehicules v
join public.categories_vehicules c on c.id = v.categorie_id;

comment on view public.vehicules_disponibilite is 'Statut "loué aujourd''hui" toujours calculé depuis les réservations — jamais une colonne saisie à la main.';

-- ============================================================================
-- 7. updated_at automatique
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.categories_vehicules for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.tarifs for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.vehicules for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.clients for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.reservations for each row execute function public.set_updated_at();

-- ============================================================================
-- 8. Nouveau compte staff → profil automatique (rôle par défaut : employe)
--    Le tout premier admin doit être promu manuellement une fois (voir README).
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nom, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nom', new.email), 'employe');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
