-- Lot C : lien demande -> réservation, pour afficher « Voir la réservation » sur une demande
-- déjà convertie. Colonne nullable : les réservations existantes (et celles créées à la main)
-- n'ont pas de demande, et les anciennes demandes converties restent sans lien (impossible
-- de deviner la réservation correspondante). L'index unique empêche de convertir deux fois
-- la même demande.
alter table public.reservations
  add column if not exists demande_id uuid
    references public.demandes_reservation(id) on delete set null;

create unique index if not exists reservations_demande_id_unique
  on public.reservations (demande_id)
  where demande_id is not null;
