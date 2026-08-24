-- Le prix reste toujours contractuel en US$ (voir solde_usd, abono_usd) — ces deux
-- champs ne font que noter comment et dans quelle devise le client a réellement payé au
-- comptoir, pour la tenue de caisse. Un seul mode/devise par contrat (paiement principal),
-- pas de table de paiements multiples pour l'instant.
alter table public.contrats_location
  add column moyen_paiement text check (moyen_paiement in ('especes', 'carte')),
  add column devise_recue text check (devise_recue in ('usd', 'dop'));
