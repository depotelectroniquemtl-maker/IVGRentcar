# Passe de design admin — écrans restants (à coller dans Claude Code)

Contexte : l'écran `/admin/vehicules` (liste + fiche) a été refait et validé — c'est la
référence à reproduire sur tous les autres écrans internes. Ce document liste, écran par
écran, ce qui doit changer et sur quels fichiers, en réutilisant ce qui existe déjà dans
`components/admin/form-ui.tsx` plutôt qu'en réinventant un style par écran.

## Les deux conventions à généraliser

Ces deux règles sont déjà appliquées sur `VehiculeForm.tsx` / `vehicules/page.tsx` — il
s'agit de les copier sur les écrans ci-dessous, pas d'inventer un nouveau style.

**1. Le composant `*Form` porte son propre en-tête (titre + Cancelar + bouton
principal), la page ne met plus de `<h1>` séparé.**
Aujourd'hui seul `VehiculeForm` fait ça (props `title`, boutons dans une rangée en haut,
`Cancelar` en `secondaryLinkClass` juste à côté de `Guardar cambios`). Les autres formulaires
(`ReservationForm`, `ClienteForm`, `BlocageForm`, `EntretienForm`, `UsuarioForm`) affichent
encore leur bouton seul, isolé en bas de page, sans lien retour. À généraliser partout.

**2. Liste = carte unique bordée + en-tête de colonnes stylé + lignes au survol + actions
en icônes groupées, pas des liens texte.**
Référence exacte dans `vehicules/page.tsx` :
- conteneur : `overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm`
  (pas juste `shadow-sm` sans bordure — c'est ce qui manque sur reservations/clients/
  demandes/entretiens/tarifs/utilisateurs actuellement)
- en-tête de colonnes : `bg-black/[0.03] text-ink-soft` + cellules
  `text-[11px] font-bold uppercase tracking-wider`
- lignes : `border-t border-black/5 transition-colors hover:bg-black/[0.02]`
- statut = pastille avec point, pas juste du texte coloré :
  `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold {couleur}`
  avec `<span className="h-1.5 w-1.5 rounded-full bg-current" />` à l'intérieur
- actions = icônes groupées à droite façon `VehiculeRowActions.tsx` (boutons `h-7 w-7
  rounded-md hover:bg-black/5`), pas un lien texte `Editar` seul

**Nuance largeur de formulaire :** le problème initial sur véhicule n'était pas "toute
carte doit être pleine largeur" mais l'absence de groupement + le bouton isolé en bas.
Les formulaires courts (2 à 6 champs : blocage, entretien, utilisateur) restent en carte
simple `max-w-2xl` avec l'en-tête corrigé — inutile de les forcer sur deux colonnes, ça
créerait des cartes creuses. Seuls les formulaires à plusieurs sections (réservation,
client) passent en grille `grid-cols-1 lg:grid-cols-[1.55fr_1fr]` comme `VehiculeForm`.

**Nettoyage recommandé pendant la passe :** extraire `StatCard` (actuellement dupliqué
dans `vehicules/page.tsx`) et le pattern d'icônes d'action (dupliqué à chaque écran) dans
`form-ui.tsx` ou un nouveau fichier `components/admin/admin-ui.tsx`, pour ne pas
recopier le même SVG huit fois.

---

## Écrans à traiter, par ordre de priorité

### 1. Réservations — `reservations/page.tsx`, `[id]/page.tsx`, `nueva/page.tsx`,
`components/admin/ReservationForm.tsx`

- Liste : ajouter une rangée de 4 `StatCard` au-dessus du tableau, calculées côté
  serveur avec la même logique `calcularFase` déjà présente : **En curso** (phase
  en_cours), **Próximas** (phase a_venir), **Pendientes** (statut en_attente),
  **Canceladas** (statut annulee).
- Tableau : appliquer la carte bordée + en-tête stylé + hover (convention n°2). Le
  badge de phase existe déjà (`FASE_CLASSNAMES`) — lui ajouter le point `bg-current`
  pour matcher le style pastille des véhicules.
- Colonne actions : remplacer le lien texte `Editar` par le bouton icône crayon
  (identique à `VehiculeRowActions`).
- Fiche (`EditarReservaPage` + `ReservationForm`) : appliquer la convention n°1 —
  `ReservationForm` reçoit `title` et affiche lui-même l'en-tête (Cancelar +
  Guardar cambios). Les liens secondaires actuels (Finalizar contrato / Ver contrato)
  et `DeleteReservationButton` passent en petite rangée d'actions secondaires juste
  sous l'en-tête (même idée que ce qui existe déjà dans `EditarReservaPage`, à
  déplacer sous le nouvel en-tête plutôt qu'au-dessus du formulaire).
- Formulaire : passer en grille `1.55fr/1fr` avec des `Card` : colonne large = "Cliente
  y vehículo" + "Fechas y horarios" ; colonne étroite = "Tarifa" (precio/depósito) +
  "Estado" (le `<select>` statut peut rester un select ici, ce n'est pas un choix
  binaire simple comme l'état véhicule) + "Notas".

### 2. Clients — `clients/page.tsx`, `[id]/page.tsx`, `nuevo/page.tsx`,
`components/admin/ClienteForm.tsx`

- Liste : sous-titre `{count} clientes` sous le `<h1>` (comme vehicules), carte bordée +
  en-tête stylé + hover, bouton icône crayon au lieu du lien `Editar`.
- Formulaire : convention n°1 pour l'en-tête. Passer en grille 2 colonnes : colonne
  large = "Datos básicos" (nombre, teléfono, correo) + "Documentos" (licencia+exp,
  cédula, nacionalidad, pasaporte+exp) ; colonne étroite = "Dirección" (dirección,
  residencia) + "Notas".

### 3. Demandes — `demandes/page.tsx`, `components/admin/DemandeStatutSelect.tsx`

- Liste : ajouter une rangée de 4 `StatCard` (les 4 statuts existants correspondent
  déjà exactement : **Nuevas**, **Contactadas**, **Convertidas**, **Rechazadas**).
- Carte bordée + en-tête stylé + hover (convention n°2).
- `DemandeStatutSelect` : garder le `<select>` natif (changement de statut inline,
  logique) mais aligner son style sur `inputClass` (bordure + focus ring
  `focus:ring-2 focus:ring-brand/20`) pour qu'il ne détonne pas dans la ligne.
- Le lien `Convertir` : le transformer en petit bouton pilule plutôt qu'un lien texte
  brut, pour qu'il se voie comme une action principale de la ligne — ex.
  `inline-flex items-center rounded-md bg-brand/10 px-2.5 py-1 text-xs font-semibold
  text-brand-dark hover:bg-brand/20`.

### 4. Entretiens — `entretiens/page.tsx`, `nuevo/page.tsx`,
`components/admin/EntretienForm.tsx`

- Liste : carte bordée + en-tête stylé + hover. En option mais cohérent avec les
  données déjà chargées : 3 `StatCard` — **Registros** (total), **Costo este mes**
  (somme `cout_usd` du mois en cours), **Próximos 30 días** (compte des
  `prochain_entretien` dans les 30 jours). Si `prochain_entretien` est dépassé,
  afficher une pastille "Vencido" (rouge) dans la colonne au lieu du texte brut.
- Formulaire : convention n°1 pour l'en-tête ; le formulaire reste une carte simple
  (court), pas de passage en 2 colonnes.

### 5. Tarifs — `tarifs/page.tsx`, `components/admin/TarifaInput.tsx`

- Pas de formulaire séparé (édition inline). Juste la carte bordée + en-tête stylé +
  hover sur le tableau. `TarifaInput` : ajouter le même focus ring que `inputClass`
  pour cohérence visuelle avec le reste des champs.

### 6. Utilisateurs — `utilisateurs/page.tsx`, `nuevo/page.tsx`,
`components/admin/UsuarioForm.tsx`

- Liste : carte bordée + en-tête stylé + hover. Transformer la colonne rôle en pastille
  colorée (Admin = couleur brand, Empleado = neutre gris) au lieu du texte brut.
- Formulaire : convention n°1 pour l'en-tête, reste en carte simple `max-w-xl` (court).

### 7. Blocages — `blocages/[id]/page.tsx`, `nuevo/page.tsx`,
`components/admin/BlocageForm.tsx`

- Pas de vue liste dédiée (les blocages apparaissent déjà dans la carte "Bloqueos" de
  la fiche véhicule, déjà à niveau). Juste `BlocageForm` : convention n°1 pour
  l'en-tête (actuellement bouton seul en bas, sans lien Cancelar). Reste en carte
  simple, le bouton "Eliminar" + confirmation restent comme aujourd'hui (déjà bon).

### 8. Calendrier (priorité basse — déjà fonctionnel et lisible)

- `calendrier/page.tsx` : juste ajouter `border border-black/10` au conteneur du
  tableau (actuellement `shadow-sm` seul, incohérent avec la convention carte bordée
  utilisée partout ailleurs). Rien d'autre à changer, la grille avec colonne figée et
  couleurs par jour fonctionne bien telle quelle.
- `calendrier/elegir/page.tsx` : même ajout de bordure sur la carte de choix.

### 9. Dashboard (`/admin`, `page.tsx`) — retouche rapide

- Les 3 `StatCard` actuelles n'ont pas de bordure et un style de libellé différent de
  celles de `vehicules`. Remplacer par le même composant `StatCard` extrait (voir
  "Nettoyage recommandé" plus haut) pour que le tout premier écran du panneau soit
  visuellement cohérent avec le reste dès l'ouverture.

---

## À ne pas oublier

- Les nouveaux libellés de `StatCard` (stat_active, stat_pending, etc. pour réservations
  et demandes) doivent être ajoutés dans les trois fichiers `messages/es.json`,
  `en.json`, `fr.json`, en suivant le même pattern de clés que `admin.vehicules`.
- Vérifier en direct dans le navigateur (session déjà connectée, comme pour vehicules)
  avant de commit + push, écran par écran plutôt que tout d'un coup — plus facile à
  valider et à revenir en arrière si un écran ne convient pas.
- Ordre suggéré : réservations et clients d'abord (les plus utilisés au quotidien),
  puis demandes, puis entretiens/tarifs/utilisateurs, calendrier et dashboard en
  dernier (polish mineur, pas de vraie dette visuelle).
