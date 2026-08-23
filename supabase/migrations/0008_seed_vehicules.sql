-- Premières unités physiques réelles du parc, une par catégorie déjà seedée dans
-- categories_vehicules (0002_seed_flotte.sql). Plaques pas encore connues côté client
-- (immatriculation en cours) : laissées à null, à compléter plus tard depuis l'admin.
-- Kia Seltos 2026 est le seul modèle dont l'année est déjà certaine (elle est dans le nom).
insert into public.vehicules (categorie_id, plaque, annee, etat_operationnel, actif)
values
  ((select id from public.categories_vehicules where nom = 'Changan'), null, null, 'disponible', true),
  ((select id from public.categories_vehicules where nom = 'Chevrolet 4x4'), null, null, 'disponible', true),
  ((select id from public.categories_vehicules where nom = 'Hyundai'), null, null, 'disponible', true),
  ((select id from public.categories_vehicules where nom = 'Kia Seltos 2026'), null, 2026, 'disponible', true),
  ((select id from public.categories_vehicules where nom = 'Pasola 175cc'), null, null, 'disponible', true),
  ((select id from public.categories_vehicules where nom = 'Quad 4 Roues 300cc'), null, null, 'disponible', true),
  ((select id from public.categories_vehicules where nom = 'Suzuki XL 7 Personas'), null, null, 'disponible', true),
  ((select id from public.categories_vehicules where nom = 'Tucson 4x4'), null, null, 'disponible', true);
