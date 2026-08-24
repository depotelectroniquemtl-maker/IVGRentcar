"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { rowIconButtonClass } from "@/components/admin/admin-ui";

// Confirmation compacte en ligne (pas de bannière pleine largeur, la cellule de tableau
// n'a pas la place) — contrairement aux toggles réversibles (VehiculeRowActions,
// MarcarDevueltoButton), la suppression d'un entretien est définitive.
export function EntretienRowActions({ id }: { id: string }) {
  const router = useRouter();
  const t = useTranslations("admin.entretiens");
  const tCommon = useTranslations("admin.common");
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("entretiens").delete().eq("id", id);
    setLoading(false);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center justify-end gap-2 whitespace-nowrap text-xs">
        <span className="text-ink-soft">{t("delete_confirm_short")}</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="font-semibold text-red-600 hover:underline disabled:opacity-50"
        >
          {loading ? tCommon("saving") : tCommon("yes")}
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

  return (
    <div className="flex items-center justify-end">
      <button
        type="button"
        title={t("delete")}
        onClick={() => setConfirming(true)}
        className={`${rowIconButtonClass} hover:text-red-600`}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path
            d="M3.5 4.5h9M6.3 4.5V3.3a1 1 0 0 1 1-1h1.4a1 1 0 0 1 1 1v1.2M6 7v4.4M10 7v4.4M4.3 4.5l.6 8a1 1 0 0 0 1 .9h4.2a1 1 0 0 0 1-.9l.6-8"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
