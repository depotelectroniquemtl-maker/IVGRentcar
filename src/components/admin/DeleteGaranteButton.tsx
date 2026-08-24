"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { dangerLinkClass } from "@/components/admin/form-ui";

// Pas de gestion spéciale d'erreur de contrainte FK ici (contrairement à
// DeleteClientButton) : contrats_location.garant_id est en "on delete set null", pas
// "restrict" — supprimer un garant ne bloque jamais, ça détache juste les contrats liés.
export function DeleteGaranteButton({ id }: { id: string }) {
  const router = useRouter();
  const t = useTranslations("admin.garantes");
  const tCommon = useTranslations("admin.common");
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("garants").delete().eq("id", id);
    if (error) {
      setLoading(false);
      return;
    }
    router.push("/admin/garantes");
    router.refresh();
  }

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className={dangerLinkClass}>
        {t("delete")}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
      <span className="text-red-800">{t("delete_confirm")}</span>
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="rounded-md bg-red-600 px-3 py-1.5 font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
      >
        {loading ? tCommon("saving") : t("delete_confirm_yes")}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={loading}
        className="text-ink-soft hover:underline"
      >
        {tCommon("cancel")}
      </button>
    </div>
  );
}
