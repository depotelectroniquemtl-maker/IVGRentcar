-- Le client possède en réalité 8 quads (0008_seed_vehicules.sql n'en avait seedé qu'un
-- seul, une unité par catégorie). Identifiés temporairement "QUAD 01".."QUAD 08" dans la
-- colonne plaque en attendant les vraies plaques d'immatriculation.
update public.vehicules
set plaque = 'QUAD 01'
where categorie_id = (select id from public.categories_vehicules where nom = 'Quad 4 Roues 300cc')
  and plaque is null;

insert into public.vehicules (categorie_id, plaque, etat_operationnel, actif)
select
  (select id from public.categories_vehicules where nom = 'Quad 4 Roues 300cc'),
  'QUAD ' || lpad(n::text, 2, '0'),
  'disponible',
  true
from generate_series(2, 8) as n;
