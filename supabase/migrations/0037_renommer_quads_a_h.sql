-- Renomme les 8 quads « QUAD 01 » à « QUAD 08 » en « Quad A » à « Quad H » (colonne plaque,
-- qui sert de désignation aux quads depuis 0009_quads_multiples.sql).
--
-- Ciblé PAR IDENTIFIANT, jamais par recherche de texte. Échoue sans rien modifier si :
--   - un des 8 identifiants n'existe pas ou n'a plus son nom d'origine ;
--   - un des noms cibles est déjà utilisé (plaque est unique) ;
--   - la mise à jour ne touche pas exactement 8 lignes.
--
-- Seule la colonne plaque change : set_updated_at (updated_at) et trg_sync_categorie_actif
-- (recalcul de categories_vehicules.actif, inchangé ici) sont suspendus le temps de la mise à
-- jour, puis réactivés dans la même transaction. Le déclencheur du journal reste actif :
-- 8 lignes « plaque : QUAD 0n → Quad X » apparaissent dans le journal d'activité.
--
-- Rien d'autre ne dépend du nom : aucune adresse de page (le slug quad-300cc vient de la
-- catégorie), aucun texte en dur ; le catalogue public n'affiche que la catégorie.
set local lock_timeout = '3s';

do $$
declare
  v_nb int;
begin
  create temp table quads_renommage (
    id uuid primary key,
    ancien text not null,
    nouveau text not null
  ) on commit drop;

  insert into quads_renommage (id, ancien, nouveau) values
    ('4ab99991-693f-4d6f-96b6-ff7379df0bff', 'QUAD 01', 'Quad A'),
    ('92b0fc49-9e71-4c6e-b5ee-03a780159f10', 'QUAD 02', 'Quad B'),
    ('898877cf-ab32-49a2-9201-819a98429237', 'QUAD 03', 'Quad C'),
    ('791852db-d51e-4090-a7a5-7b4504ac64cf', 'QUAD 04', 'Quad D'),
    ('9cd3baee-f978-4e9a-8ff7-eae408562e1c', 'QUAD 05', 'Quad E'),
    ('9d166717-b8a6-4012-aaff-e812ce787776', 'QUAD 06', 'Quad F'),
    ('71f0b448-2167-47b6-bffb-aeccb08efa59', 'QUAD 07', 'Quad G'),
    ('5d21338b-e711-4cc0-a17a-f424c4e45055', 'QUAD 08', 'Quad H');

  select count(*) into v_nb
  from public.vehicules v
  join quads_renommage q on q.id = v.id and v.plaque = q.ancien;
  if v_nb <> 8 then
    raise exception 'Garde : % quad(s) sur 8 ont l''identifiant et le nom attendus ; rien n''est modifié', v_nb;
  end if;

  if exists (select 1 from public.vehicules where plaque in (select nouveau from quads_renommage)) then
    raise exception 'Garde : un nom cible (Quad A à Quad H) existe déjà ; rien n''est modifié';
  end if;

  alter table public.vehicules disable trigger set_updated_at;
  alter table public.vehicules disable trigger trg_sync_categorie_actif;

  update public.vehicules v
  set plaque = q.nouveau
  from quads_renommage q
  where v.id = q.id and v.plaque = q.ancien;
  get diagnostics v_nb = row_count;
  if v_nb <> 8 then
    raise exception 'Garde : % ligne(s) modifiée(s) au lieu de 8 ; annulation', v_nb;
  end if;

  alter table public.vehicules enable trigger set_updated_at;
  alter table public.vehicules enable trigger trg_sync_categorie_actif;
end $$;

-- RETOUR ARRIÈRE (à exécuter d'un seul bloc ; doit toucher exactement 8 lignes) :
--
-- begin;
-- set local lock_timeout = '3s';
-- alter table public.vehicules disable trigger set_updated_at;
-- alter table public.vehicules disable trigger trg_sync_categorie_actif;
-- update public.vehicules v set plaque = r.ancien
-- from (values
--   ('4ab99991-693f-4d6f-96b6-ff7379df0bff'::uuid, 'QUAD 01', 'Quad A'),
--   ('92b0fc49-9e71-4c6e-b5ee-03a780159f10'::uuid, 'QUAD 02', 'Quad B'),
--   ('898877cf-ab32-49a2-9201-819a98429237'::uuid, 'QUAD 03', 'Quad C'),
--   ('791852db-d51e-4090-a7a5-7b4504ac64cf'::uuid, 'QUAD 04', 'Quad D'),
--   ('9cd3baee-f978-4e9a-8ff7-eae408562e1c'::uuid, 'QUAD 05', 'Quad E'),
--   ('9d166717-b8a6-4012-aaff-e812ce787776'::uuid, 'QUAD 06', 'Quad F'),
--   ('71f0b448-2167-47b6-bffb-aeccb08efa59'::uuid, 'QUAD 07', 'Quad G'),
--   ('5d21338b-e711-4cc0-a17a-f424c4e45055'::uuid, 'QUAD 08', 'Quad H')
-- ) as r(id, ancien, nouveau)
-- where v.id = r.id and v.plaque = r.nouveau;
-- alter table public.vehicules enable trigger set_updated_at;
-- alter table public.vehicules enable trigger trg_sync_categorie_actif;
-- commit;
