-- Lot C : normalisation prudente des numéros existants vers E.164.
-- 1) L'original est TOUJOURS copié avant toute modification (whatsapp_original / telephone_original).
-- 2) Seuls les numéros dont le pays est certain sont normalisés :
--      "+..." ou "00..." valides, ou 11 chiffres commençant par 1 (indicatif nord-américain).
--    Tout le reste est laissé tel quel et marqué « à vérifier » (aucun pays deviné).
create or replace function pg_temp.norm_e164(raw text) returns text
language sql immutable as $$
  with c as (select regexp_replace(coalesce(raw, ''), '[^0-9+]', '', 'g') as s),
  d as (
    select case
      when s ~ '^\+' then s
      when s ~ '^00' then '+' || substr(s, 3)
      when s ~ '^1[2-9][0-9]{9}$' then '+' || s
      else null
    end as e from c
  )
  select case
    when e ~ '^\+1[2-9][0-9]{9}$' then e
    when e ~ '^\+33[1-9][0-9]{8}$' then e
    when e ~ '^\+(?!1|33)[1-9][0-9]{7,14}$' then e
    else null
  end from d
$$;

update public.demandes_reservation
set whatsapp_original = coalesce(whatsapp_original, whatsapp),
    whatsapp_a_verifier = pg_temp.norm_e164(whatsapp) is null,
    whatsapp = coalesce(pg_temp.norm_e164(whatsapp), whatsapp)
where whatsapp_original is null;

update public.clients
set telephone_original = coalesce(telephone_original, telephone),
    telephone_a_verifier = pg_temp.norm_e164(telephone) is null,
    telephone = coalesce(pg_temp.norm_e164(telephone), telephone)
where telephone is not null and telephone_original is null;
