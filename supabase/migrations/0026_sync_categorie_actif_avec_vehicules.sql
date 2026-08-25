-- categories_vehicules.actif (visibilite publique du modele) et vehicules.actif (unite
-- physique) etaient deux reglages independants : desactiver l'unique vehicule d'une
-- categorie a une seule unite (Kia Seltos, Changan...) ne changeait rien dans Tarifs, ce qui
-- a cause de la confusion cote client. On synchronise desormais automatiquement : une
-- categorie est active des qu'elle a au moins un vehicule actif, inactive sinon. Le bouton
-- manuel de /admin/tarifs reste disponible pour forcer un etat entre deux mutations de
-- vehicule (ex: desactiver temporairement une categorie qui a encore des unites actives).
create or replace function public.sync_categorie_actif()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_categorie_id uuid;
begin
  v_categorie_id := coalesce(new.categorie_id, old.categorie_id);

  update public.categories_vehicules
  set actif = exists (
    select 1 from public.vehicules
    where categorie_id = v_categorie_id and actif = true
  )
  where id = v_categorie_id;

  -- Le vehicule a change de categorie : l'ancienne categorie doit aussi etre recalculee
  -- (elle peut perdre son dernier vehicule actif).
  if tg_op = 'UPDATE' and old.categorie_id is distinct from new.categorie_id then
    update public.categories_vehicules
    set actif = exists (
      select 1 from public.vehicules
      where categorie_id = old.categorie_id and actif = true
    )
    where id = old.categorie_id;
  end if;

  return null;
end;
$$;

drop trigger if exists trg_sync_categorie_actif on public.vehicules;
create trigger trg_sync_categorie_actif
  after insert or update or delete on public.vehicules
  for each row execute function public.sync_categorie_actif();

-- Applique la synchronisation retroactivement aux categories existantes, pour rattraper
-- l'etat actuel de la flotte avant que le trigger ne prenne le relais sur les prochains
-- changements.
update public.categories_vehicules c
set actif = exists (
  select 1 from public.vehicules v
  where v.categorie_id = c.id and v.actif = true
);
