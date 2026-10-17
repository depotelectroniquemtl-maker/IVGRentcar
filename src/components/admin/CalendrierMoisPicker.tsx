"use client";

import { useRouter } from "next/navigation";

// Sélecteur de mois : bascule le calendrier sur la vue Mois du mois choisi.
export function CalendrierMoisPicker({
  value,
  filtre,
  label,
}: {
  value: string;
  filtre: string;
  label: string;
}) {
  const router = useRouter();

  return (
    <input
      type="month"
      value={value}
      aria-label={label}
      title={label}
      onChange={(e) => {
        const mois = e.target.value;
        if (!/^\d{4}-\d{2}$/.test(mois)) return;
        const q = new URLSearchParams({ vue: "mois", mois });
        if (filtre !== "tous") q.set("filtre", filtre);
        router.push(`/admin/calendrier?${q.toString()}`);
      }}
      className="min-h-[36px] rounded border border-black/15 bg-white px-2 py-1 text-sm text-ink focus:border-brand focus:outline-none"
    />
  );
}
