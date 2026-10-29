-- Sécurisation des demandes publiques (/reservar) — ÉTAPE ADDITIVE.
--
-- Crée la fonction creer_demande_publique, unique chemin d'insertion prévu pour les demandes
-- du site public. Appelée UNIQUEMENT par la route serveur /api/demandes avec la clé
-- service_role (EXECUTE retiré à public, anon et authenticated). Elle :
--   - revalide chaque champ (longueurs, E.164, langue) — le navigateur n'est pas digne de confiance ;
--   - force statut = 'nouvelle' (aucun paramètre de statut) ;
--   - refuse les dates incohérentes : fin avant début, début dans le passé (marge d'un jour,
--     fuseau America/Santo_Domingo), durée supérieure à 180 jours ;
--   - revérifie la disponibilité du véhicule précis avec disponibilite_vehicule (véhicule
--     inexistant, inactif, hors service, réservé ou bloqué => refus) ;
--   - recalcule le prix avec calculer_prix_total (catégorie du véhicule) : le prix envoyé par
--     le navigateur n'est jamais utilisé ;
--   - limite à 5 demandes par heure pour un même numéro WhatsApp (verrou consultatif par
--     numéro pour que deux envois simultanés ne contournent pas le seuil).
-- Les erreurs sont levées avec un code applicatif stable (message 'demande_<code>') que la
-- route traduit en statut HTTP.
--
-- Ne supprime RIEN : la policy "demandes_insert_public" et les droits existants restent en
-- place, l'ancien chemin d'insertion continue de fonctionner (retrait dans 0035).
-- Aucune ligne existante de demandes_reservation n'est modifiée. Seul ajout sur la table :
-- un index (whatsapp, created_at) pour le comptage du seuil horaire.
--
-- RETOUR ARRIÈRE :
--   drop function if exists public.creer_demande_publique(
--     text, text, text, uuid, date, date, time, time, text, text, text);
--   drop index if exists public.idx_demandes_reservation_whatsapp_created;

create index if not exists idx_demandes_reservation_whatsapp_created
  on public.demandes_reservation (whatsapp, created_at);

create or replace function public.creer_demande_publique(
  p_nom text,
  p_whatsapp text,
  p_email text,
  p_vehicule_id uuid,
  p_date_debut date,
  p_date_fin date,
  p_heure_debut time,
  p_heure_fin time,
  p_lieu_prise_en_charge text,
  p_notes text,
  p_langue text
)
returns table (demande_id uuid, prix_estime_usd numeric, categorie_nom text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_nom text := nullif(btrim(coalesce(p_nom, '')), '');
  v_email text := nullif(btrim(coalesce(p_email, '')), '');
  v_lieu text := nullif(btrim(coalesce(p_lieu_prise_en_charge, '')), '');
  v_notes text := nullif(btrim(coalesce(p_notes, '')), '');
  v_aujourdhui date := (now() at time zone 'America/Santo_Domingo')::date;
  v_categorie_id uuid;
  v_categorie_nom text;
  v_prix numeric;
  v_id uuid;
begin
  -- Champs texte (mêmes limites que la route /api/demandes).
  if v_nom is null or length(v_nom) > 200
     or p_whatsapp is null or p_whatsapp !~ '^\+[1-9][0-9]{6,14}$'
     or (v_email is not null and length(v_email) > 254)
     or (v_lieu is not null and length(v_lieu) > 500)
     or (v_notes is not null and length(v_notes) > 2000)
     or (p_langue is not null and p_langue not in ('fr', 'en', 'es'))
     or p_vehicule_id is null then
    raise exception 'demande_champ_invalide' using errcode = 'P0001';
  end if;

  -- Dates.
  if p_date_debut is null or p_date_fin is null
     or p_date_fin < p_date_debut
     or p_date_debut < v_aujourdhui - 1
     or p_date_fin - p_date_debut > 180 then
    raise exception 'demande_dates_invalides' using errcode = 'P0001';
  end if;

  -- Seuil horaire par numéro, sérialisé par numéro.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('demande:' || p_whatsapp, 0));
  if (
    select count(*) from public.demandes_reservation d
    where d.whatsapp = p_whatsapp and d.created_at > now() - interval '1 hour'
  ) >= 5 then
    raise exception 'demande_trop_de_demandes' using errcode = 'P0001';
  end if;

  -- Disponibilité du véhicule précis (inclut existence, actif et état opérationnel).
  if not coalesce(public.disponibilite_vehicule(p_vehicule_id, p_date_debut, p_date_fin), false) then
    raise exception 'demande_vehicule_indisponible' using errcode = 'P0001';
  end if;

  select v.categorie_id, c.nom into v_categorie_id, v_categorie_nom
  from public.vehicules v
  join public.categories_vehicules c on c.id = v.categorie_id
  where v.id = p_vehicule_id;

  -- Prix recalculé côté serveur ; NULL si aucun tarif (comme l'affichage du formulaire).
  v_prix := public.calculer_prix_total(v_categorie_id, p_date_debut, p_date_fin);

  insert into public.demandes_reservation (
    nom, whatsapp, email, vehicule_id, date_debut, date_fin, heure_debut, heure_fin,
    lieu_prise_en_charge, notes, prix_estime_usd, langue, statut
  ) values (
    v_nom, p_whatsapp, v_email, p_vehicule_id, p_date_debut, p_date_fin, p_heure_debut, p_heure_fin,
    v_lieu, v_notes, v_prix, p_langue, 'nouvelle'
  )
  returning id into v_id;

  return query select v_id, v_prix, v_categorie_nom;
end;
$$;

revoke all on function public.creer_demande_publique(
  text, text, text, uuid, date, date, time, time, text, text, text
) from public, anon, authenticated;
grant execute on function public.creer_demande_publique(
  text, text, text, uuid, date, date, time, time, text, text, text
) to service_role;
