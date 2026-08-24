"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Réordonner par échange avec le voisin immédiat (dans la liste déjà triée par
// ordre_affichage) plutôt que par saisie libre d'un nombre — évite les doublons/trous
// et reste simple pour une poignée de catégories.
export function OrdreCategorieButtons({
  id,
  ordre,
  voisinHautId,
  voisinHautOrdre,
  voisinBasId,
  voisinBasOrdre,
}: {
  id: string;
  ordre: number;
  voisinHautId?: string;
  voisinHautOrdre?: number;
  voisinBasId?: string;
  voisinBasOrdre?: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function echanger(autreId: string, autreOrdre: number) {
    setLoading(true);
    const supabase = createClient();
    await Promise.all([
      supabase.from("categories_vehicules").update({ ordre_affichage: autreOrdre }).eq("id", id),
      supabase.from("categories_vehicules").update({ ordre_affichage: ordre }).eq("id", autreId),
    ]);
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={!voisinHautId || loading}
        onClick={() => voisinHautId && voisinHautOrdre !== undefined && echanger(voisinHautId, voisinHautOrdre)}
        className="flex h-7 w-7 items-center justify-center rounded border border-black/15 text-ink-soft transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Monter"
      >
        ↑
      </button>
      <button
        type="button"
        disabled={!voisinBasId || loading}
        onClick={() => voisinBasId && voisinBasOrdre !== undefined && echanger(voisinBasId, voisinBasOrdre)}
        className="flex h-7 w-7 items-center justify-center rounded border border-black/15 text-ink-soft transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Descendre"
      >
        ↓
      </button>
    </div>
  );
}
