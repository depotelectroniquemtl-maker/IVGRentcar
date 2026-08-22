-- Corrections suite à get_advisors (performance) : index manquants sur les clés
-- étrangères, et appel de auth.uid() encapsulé dans un sous-select pour que Postgres
-- l'évalue une seule fois par requête plutôt que ligne par ligne.

create index if not exists idx_clients_created_by on public.clients (created_by);
create index if not exists idx_reservations_client_id on public.reservations (client_id);
create index if not exists idx_reservations_vehicule_id on public.reservations (vehicule_id);
create index if not exists idx_reservations_created_by on public.reservations (created_by);
create index if not exists idx_vehicules_categorie_id on public.vehicules (categorie_id);
create index if not exists idx_tarifs_categorie_id on public.tarifs (categorie_id);

drop policy "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = (select auth.uid()) or public.est_admin());
