// Éléments visuels partagés par la liste, le panneau de détail et le formulaire de saisie
// des demandes (/admin/demandes).
import type { ReactNode } from "react";

export const boutonPrincipal =
  "inline-flex items-center justify-center gap-2 rounded-md bg-brand px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60";
// Actions destructives : rouge, toujours dans la zone « Actions sensibles » en bas du panneau,
// jamais à côté du bouton principal.
export const boutonDanger =
  "inline-flex items-center justify-center rounded-md border border-red-300 bg-white px-3.5 py-2 text-sm font-semibold text-red-800 transition-colors hover:bg-red-50 disabled:opacity-60";
export const boutonSecondaire =
  "inline-flex items-center justify-center gap-2 rounded-md border border-black/15 bg-white px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-black/5 disabled:opacity-60";
export const champClass =
  "w-full rounded-md border border-black/20 bg-white px-3 py-2 text-sm text-ink transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
export const libelleClass = "mb-1 block text-sm font-medium text-ink";

// Icônes Tabler (MIT), tracés repris tels quels.
export function IconeMessage({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M8 9h8" />
      <path d="M8 13h6" />
      <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z" />
    </svg>
  );
}

export function IconeCourriel({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" />
      <path d="M3 7l9 6l9 -6" />
    </svg>
  );
}

export function IconeFermer({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

export function IconePlus({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M12 5l0 14" />
      <path d="M5 12l14 0" />
    </svg>
  );
}

export function Section({ titre, children, id }: { titre: string; children: ReactNode; id?: string }) {
  return (
    <section id={id}>
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-soft">{titre}</h3>
      {children}
    </section>
  );
}

export function MessageErreur({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
      {children}
    </p>
  );
}

// Panneau latéral (fenêtre modale) : fond assombri, fermeture par la croix ou un clic à côté.
export function PanneauLateral({
  titreId,
  onFermer,
  children,
}: {
  titreId: string;
  onFermer: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onFermer} aria-hidden="true" />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titreId}
        className="relative flex h-full w-full max-w-[460px] flex-col overflow-y-auto bg-white shadow-xl"
      >
        {children}
      </section>
    </div>
  );
}
