-- Renomme la catégorie « Kia Seltos 2026 » en « Kia Seltos 2027 ».
-- Le slug d'URL (kia-seltos) ne change pas : /flotte/kia-seltos reste valable. La recherche se
-- fait par slug, donc la migration est sans effet si la catégorie a déjà été renommée à la main.
-- Les réservations, contrats et demandes pointent vers la catégorie par son identifiant : aucun
-- n'est touché. L'année du véhicule (vehicules.annee) n'est PAS modifiée ici.
--
-- À appliquer en même temps que la mise en ligne du code correspondant : la photo et les
-- textes de la carte d'accueil sont retrouvés par le nom (src/lib/fleet-images.ts, messages).
update public.categories_vehicules
   set nom = 'Kia Seltos 2027'
 where slug = 'kia-seltos'
   and nom = 'Kia Seltos 2026';
