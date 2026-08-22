"use client";

import { useState, type FocusEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export function TarifaInput({ id, prixInicial }: { id: string; prixInicial: number }) {
  const [valeur, setValeur] = useState(prixInicial.toString());
  const [estado, setEstado] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleBlur(e: FocusEvent<HTMLInputElement>) {
    const nombre = Number(e.target.value);
    if (Number.isNaN(nombre) || nombre < 0 || nombre === prixInicial) return;

    setEstado("saving");
    const supabase = createClient();
    const { error } = await supabase
      .from("tarifs")
      .update({ prix_usd: nombre })
      .eq("id", id);

    setEstado(error ? "error" : "saved");
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-ink-soft">US$</span>
      <input
        type="number"
        min={0}
        step="0.01"
        value={valeur}
        onChange={(e) => {
          setValeur(e.target.value);
          setEstado("idle");
        }}
        onBlur={handleBlur}
        className="w-20 rounded border border-black/20 px-2 py-1 focus:border-brand focus:outline-none"
      />
      {estado === "saving" && <span className="text-xs text-ink-soft">…</span>}
      {estado === "saved" && <span className="text-xs text-green-700">✓</span>}
      {estado === "error" && <span className="text-xs text-red-600">✕</span>}
    </div>
  );
}
