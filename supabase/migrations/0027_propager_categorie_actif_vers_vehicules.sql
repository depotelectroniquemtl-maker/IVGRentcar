-- Complete la synchronisation de la migration 0026 (vehicule -> categorie) dans l'autre
-- sens : quand un admin bascule manuellement categorie.actif depuis /admin/tarifs, ca
-- retombe maintenant sur les vehicules de cette categorie.
--   - Desactiver la categorie desactive tous ses vehicules actifs.
--   - Reactiver la categorie reactive ses vehicules inactifs -- SAUF ceux qui ont un
--     raison_retrait renseigne (vendu, accidente...) : un retrait individuel explicite ne
--     doit jamais etre annule par une reactivation globale de la categorie.
--
-- Garde-fou anti-boucle : pg_trigger_depth() > 1 signifie qu'on est arrive ici en cascade
-- depuis sync_categorie_actif() (migration 0026), pas depuis une ecriture directe de
-- l'admin -- sans ce garde-fou, reactiver UN SEUL vehicule dans une categorie a plusieurs
-- unites (ex: un quad parmi 8) ferait recalculer categorie.actif, qui rebondirait ici et
-- reactiverait TOUS les autres vehicules de la categorie par erreur.
create or replace function public.propagate_categorie_actif_to_vehicules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if pg_trigger_depth() > 1 then
    return null;
  end if;

  if new.actif = false then
    update public.vehicules
    set actif = false
    where categorie_id = new.id and actif = true;
  else
    update public.vehicules
    set actif = true
    where categorie_id = new.id and actif = false and raison_retrait is null;
  end if;

  return null;
end;
$$;

drop trigger if exists trg_propagate_categorie_actif on public.categories_vehicules;
create trigger trg_propagate_categorie_actif
  after update of actif on public.categories_vehicules
  for each row
  when (old.actif is distinct from new.actif)
  execute function public.propagate_categorie_actif_to_vehicules();
