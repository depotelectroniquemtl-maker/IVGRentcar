alter table public.categories_vehicules
  add column ordre_affichage integer not null default 0;

-- Backfill sur l'ordre alphabétique actuel, pour que l'affichage public ne change pas
-- tant qu'un admin n'a pas explicitement réordonné depuis /admin/tarifs.
with ordered as (
  select id, row_number() over (order by nom) as rn
  from public.categories_vehicules
)
update public.categories_vehicules c
set ordre_affichage = ordered.rn
from ordered
where ordered.id = c.id;
