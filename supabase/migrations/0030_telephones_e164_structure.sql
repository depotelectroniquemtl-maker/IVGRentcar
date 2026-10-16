-- Lot C : numéros de téléphone en E.164 — STRUCTURE seulement (aucune donnée existante modifiée).
--
-- - langue : langue du site au moment de la demande (fr/en/es), pour écrire au client dans
--   sa langue depuis /admin/demandes. NULL pour les anciennes demandes (traitées en français).
-- - whatsapp_original / telephone_original : copie du numéro tel que saisi, conservée avant
--   toute normalisation (la normalisation des données existantes est une migration séparée,
--   appliquée uniquement après accord).
-- - whatsapp_a_verifier / telephone_a_verifier : pays du numéro incertain, à confirmer à la main.
-- - Trigger : toute NOUVELLE demande doit porter un numéro E.164 valide. La policy publique
--   "demandes_insert_public" autorise l'insertion directe depuis le navigateur ; ce contrôle
--   empêche donc de contourner la validation de la route /api/demandes. Volontairement un
--   trigger BEFORE INSERT et non une contrainte CHECK : une contrainte bloquerait aussi les
--   changements de statut sur les anciennes demandes tant qu'elles ne sont pas normalisées.

alter table public.demandes_reservation
  add column if not exists langue text check (langue in ('fr', 'en', 'es')),
  add column if not exists whatsapp_original text,
  add column if not exists whatsapp_a_verifier boolean not null default false;

alter table public.clients
  add column if not exists telephone_original text,
  add column if not exists telephone_a_verifier boolean not null default false;

create or replace function public.verifier_whatsapp_e164()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.whatsapp !~ '^\+[1-9][0-9]{6,14}$' then
    raise exception 'Numéro WhatsApp invalide : format E.164 requis (ex. +33665439979)'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists demandes_verifier_whatsapp_e164 on public.demandes_reservation;
create trigger demandes_verifier_whatsapp_e164
  before insert on public.demandes_reservation
  for each row execute function public.verifier_whatsapp_e164();
