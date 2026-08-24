-- Montant encore dû sur l'achat/financement du véhicule lui-même (ex: crédit, somme due
-- à un ancien propriétaire) — distinct du solde client sur un contrat de location. Saisi
-- une fois par l'admin à la création du véhicule, sert au calcul de rentabilité.
alter table public.vehicules
  add column solde_achat_usd numeric(10, 2);
