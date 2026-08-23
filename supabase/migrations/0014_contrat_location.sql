-- Module "contrat de location" : digitalise les données du vrai contrat papier remis
-- au client à la prise en charge (identité légale, garant, état/accessoires du
-- véhicule, franchise/acompte/solde) pour pouvoir en générer un PDF imprimable
-- fidèle au document existant.

-- 1. Champs d'identité légale manquants sur les clients (collectés à la prise en
--    charge, pas à la réservation en ligne — donc tous nullables).
alter table public.clients
  add column cedula text,
  add column passeport text,
  add column passeport_expiration date,
  add column permis_expiration date,
  add column nationalite text,
  add column adresse text,
  add column residencia text;

-- 2. Couleur du véhicule (présente sur le contrat papier, absente de notre fiche
--    véhicule aujourd'hui).
alter table public.vehicules
  add column couleur text;

-- 3. Le contrat lui-même : un par réservation, rempli au moment de la remise des
--    clés. Le garant n'est pas rattaché durablement à un client (il peut varier
--    d'une location à l'autre) donc ses champs vivent ici, pas sur `clients`.
create table public.contrats_location (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null unique references public.reservations (id),
  heure_remise time,
  couleur_vehicule text,
  deducible_usd numeric check (deducible_usd is null or deducible_usd >= 0),
  abono_usd numeric check (abono_usd is null or abono_usd >= 0),
  solde_usd numeric check (solde_usd is null or solde_usd >= 0),
  niveau_essence text check (niveau_essence in ('E', '1/4', '1/2', '3/4', 'F')),
  -- Checklist d'accessoires/état à la remise, ex: {"aire_acondicionado": true, ...}
  -- — volontairement flexible (jsonb) plutôt que 22 colonnes booléennes séparées.
  accessoires jsonb not null default '{}'::jsonb,
  garant_nom text,
  garant_adresse text,
  garant_cedula text,
  garant_telephone text,
  notes text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_contrats_location_reservation on public.contrats_location (reservation_id);
create index idx_contrats_location_created_by on public.contrats_location (created_by);

alter table public.contrats_location enable row level security;

create policy "contrats_select_staff"
  on public.contrats_location for select
  using (public.est_staff());

create policy "contrats_insert_staff"
  on public.contrats_location for insert
  with check (public.est_staff());

create policy "contrats_update_staff"
  on public.contrats_location for update
  using (public.est_staff())
  with check (public.est_staff());

create policy "contrats_delete_admin"
  on public.contrats_location for delete
  using (public.est_admin());

create trigger set_updated_at before update on public.contrats_location
  for each row execute function public.set_updated_at();
