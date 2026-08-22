"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const STATUTS = ["nouvelle", "contactee", "convertie", "rejetee"] as const;

const STATUT_LABELS: Record<(typeof STATUTS)[number], string> = {
  nouvelle: "Nueva",
  contactee: "Contactada",
  convertie: "Convertida",
  rejetee: "Rechazada",
};

export function DemandeStatutSelect({ id, statut }: { id: string; statut: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
      className="rounded border border-black/20 bg-white px-2 py-1 text-sm disabled:opacity-60"
    >
      {STATUTS.map((s) => (
        <option key={s} value={s}>
          {STATUT_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
