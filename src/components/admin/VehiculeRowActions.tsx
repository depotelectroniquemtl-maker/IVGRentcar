"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

// Bascule réversible (contrairement à la suppression d'une réservation) : pas de
// confirmation nécessaire, un admin peut réactiver le véhicule en un clic identique.
export function VehiculeRowActions({
  id,
  actif,
  canDeactivate,
}: {
  id: string;
  actif: boolean;
  canDeactivate: boolean;
}) {
  const router = useRouter();
  const t = useTranslations("admin.vehicules");
  const [loading, setLoading] = useState(false);

  async function toggleActif() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("vehicules").update({ actif: !actif }).eq("id", id);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/vehicules/${id}`}
        title={t("action_edit")}
        className="flex h-7 w-7 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-black/5 hover:text-ink"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path
            d="M11.3 2.7 13.3 4.7 5 13H3v-2l8.3-8.3Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
      {canDeactivate && (
        <button
          type="button"
          title={actif ? t("action_deactivate") : t("action_activate")}
          onClick={toggleActif}
          disabled={loading}
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-black/5 hover:text-red-600 disabled:opacity-50"
        >
          {actif ? (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 2.5v5.2M4 4.6a5 5 0 1 0 8 0"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M8 5.2v5.6M5.2 8h5.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
