-- Identifiant d'URL stable des catégories qui ont une page publique /flotte/<slug>.
-- Avant : la page était retrouvée par le NOM de la catégorie ; un renommage dans la base
-- faisait répondre 404. Désormais l'URL dépend de ce slug, qu'un renommage ne touche pas.
-- NULL = pas de page publique pour cette catégorie. Les slugs ci-dessous sont ceux des URLs
-- déjà en ligne : aucune URL ne change.
alter table public.categories_vehicules
  add column if not exists slug text
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

create unique index if not exists categories_vehicules_slug_unique
  on public.categories_vehicules (slug)
  where slug is not null;

update public.categories_vehicules set slug = 'quad-300cc' where nom = 'Quad 4 Roues 300cc' and slug is null;
update public.categories_vehicules set slug = 'kia-seltos' where nom = 'Kia Seltos 2026' and slug is null;
update public.categories_vehicules set slug = 'suzuki-xl7' where nom = 'Suzuki XL 7 Personas' and slug is null;
update public.categories_vehicules set slug = 'hyundai-tucson-4x4' where nom = 'Tucson 4x4' and slug is null;
