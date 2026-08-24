// Primitives partagées par les écrans-liste de l'admin (voir docs/design/admin-design-pass-2.md) —
// carte de statistique, pastille de statut et classes de table, extraites de vehicules/page.tsx
// (premier écran refait) pour que les écrans suivants réutilisent le même style au lieu de
// recopier les mêmes chaînes Tailwind à chaque fois.
import type { ReactNode } from "react";
import Link from "next/link";

export const tableCardClass = "overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm";
export const theadClass = "bg-black/[0.03] text-ink-soft";
export const thClass = "px-4 py-3 text-[11px] font-bold uppercase tracking-wider";
export const thNumClass = `${thClass} text-right`;
export const trClass = "border-t border-black/5 transition-colors hover:bg-black/[0.02]";
export const rowIconButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-black/5 hover:text-ink";

const STAT_TONE_CLASS = {
  neutral: "",
  warn: "text-amber-600",
  crit: "text-red-600",
  muted: "text-ink-soft",
} as const;

export function StatCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number | string;
  tone?: keyof typeof STAT_TONE_CLASS;
}) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
      <div className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">{label}</div>
      <div className={`mt-2 text-2xl font-bold tabular-nums text-ink ${STAT_TONE_CLASS[tone]}`}>{value}</div>
    </div>
  );
}

// Pastille avec point plein (`bg-current` hérite la couleur du texte passé via `className`) —
// remplace le texte brut coloré utilisé avant la passe de design sur vehicules.
export function Pill({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export function EditRowLink({ href, title }: { href: string; title: string }) {
  return (
    <Link
      href={href}
      title={title}
      aria-label={title}
      className={`${rowIconButtonClass} hover:bg-brand-light hover:text-brand`}
    >
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
        <path
          d="M11.3 2.7 13.3 4.7 5 13H3v-2l8.3-8.3Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
