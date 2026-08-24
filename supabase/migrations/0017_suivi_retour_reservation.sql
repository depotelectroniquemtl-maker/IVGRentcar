-- Suivi du retour physique du véhicule, indépendant du statut de réservation —
-- rempli quand le staff confirme que le véhicule est effectivement revenu, sert à
-- distinguer une réservation simplement "terminée" (dates passées) d'une réservation
-- "en retraso" (dates passées, véhicule pas encore rendu).
alter table public.reservations
  add column date_retour_reelle timestamptz;
