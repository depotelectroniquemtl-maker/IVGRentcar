-- Fiche garant réutilisable — jusqu'ici les infos du garant (nom, adresse, cédula,
-- téléphone) n'existaient que resaisies à chaque contrat (contrats_location.garant_*),
-- aucun moyen de réutiliser un garant déjà connu. garant_id est une référence optionnelle
-- ("set null" à la suppression, pas "restrict") : les champs texte de contrats_location
-- restent la source de vérité imprimée sur le contrat (fidélité papier, valeur au moment
-- de la signature), garant_id sert seulement au pré-remplissage/à la réutilisation future.
create table public.garants (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  telephone text,
  cedula text,
  adresse text,
  notes text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.garants enable row level security;

create policy "garants_select_staff" on public.garants for select using (public.est_staff());
create policy "garants_insert_staff" on public.garants for insert with check (public.est_staff());
create policy "garants_update_staff" on public.garants for update using (public.est_staff()) with check (public.est_staff());
create policy "garants_delete_admin" on public.garants for delete using (public.est_admin());

create trigger set_updated_at before update on public.garants
  for each row execute function public.set_updated_at();

alter table public.contrats_location
  add column garant_id uuid references public.garants (id) on delete set null;
