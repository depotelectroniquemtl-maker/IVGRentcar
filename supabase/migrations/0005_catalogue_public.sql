-- Le catalogue (catégories de véhicules + tarifs) est du contenu vitrine public — il n'y a
-- pas de "prix d'achat" à cacher ici comme dans gestion-stock, le tarif affiché EST le
-- prix public. On ouvre donc la lecture à tout le monde (site public), en gardant l'écriture
-- réservée aux admins. Les unités individuelles (table vehicules, avec plaques) restent
-- réservées au staff.

drop policy "categories_select_staff" on public.categories_vehicules;
create policy "categories_select_public"
  on public.categories_vehicules for select
  using (true);

drop policy "tarifs_select_staff" on public.tarifs;
create policy "tarifs_select_public"
  on public.tarifs for select
  using (true);
