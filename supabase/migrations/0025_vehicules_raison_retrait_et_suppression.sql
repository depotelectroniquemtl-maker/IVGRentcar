-- Motif du retrait de la flotte (vendu, accidenté...), saisi quand un véhicule est
-- désactivé — répond au besoin réel du client : les quads et vieilles voitures sont
-- parfois revendus, il faut pouvoir dire pourquoi sans se contenter d'un simple "Inactif".
alter table public.vehicules
  add column raison_retrait text;

-- entretiens_vehicule_id_fkey était en "on delete cascade" : supprimer un véhicule
-- effaçait silencieusement tout son historique d'entretien, sans le blocage qui protège
-- déjà les réservations (on delete restrict). Incohérent avec le principe déjà établi de
-- ne jamais perdre d'historique — un véhicule ayant des entretiens (mais aucune
-- réservation/demande/indisponibilité) doit maintenant bloquer la suppression comme les
-- autres, pas effacer discrètement ses entretiens.
alter table public.entretiens
  drop constraint entretiens_vehicule_id_fkey,
  add constraint entretiens_vehicule_id_fkey
    foreign key (vehicule_id) references public.vehicules (id) on delete restrict;
