# IVGRentcar — I.V.J Polanco Rent a Car

Site vitrine (ES/EN/FR) + panneau interne de gestion des locations pour I.V.J Polanco
Rent a Car (Las Terrenas, R.D.), client : Karim.

## ⚠️ Sécurité — à vérifier

Le tableau de bord Supabase peut autoriser l'inscription publique par défaut. L'application
n'a **pas** de page d'inscription (les comptes staff sont créés par un admin, écran
« Utilisateurs »). Il faut donc désactiver l'inscription publique :

**Supabase Dashboard → projet `ivgrentcar` → Authentication → Providers → Email →
désactiver « Allow new users to sign up ».**

Sans cela, n'importe qui pourrait appeler l'API Supabase directement et se créer un compte
avec le rôle « employe » (attribué automatiquement par le trigger `handle_new_user`).

Aucun secret ne doit être commité : seul `.env.example` (valeurs factices) est suivi par git.

## Stack

Next.js 14 (App Router, TypeScript) + Tailwind CSS + Supabase (auth, base Postgres, RLS,
stockage) + next-intl (vitrine ES/EN/FR, panneau admin trilingue FR/EN/ES) + Resend
(notification des demandes de réservation).

## Démarrage en local

```bash
npm install
cp .env.example .env.local   # puis renseigner les valeurs (voir ci-dessous)
npm run dev
```

Scripts : `npm run dev`, `npm run build`, `npm run start`, `npm run lint`.
Contrôle de types : `npx tsc --noEmit`.

## Variables d'environnement

Voir `.env.example`. Les valeurs réelles vont dans `.env.local` (jamais commité) et dans
les variables d'environnement du projet Vercel :

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — publiques par
  conception (protégées par les policies RLS).
- `SUPABASE_SERVICE_ROLE_KEY` — **secrète**, lue côté serveur uniquement
  (`src/lib/supabase/admin.ts`).
- `RESEND_API_KEY` — **secrète**, envoi des courriels (`src/app/api/demandes/notify`).

## Base de données

Projet Supabase : `ivgrentcar`. Les migrations sont dans `supabase/migrations/`
(numérotées `0001` à `0029`) : schéma, RLS par rôle (`est_admin()` / `est_staff()`),
anti-double-réservation au niveau base, contrats et signature électronique, entretiens,
garants, rentabilité, journal d'activité, champ assurance, etc.

Chaque migration est un fichier numéroté **et** appliquée sur le projet distant. Les types
`src/lib/supabase/database.types.ts` sont synchronisés à la main, de façon ciblée.

### Premier compte admin

1. Supabase Dashboard → Authentication → Users → **Add user** (email + mot de passe).
2. Un profil « employe » est créé automatiquement par le trigger. Passage en admin :
   ```sql
   update public.profiles set role = 'admin' where id = '<uuid-de-l-utilisateur>';
   ```
3. Connexion sur `/admin/login`.

## Structure

```
src/app/[locale]/        Vitrine publique (ES/EN/FR) — accueil, flotte, contact, FAQ,
                         Las Terrenas, formulaire de réservation
src/app/admin/           Panneau interne, protégé par auth
  login/                 Connexion (page publique)
  (protected)/           Le reste — vérifié côté serveur à chaque requête :
                         réservations, calendrier, demandes, clients, garants,
                         véhicules, tarifs, entretiens, rentabilité (voitures / quads),
                         utilisateurs, journal d'activité, aide
src/app/api/             Routes serveur (notification des demandes)
src/components/site/     Composants de la vitrine (FleetCard, PriceTable, ...)
src/components/admin/    Composants du panneau
src/components/ui/       Composants génériques réutilisables
src/lib/                 Clients Supabase, requêtes, types, aides (SEO, groupes de véhicules)
src/messages/            Traductions fr / en / es
supabase/migrations/     Historique complet du schéma, suivi par git
public/                  Images (fleet, gallery, hero, og), captures et vidéos de l'aide
```

## Déploiement

Le site est hébergé sur **Vercel** (domaine `ivjrentcar.com`). Un push sur la branche
`master` déclenche un déploiement de production. La branche `master` est protégée :
les changements passent par une pull request.
