-- Corrections suite à get_advisors (audit fait tout de suite après la première migration,
-- pas des mois plus tard comme sur gestion-stock) :
--   1) Vues en security_invoker : sinon elles contournent le RLS de l'utilisateur qui
--      interroge et appliquent les droits du créateur — l'inverse de ce qu'on veut.
--   2) search_path fixe sur set_updated_at (même réflexe que sur est_admin/est_staff).
--   3) btree_gist déplacé hors du schéma public.
--   4) Fonctions internes (est_admin, est_staff, handle_new_user) pas exposées en RPC public.

drop view if exists public.reservations_avec_phase;
create view public.reservations_avec_phase
with (security_invoker = true) as
select
  r.*,
  case
    when r.statut = 'annulee' then 'annulee'
    when current_date < r.date_debut then 'a_venir'
    when current_date between r.date_debut and r.date_fin then 'en_cours'
    else 'terminee'
  end as phase
from public.reservations r;

drop view if exists public.vehicules_disponibilite;
create view public.vehicules_disponibilite
with (security_invoker = true) as
select
  v.*,
  c.nom as categorie_nom,
  exists (
    select 1 from public.reservations r
    where r.vehicule_id = v.id
      and r.statut <> 'annulee'
      and current_date between r.date_debut and r.date_fin
  ) as loue_aujourd_hui
from public.vehicules v
join public.categories_vehicules c on c.id = v.categorie_id;

comment on view public.vehicules_disponibilite is 'Statut "loué aujourd''hui" toujours calculé depuis les réservations. security_invoker=true pour respecter le RLS de l''utilisateur qui interroge.';

alter function public.set_updated_at() set search_path = public;

alter extension btree_gist set schema extensions;

revoke execute on function public.est_admin() from public, anon;
revoke execute on function public.est_staff() from public, anon;
grant execute on function public.est_admin() to authenticated;
grant execute on function public.est_staff() to authenticated;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
