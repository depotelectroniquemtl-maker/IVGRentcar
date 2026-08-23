"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

// Barre + panneau mobile pour le panneau admin — même patron que MobileMenu.tsx côté
// vitrine publique. La sidebar fixe w-56 (Sidebar.tsx) reste réservée au desktop
// (lg:flex) : en dessous, elle prenait plus de la moitié de l'écran et écrasait tout le
// contenu dans une colonne étroite, un problème que la passe de design a rendu plus
// visible en élargissant les formulaires.
export function AdminMobileNav({
  items,
  footer,
  ariaOpen,
  ariaClose,
}: {
  items: { href: string; label: string }[];
  footer: ReactNode;
  ariaOpen: string;
  ariaClose: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b-[3px] border-brand bg-ink text-white lg:hidden">
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
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded px-3 py-2 hover:bg-white/10"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 border-t border-white/10 pt-3">{footer}</div>
        </nav>
      )}
    </div>
  );
}
