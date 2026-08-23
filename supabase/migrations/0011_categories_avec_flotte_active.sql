-- La vitrine publique ("Notre flotte") doit refléter le parc réel : une catégorie ne
-- s'affiche que s'il existe au moins une unité active dans vehicules. La table vehicules
-- reste réservée au staff (plaques, notes internes — cf. 0005_catalogue_public.sql), donc
-- pas question d'ouvrir sa lecture au public pour faire ce filtre côté client. Même
-- philosophie que disponibilite_categorie() (0006) : une fonction security definer qui ne
-- révèle qu'un signal dérivé (ici, "quelles catégories ont au moins un véhicule actif"),
-- jamais les lignes elles-mêmes.
create or replace function public.categories_avec_flotte_active()
returns table (categorie_id uuid)
language sql
security definer
set search_path = public
stable
as $$
  select distinct v.categorie_id
  from public.vehicules v
  where v.actif = true;
$$;

revoke execute on function public.categories_avec_flotte_active() from public;
grant execute on function public.categories_avec_flotte_active() to anon, authenticated;
