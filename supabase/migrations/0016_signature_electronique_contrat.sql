-- Signature électronique du contrat de location, capturée à l'écran (SignaturePad)
-- comme alternative à la signature papier. signature_client sert elle-même
-- d'indicateur "signé électroniquement" — pas besoin d'une colonne mode séparée.
alter table public.contrats_location
  add column signature_client text,
  add column signe_a timestamptz;
