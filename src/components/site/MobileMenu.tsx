"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const LINKS = [
  { href: "/flotte", key: "flotte" },
  { href: "/#why", key: "why" },
  { href: "/las-terrenas", key: "lasTerrenas" },
  { href: "/faq", key: "faq" },
] as const;

export function MobileMenu() {
  const t = useTranslations("site");
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded text-ink hover:bg-black/5"
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

      {open && (
        <nav className="fixed inset-x-0 top-20 z-20 flex flex-col gap-1 border-b border-black/10 bg-white px-4 py-4 text-sm font-medium text-ink shadow-lg sm:top-24">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded px-3 py-2 hover:bg-black/5"
            >
              {t(`nav.${link.key}`)}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
