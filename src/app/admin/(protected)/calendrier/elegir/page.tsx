import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";

export default async function ElegirAccionPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicule_id?: string; date?: string }>;
}) {
  const { vehicule_id: vehiculeId, date } = await searchParams;
  if (!vehiculeId || !date) notFound();

  const supabase = createClient();
  const t = await getAdminTranslator("admin.calendrier");
  const tCommon = await getAdminTranslator("admin.common");

  const { data: vehicule } = await supabase
    .from("vehicules")
    .select("id, plaque, categories_vehicules(nom)")
    .eq("id", vehiculeId)
    .single();

  if (!vehicule) notFound();

  const nomVehicule = `${vehicule.categories_vehicules?.nom ?? tCommon("dash")} (${vehicule.plaque ?? tCommon("dash")})`;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/calendrier" className="text-sm font-medium text-brand hover:underline">
        {t("back")}
      </Link>

      <div className="flex max-w-md flex-col gap-4 rounded-lg bg-white p-8 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-ink">{t("choose_title")}</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {t("choose_subtitle", { vehiculo: nomVehicule, fecha: date })}
          </p>
        </div>

        <Link
          href={`/admin/reservations/nueva?vehicule_id=${vehiculeId}&date_debut=${date}&date_fin=${date}`}
          className="rounded-md bg-brand px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          {t("action_reserva")}
        </Link>

        <Link
          href={`/admin/blocages/nuevo?vehicule_id=${vehiculeId}&date_debut=${date}`}
          className="rounded-md border border-black/15 px-5 py-3 text-center text-sm font-semibold text-ink transition-colors hover:bg-black/5"
        >
          {t("action_bloqueo")}
        </Link>
      </div>
    </div>
  );
}
