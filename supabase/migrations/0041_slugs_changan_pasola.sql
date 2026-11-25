-- Pages publiques /flotte/changan et /flotte/pasola-175cc : pose le slug des deux catégories
-- existantes « Changan » et « Pasola 175cc ». Aucune autre colonne ni aucune autre catégorie
-- n'est modifiée (nom, prix, état, véhicules et réservations inchangés).
--
-- Rejouable : sans effet si les slugs sont déjà posés. Si une catégorie est introuvable, ou si
-- elle porte déjà un autre slug, ou si le slug est déjà pris par une autre catégorie, la
-- migration s'arrête sans rien modifier.
--
-- Retour arrière (à la main) :
--   update public.categories_vehicules set slug = null where slug in ('changan', 'pasola-175cc');

set local lock_timeout = '3s';

do $$
declare
  r record;
begin
  for r in select * from (values ('Changan', 'changan'), ('Pasola 175cc', 'pasola-175cc')) as t(nom, slug) loop
    if not exists (select 1 from public.categories_vehicules where nom = r.nom) then
      raise exception 'Garde : catégorie « % » introuvable ; rien n''est modifié', r.nom;
    end if;
    if exists (select 1 from public.categories_vehicules where nom = r.nom and slug is not null and slug <> r.slug) then
      raise exception 'Garde : « % » porte déjà un autre slug ; rien n''est modifié', r.nom;
    end if;
    if exists (select 1 from public.categories_vehicules where slug = r.slug and nom <> r.nom) then
      raise exception 'Garde : le slug % est déjà utilisé par une autre catégorie ; rien n''est modifié', r.slug;
    end if;
  end loop;

  update public.categories_vehicules set slug = 'changan' where nom = 'Changan' and slug is null;
  update public.categories_vehicules set slug = 'pasola-175cc' where nom = 'Pasola 175cc' and slug is null;
end $$;
