# Migrations de production absentes du dépôt

Le dossier `supabase/migrations` ne contient pas toutes les migrations appliquées en production.
Ce document les recense **pour mémoire** : il ne faut **ni les rejouer ni les recopier** dans
`supabase/migrations` (elles sont déjà appliquées et ne s'appliqueraient de toute façon qu'une fois).

La liste de référence est la table `supabase_migrations.schema_migrations` de la production.

## `20261016174441 telephones_514_438_canada`

- **Appliquée le :** 16 octobre 2026, juste après `normaliser_telephones_existants`
  (dépôt : `0031_normaliser_telephones_existants.sql`).
- **But :** compléter la normalisation des téléphones au format E.164. Les numéros à 10 chiffres
  commençant par **514** ou **438** (indicatifs de Montréal) n'avaient pas pu être normalisés
  automatiquement, faute d'indicatif pays, et étaient restés « à vérifier ».
- **Ce qu'elle fait :**
  - `demandes_reservation` : pour chaque ligne `whatsapp_a_verifier = true` dont le numéro, une
    fois les caractères non numériques retirés, compte exactement 10 chiffres commençant par 514
    ou 438, `whatsapp` devient `+1` suivi de ces 10 chiffres, et `whatsapp_a_verifier = false` ;
  - `clients` : même traitement sur `telephone` et `telephone_a_verifier`.
- **Ce qu'elle ne fait pas :** elle ne crée aucune table, colonne, fonction ni règle d'accès ; elle
  ne touche pas aux colonnes `*_original` (le numéro saisi à l'origine y reste).
- **Pourquoi elle n'est pas dans le dépôt :** elle a été appliquée directement en production, sans
  fichier correspondant. Comme elle ne modifie que des données déjà en place (aucune structure),
  une base recréée à partir du dépôt n'en a pas besoin.

SQL appliqué (copie de `schema_migrations.statements`, pour information seulement) :

```sql
update public.demandes_reservation
set whatsapp = '+1' || regexp_replace(whatsapp, '[^0-9]', '', 'g'),
    whatsapp_a_verifier = false
where whatsapp_a_verifier
  and regexp_replace(whatsapp, '[^0-9]', '', 'g') ~ '^(514|438)[0-9]{7}$';

update public.clients
set telephone = '+1' || regexp_replace(telephone, '[^0-9]', '', 'g'),
    telephone_a_verifier = false
where telephone_a_verifier
  and regexp_replace(telephone, '[^0-9]', '', 'g') ~ '^(514|438)[0-9]{7}$';
```

## Autres écarts de nommage constatés (30 octobre 2026)

Pas de migration manquante, mais des noms qui diffèrent entre le dépôt et la production :

- **Journal d'activité :** la production a deux entrées, `creer_journal_activite` et
  `durcir_fn_journaliser_activite` ; le dépôt a un seul fichier,
  `0028_documenter_journal_activite_existant.sql`.
- **Téléphones :** le dépôt a `0030_telephones_e164_structure.sql` ; aucune entrée de ce nom en
  production (la structure correspondante est en place).
