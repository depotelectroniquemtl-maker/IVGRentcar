"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

export type NavEntry =
  | { type: "group"; label: string }
  | { type: "link"; href: string; label: string; badge?: number };

// Barre + panneau mobile pour le panneau admin — même patron que MobileMenu.tsx côté
// vitrine publique. La sidebar fixe w-56 (Sidebar.tsx) reste réservée au desktop
// (lg:flex) : en dessous, elle prenait plus de la moitié de l'écran et écrasait tout le
// contenu dans une colonne étroite, un problème que la passe de design a rendu plus
// visible en élargissant les formulaires.
export function AdminMobileNav({
  entries,
  footer,
  ariaOpen,
  ariaClose,
}: {
  entries: NavEntry[];
  footer: ReactNode;
  ariaOpen: string;
  ariaClose: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b-[3px] border-brand bg-ink text-white lg:hidden print:hidden">
      <div className="flex items-center justify-between px-4 py-4">
        <p className="font-bold">
          <span className="text-brand">I.V.J</span> Polanco
        </p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? ariaClose : ariaOpen}
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded text-white hover:bg-white/10"
        >
          {open ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-white/10 p-3 text-sm">
          {entries.map((entry, i) =>
            entry.type === "group" ? (
              <p
                key={`g-${i}`}
                className={`px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-white/35 ${i === 0 ? "pt-1" : "pt-4"}`}
              >
                {entry.label}
              </p>
            ) : (
              <Link
                key={entry.href}
                href={entry.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded px-3 py-2 hover:bg-white/10"
              >
                {entry.label}
                {Boolean(entry.badge) && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold text-white">
                    {entry.badge}
                  </span>
                )}
              </Link>
            ),
          )}
          <div className="mt-2 border-t border-white/10 pt-3">{footer}</div>
        </nav>
      )}
    </div>
  );
}
