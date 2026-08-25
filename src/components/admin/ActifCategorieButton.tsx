"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export function ActifCategorieButton({ id, actif }: { id: string; actif: boolean }) {
  const router = useRouter();
  const t = useTranslations("admin.tarifs");
  const [loading, setLoading] = useState(false);

  async function basculer() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("categories_vehicules").update({ actif: !actif }).eq("id", id);
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={basculer}
      disabled={loading}
      title={actif ? t("toggle_hint_deactivate") : t("toggle_hint_activate")}
      className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
        actif
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          : "bg-black/10 text-ink-soft hover:bg-black/15"
      }`}
    >
      {actif ? t("col_activo_yes") : t("col_activo_no")}
    </button>
  );
}
