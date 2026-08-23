-- La plaque n'est pas toujours connue au moment de saisir un véhicule réel dans le parc
-- (immatriculation en cours, véhicule tout juste acheté). La contrainte "not null" empêchait
-- de saisir un véhicule tant que sa plaque n'était pas disponible. La contrainte "unique" reste
-- en place : Postgres traite plusieurs NULL comme distincts, donc plusieurs véhicules sans
-- plaque coexistent sans conflit.
alter table public.vehicules alter column plaque drop not null;
