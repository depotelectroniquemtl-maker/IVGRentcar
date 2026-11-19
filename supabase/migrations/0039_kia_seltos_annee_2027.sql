-- Année du véhicule de la catégorie « Kia Seltos 2027 » : 2026 -> 2027 (erreur de saisie corrigée).
-- Déjà appliquée en production (apply_migration « kia_seltos_annee_2027 ») ; ce fichier ne fait que
-- garder l'historique du dépôt aligné. Sans effet si l'année a déjà été corrigée.
update public.vehicules v
   set annee = 2027
  from public.categories_vehicules c
 where v.categorie_id = c.id
   and c.slug = 'kia-seltos'
   and v.annee = 2026;
