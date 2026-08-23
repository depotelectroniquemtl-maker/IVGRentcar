-- Gestion d'entretien — historique des interventions par véhicule (troisième point
-- demandé par le client, après la gestion complète des réservations et la saisie du
-- parc réel). Reste bien séparé de vehicules.etat_operationnel : ce dernier est le drapeau
-- "roulant / en panne" que le staff bascule au quotidien (déjà en place depuis 0001_init.sql),
-- alors qu'entretiens est un historique horodaté (quoi, quand, combien, prochaine échéance).
-- Volontairement pas de mise à jour automatique de etat_operationnel depuis cette table :
-- deux décisions humaines distinctes, un véhicule peut très bien recevoir un entretien
-- préventif sans jamais sortir de l'état "disponible".

create table public.entretiens (
  id uuid primary key default gen_random_uuid(),
  vehicule_id uuid not null references public.vehicules (id) on delete cascade,
  type text not null default 'autre'
    check (type in ('vidange', 'freins', 'pneus', 'reparation', 'inspection', 'autre')),
  date_entretien date not null default current_date,
  cout_usd numeric(10, 2) check (cout_usd is null or cout_usd >= 0),
  prochain_entretien date,
  notes text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.entretiens is 'Historique d''entretien par véhicule : type d''intervention, date, coût, prochaine échéance. Ne modifie jamais vehicules.etat_operationnel automatiquement.';

alter table public.entretiens enable row level security;

create policy "entretiens_select_staff" on public.entretiens for select using (public.est_staff());
create policy "entretiens_insert_staff" on public.entretiens for insert with check (public.est_staff());
create policy "entretiens_update_staff" on public.entretiens for update using (public.est_staff()) with check (public.est_staff());
create policy "entretiens_delete_admin" on public.entretiens for delete using (public.est_admin());

create index idx_entretiens_vehicule_id on public.entretiens (vehicule_id);
create index idx_entretiens_created_by on public.entretiens (created_by);

create trigger set_updated_at before update on public.entretiens for each row execute function public.set_updated_at();
