# IVGRentcar — I.V.J Polanco Rent a Car

Site vitrine (ES/EN/FR) + panneau interne de gestion des locations pour I.V.J Polanco
Rent a Car (Las Terrenas, R.D.), client : Karim.

## ⚠️ À faire avant tout (sécurité)

Le tableau de bord Supabase peut permettre l'inscription publique par défaut. Comme cette
application n'a **pas** de page d'inscription (les comptes staff se créent par un admin,
écran "Usuarios" — encore à construire), il faut vérifier/désactiver ça dès maintenant :

**Supabase Dashboard → ce projet (`ivgrentcar`, ref `usipxmbcslwhaggqhozr`) → Authentication
→ Providers → Email → désactiver "Allow new users to sign up"** si ce n'est pas déjà fait.

Sans ça, n'importe qui pourrait appeler l'API Supabase directement et se créer un compte
avec le rôle "employe" (auto-attribué par le trigger `handle_new_user`).

## Stack

Next.js 14 (App Router, TypeScript) + Tailwind CSS + Supabase (auth, DB, RLS) + next-intl
(ES/EN/FR) — même stack que gestion-stock, qui a bien fonctionné.

## ⚠️ Installation — important

Cette base de code a été écrite dans un environnement cloud **sans accès au registre
npm** (impossible d'y lancer `npm install` ou `create-next-app`). Tous les fichiers ont
donc été écrits à la main plutôt que générés, et **rien n'a encore pu être compilé ni
testé ici**. Sur ta machine (qui a un accès internet normal) :

```bash
npm install
npm run dev
```

Si `npm run build` ou `npm run dev` révèle des erreurs (versions de dépendances, imports),
dis-le-moi et je corrige — c'est très possible sur un premier scaffold écrit sans pouvoir
compiler.

## Variables d'environnement

`.env.local` est déjà rempli avec les vraies valeurs du projet Supabase `ivgrentcar` :

```
NEXT_PUBLIC_SUPABASE_URL=https://usipxmbcslwhaggqhozr.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Cette clé "publishable" est publique par design (protégée par les policies RLS) — normal
qu'elle soit dans le code envoyé au navigateur.

## Base de données

Projet Supabase : `ivgrentcar` (org `assilbenafia-netizen's Org`, même compte que
gestion-stock pour l'instant — voir note ci-dessous sur le transfert client).

Migrations dans `supabase/migrations/`, déjà appliquées sur le projet distant :

1. `0001_init.sql` — schéma (profiles, categories_vehicules, tarifs, vehicules, clients,
   reservations), RLS par rôle (`est_admin()` / `est_staff()`), contrainte anti-double-
   réservation au niveau base de données, statuts calculés via vues.
2. `0002_seed_flotte.sql` — catégories + grille tarifaire reprises de la fiche fournie.
3. `0003_security_hardening.sql`, `0004_performance.sql`, `0005_catalogue_public.sql` —
   corrections trouvées via l'audit `get_advisors` (RLS des vues, index manquants,
   ouverture de la lecture publique du catalogue pour la vitrine).

Si tu utilises le CLI Supabase en local plus tard (`supabase link`), ces migrations
s'appliqueront directement — c'est le même dossier.

### Premier compte admin

Aucun compte staff n'existe encore. Pour créer le tien :

1. Supabase Dashboard → Authentication → Users → **Add user** (email + mot de passe).
2. Un profil "employe" est créé automatiquement par le trigger. Passe-le en admin :
   ```sql
   update public.profiles set role = 'admin' where id = '<uuid-de-l-utilisateur>';
   ```
3. Connecte-toi sur `/admin/login`.

## Structure

```
src/app/[locale]/        Vitrine publique (ES/EN/FR) — accueil, flotte, contact
src/app/admin/           Panneau interne (non multilingue), protégé par auth
  login/                 Connexion (page publique)
  (protected)/           Tout le reste — vérifié côté serveur à chaque requête
src/components/site/     Composants de la vitrine (Header, Footer, PriceTable, ...)
src/components/admin/    Composants du panneau (Sidebar, LogoutButton)
src/components/ui/       Composants génériques réutilisables (Button, Container)
src/lib/supabase/        Clients Supabase (browser/server) + types générés
src/lib/data/            Requêtes de lecture (catalogue public)
src/messages/            Traductions ES/EN/FR de la vitrine
supabase/migrations/     Historique complet du schéma, suivi par git
```

## Ce qui est fait vs à faire

Fait : vitrine publique multilingue avec le vrai catalogue (lu en direct depuis Supabase),
authentification staff, panneau interne avec tableau de bord + listes (véhicules,
réservations, clients, tarifs, utilisateurs) en lecture, rôles admin/employé avec RLS,
contrainte anti-chevauchement de réservations en base de données.

À faire (prochaine étape) : formulaires de création/édition (réservations, véhicules,
clients, tarifs, utilisateurs), calendrier de disponibilité visuel, menu mobile sur la
vitrine, favicon/logo réel (actuellement juste le nom en texte), déploiement Vercel +
dépôt GitHub, et — une fois prêt — migration du compte Supabase vers celui du client
(voir *checklist-projets-client.md* si tu l'as gardé).
