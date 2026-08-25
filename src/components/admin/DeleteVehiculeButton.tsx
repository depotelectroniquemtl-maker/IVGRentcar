"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { dangerLinkClass } from "@/components/admin/form-ui";

// Contrairement à Désactiver (réversible, conserve tout), Supprimer est bloqué par
// contrainte "on delete restrict" dès que le véhicule a une réservation, une demande, une
// indisponibilité ou un entretien — ne reste donc possible que pour une fiche créée par
// erreur ou jamais utilisée. Le cas réel du client (quad/vieille voiture revendue après
// avoir servi) passe par Désactiver + motif de retrait, pas par cette suppression.
export function DeleteVehiculeButton({ id }: { id: string }) {
  const router = useRouter();
  const t = useTranslations("admin.vehicules");
  const tCommon = useTranslations("admin.common");
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("vehicules").delete().eq("id", id);
    if (error) {
      setError(error.code === "23503" ? t("delete_error_has_history") : error.message);
      setLoading(false);
      return;
    }
    router.push("/admin/vehicules");
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
      {error && <span className="w-full text-red-800">{error}</span>}
    </div>
  );
}
