// Primitives de style partagées par tous les formulaires admin — centralisées ici pour
// que la passe de design (largeur, groupement, style des inputs natifs, hiérarchie des
// boutons) reste cohérente sur tout /admin sans dupliquer les mêmes classes dans chaque
// fichier de formulaire.
import type { ReactNode } from "react";

export const inputClass =
  "w-full rounded-md border border-black/20 bg-white px-3 py-2 text-ink transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
export const labelClass = "mb-1 block font-medium text-ink";

export const primaryButtonClass =
  "rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60";
export const secondaryLinkClass =
  "rounded-md border border-black/15 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-black/5";
export const dangerLinkClass = "text-sm font-semibold text-red-600 hover:underline";

// Sépare visuellement les groupes de champs d'un formulaire long (ex: "Cliente y
// vehículo", "Fechas y horarios") par un petit intitulé + une bordure discrète, plutôt
// qu'une liste plate de labels qui se suivent. `first:border-t-0` évite une bordure
// orpheline en haut du tout premier groupe.
export function FormSection({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-4 border-t border-black/10 pt-6 first:border-t-0 first:pt-0 ${className}`}
    >
      <h2 className="text-xs font-bold uppercase tracking-wider text-ink-soft">{title}</h2>
      {children}
    </div>
  );
}

// Carte autonome avec son propre en-tête (titre + action optionnelle) — utilisée quand
// une page groupe plusieurs blocs indépendants côte à côte (grille à deux colonnes) plutôt
// que des sections empilées dans une seule carte : chaque bloc doit alors se distinguer
// visuellement par ses propres bordures, pas seulement par un séparateur interne.
export function Card({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-black/10 px-6 py-4">
        <h2 className="text-sm font-bold text-ink">{title}</h2>
        {action}
      </div>
      <div className="flex flex-col gap-4 p-6">{children}</div>
    </div>
  );
}
