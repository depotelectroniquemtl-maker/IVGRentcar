"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

const STATUTS = ["nouvelle", "contactee", "convertie", "rejetee"] as const;

export function DemandeStatutSelect({ id, statut }: { id: string; statut: string }) {
  const router = useRouter();
  const t = useTranslations("admin.demandes");
  const [loading, setLoading] = useState(false);

  const STATUT_LABELS: Record<(typeof STATUTS)[number], string> = {
    nouvelle: t("statut_nouvelle"),
    contactee: t("statut_contactee"),
    convertie: t("statut_convertie"),
    rejetee: t("statut_rejetee"),
  };

  async function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("demandes_reservation").update({ statut: e.target.value }).eq("id", id);
    setLoading(false);
    router.refresh();
  }

  return (
    <select
      defaultValue={statut}
      onChange={handleChange}
      disabled={loading}
      className="rounded-md border border-black/20 bg-white px-2 py-1.5 text-sm text-ink transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-60"
    >
      {STATUTS.map((s) => (
        <option key={s} value={s}>
          {STATUT_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
