"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { definirRetourReservation } from "@/lib/reservation-retour";
import { secondaryLinkClass } from "@/components/admin/form-ui";

// Bascule réversible (même logique que le toggle actif de VehiculeRowActions.tsx) : pas
// de confirmation nécessaire, une erreur de clic se corrige par "Deshacer" plutôt que par
// une action destructive séparée.
export function MarcarDevueltoButton({
  id,
  dateRetourReelle,
}: {
  id: string;
  dateRetourReelle: string | null;
}) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("admin.reservations");
  const tCommon = useTranslations("admin.common");
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const supabase = createClient();
    // Même logique de retour que le bouton « Retourner » de la liste (reservation-retour.ts).
    await definirRetourReservation(supabase, id, !dateRetourReelle);
    setLoading(false);
    router.refresh();
  }

  if (!dateRetourReelle) {
    return (
      <button type="button" onClick={toggle} disabled={loading} className={secondaryLinkClass}>
        {loading ? tCommon("saving") : t("marcar_devuelto")}
      </button>
    );
  }

  const fecha = new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
    new Date(dateRetourReelle),
  );

  return (
    <span className="inline-flex items-center gap-2 text-sm text-ink-soft">
      {t("devuelto_el", { fecha })}
      <span aria-hidden>·</span>
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        className="font-semibold text-brand hover:underline disabled:opacity-60"
      >
        {t("deshacer")}
      </button>
    </span>
  );
}
