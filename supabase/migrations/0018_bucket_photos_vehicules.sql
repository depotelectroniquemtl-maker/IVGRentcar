-- Bucket public pour les photos de véhicules — jusqu'ici photo_url n'était modifiable
-- qu'à la main (fichiers statiques échangés hors admin). Bucket public : la lecture passe
-- par l'URL CDN publique sans vérification RLS (comportement standard Supabase Storage
-- pour un bucket public), seules l'écriture/modification/suppression sont restreintes.
insert into storage.buckets (id, name, public)
values ('vehicules-photos', 'vehicules-photos', true)
on conflict (id) do nothing;

create policy "vehicules_photos_insert_staff"
  on storage.objects for insert
  with check (bucket_id = 'vehicules-photos' and public.est_staff());

create policy "vehicules_photos_update_staff"
  on storage.objects for update
  using (bucket_id = 'vehicules-photos' and public.est_staff())
  with check (bucket_id = 'vehicules-photos' and public.est_staff());

create policy "vehicules_photos_delete_staff"
  on storage.objects for delete
  using (bucket_id = 'vehicules-photos' and public.est_staff());
