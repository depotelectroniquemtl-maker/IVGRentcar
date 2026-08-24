drop view if exists public.vehicules_disponibilite;
create view public.vehicules_disponibilite
with (security_invoker = true) as
select
  v.*,
  c.nom as categorie_nom,
  c.type as categorie_type,
  exists (
    select 1 from public.reservations r
    where r.vehicule_id = v.id
      and r.statut <> 'annulee'
      and current_date between r.date_debut and r.date_fin
  ) as loue_aujourd_hui
from public.vehicules v
join public.categories_vehicules c on c.id = v.categorie_id;

comment on view public.vehicules_disponibilite is 'Statut "loué aujourd''hui" toujours calculé depuis les réservations. security_invoker=true pour respecter le RLS de l''utilisateur qui interroge. categorie_type ajouté pour distinguer voiture/scooter/quad dans la liste admin, séparément du nom du modèle.';
