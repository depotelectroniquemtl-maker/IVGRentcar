-- Complète 0018 : sans policy SELECT sur storage.objects, l'API Storage ne peut pas
-- localiser un objet pour le supprimer/lister (découvert en testant le nettoyage d'un
-- fichier de vérification — upload et lecture publique fonctionnaient déjà sans elle,
-- seules les opérations qui interrogent d'abord la table en ont besoin).
create policy "vehicules_photos_select_staff"
  on storage.objects for select
  using (bucket_id = 'vehicules-photos' and public.est_staff());
