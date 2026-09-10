-- Champ libre alphanumerique pour la reference/police d'assurance liee a une reservation
-- (ex: numero de police, nom de l'assureur...) -- saisi au niveau de la reservation, pas
-- du vehicule, puisque la couverture peut varier d'une location a l'autre. Affiche ensuite
-- sur le contrat imprimable (ContratPrintable).
alter table public.reservations
  add column assurance text;
