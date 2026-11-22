-- Ajoute la Kia Picanto 2027 à la flotte : une catégorie (slug kia-picanto), ses trois paliers
-- de tarifs et une seule unité. Aucune donnée existante n'est modifiée.
--
-- Ordre d'affichage : même valeur que la catégorie « Hyundai » ; le site trie ensuite par nom
-- (« Hyundai » < « Kia Picanto 2027 » < « Kia Seltos 2027 »), donc la Picanto apparaît juste
-- après la Hyundai sans décaler les autres catégories.
-- Caution (500 US$), boîte automatique et essence : pas de colonne en base, ces informations
-- sont dans les textes du site.
-- Plaque : NULL (en cours d'immatriculation ; autorisé depuis la migration 0007).
--
-- Rejouable : si tout existe déjà avec exactement ces valeurs, rien n'est fait. Si le slug ou le
-- nom existe avec des valeurs différentes, la migration s'arrête sans rien modifier.
-- Journal d'activité : les déclencheurs existants enregistrent les ajouts (sans auteur, comme
-- toute migration). Le déclencheur trg_sync_categorie_actif garde la catégorie active puisque
-- son unique véhicule est actif.

set local lock_timeout = '3s';

do $$
declare
  v_ordre int;
  v_cat public.categories_vehicules%rowtype;
  v_nb int;
begin
  select ordre_affichage into v_ordre from public.categories_vehicules where nom = 'Hyundai';
  if v_ordre is null then
    raise exception 'Garde : catégorie « Hyundai » introuvable, ordre d''affichage impossible à déterminer ; rien n''est modifié';
  end if;

  select count(*) into v_nb from public.categories_vehicules
  where slug = 'kia-picanto' or nom = 'Kia Picanto 2027';

  if v_nb > 1 then
    raise exception 'Garde : plusieurs catégories correspondent au slug ou au nom de la Picanto ; rien n''est modifié';
  end if;

  if v_nb = 1 then
    select * into v_cat from public.categories_vehicules
    where slug = 'kia-picanto' or nom = 'Kia Picanto 2027';
    -- Déjà présente : on vérifie qu'elle est identique, sinon on s'arrête.
    if v_cat.nom is distinct from 'Kia Picanto 2027'
       or v_cat.slug is distinct from 'kia-picanto'
       or v_cat.type is distinct from 'voiture'
       or v_cat.capacite_personnes is distinct from 5 then
      raise exception 'Garde : une catégorie Picanto existe avec des valeurs différentes ; rien n''est modifié';
    end if;
    select count(*) into v_nb from public.tarifs
    where categorie_id = v_cat.id
      and (palier, prix_usd) in (('1_3_jours', 55), ('4_plus_jours', 50), ('15_plus_jours', 45));
    if v_nb <> 3 or (select count(*) from public.tarifs where categorie_id = v_cat.id) <> 3 then
      raise exception 'Garde : les tarifs de la Picanto existent mais diffèrent ; rien n''est modifié';
    end if;
    if (select count(*) from public.vehicules where categorie_id = v_cat.id) <> 1
       or not exists (select 1 from public.vehicules
                      where categorie_id = v_cat.id and annee = 2027 and couleur = 'Gris argent') then
      raise exception 'Garde : le véhicule de la Picanto existe mais diffère ; rien n''est modifié';
    end if;
    raise notice 'Kia Picanto 2027 déjà présente avec les valeurs attendues : rien à faire';
    return;
  end if;

  insert into public.categories_vehicules (nom, slug, type, capacite_personnes, actif, ordre_affichage)
  values ('Kia Picanto 2027', 'kia-picanto', 'voiture', 5, true, v_ordre)
  returning * into v_cat;

  insert into public.tarifs (categorie_id, palier, prix_usd)
  values
    (v_cat.id, '1_3_jours', 55),
    (v_cat.id, '4_plus_jours', 50),
    (v_cat.id, '15_plus_jours', 45);

  insert into public.vehicules (categorie_id, plaque, annee, couleur, etat_operationnel, actif)
  values (v_cat.id, null, 2027, 'Gris argent', 'disponible', true);
end $$;

-- Retour arrière (à exécuter à la main, uniquement si la Picanto n'a encore AUCUNE réservation,
-- demande, entretien ni contrat ; les clés étrangères l'empêcheraient sinon) :
--
-- delete from public.vehicules
--  where categorie_id = (select id from public.categories_vehicules where slug = 'kia-picanto');
-- delete from public.categories_vehicules where slug = 'kia-picanto';  -- supprime aussi ses tarifs (cascade)
