import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { CalendrierGrid } from "@/components/admin/CalendrierGrid";

const WINDOW_DAYS = 14;

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(iso: string, days: number) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return isoDate(d);
}

type Occupation = { type: "reservation" | "indispo"; id: string; label: string };

export default async function CalendrierPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string }>;
}) {
  const { start: startParam } = await searchParams;
  const supabase = createClient();
  const t = await getAdminTranslator("admin.calendrier");
  const tCommon = await getAdminTranslator("admin.common");

  const start = startParam ?? isoDate(new Date());
  const end = addDays(start, WINDOW_DAYS - 1);
  const jours = Array.from({ length: WINDOW_DAYS }, (_, i) => addDays(start, i));

  const [{ data: vehicules }, { data: reservations }, { data: indisponibilites }] =
    await Promise.all([
      supabase
        .from("vehicules")
        .select("id, plaque, categories_vehicules(nom)")
        .eq("actif", true)
        .order("plaque"),
      supabase
        .from("reservations")
        .select("id, vehicule_id, date_debut, date_fin, statut, clients(nom)")
        .neq("statut", "annulee")
        .lte("date_debut", end)
        .gte("date_fin", start),
      supabase
        .from("indisponibilites_vehicule")
        .select("id, vehicule_id, date_debut, date_fin, motif")
        .lte("date_debut", end)
        .gte("date_fin", start),
    ]);

  // vehicule_id -> date ISO -> occupation (réservation ou blocage manuel), pour un accès
  // O(1) par cellule plutôt que de reparcourir les listes à chaque case de la grille.
  // Objet simple (pas une Map) car ces données traversent la frontière serveur/client
  // vers CalendrierGrid, qui gère la sélection de plage à la souris.
  const occupation: Record<string, Record<string, Occupation>> = {};
  function marquer(vehiculeId: string, debut: string, fin: string, occ: Occupation) {
    if (!occupation[vehiculeId]) occupation[vehiculeId] = {};
    for (const jour of jours) {
      if (jour >= debut && jour <= fin) occupation[vehiculeId][jour] = occ;
    }
  }

  for (const r of reservations ?? []) {
    marquer(r.vehicule_id, r.date_debut, r.date_fin, {
      type: "reservation",
      id: r.id,
      label: r.clients?.nom ?? tCommon("dash"),
    });
  }
  for (const i of indisponibilites ?? []) {
    marquer(i.vehicule_id, i.date_debut, i.date_fin, {
      type: "indispo",
      id: i.id,
      label: i.motif || t("legend_indisponibilite"),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
        <div className="flex items-center gap-3 text-sm">
          <Link
            href={`/admin/calendrier?start=${addDays(start, -WINDOW_DAYS)}`}
            className="rounded border border-black/15 px-3 py-1.5 font-medium text-ink hover:bg-black/5"
          >
            {t("prev")}
          </Link>
          <Link
            href={`/admin/calendrier?start=${addDays(start, WINDOW_DAYS)}`}
            className="rounded border border-black/15 px-3 py-1.5 font-medium text-ink hover:bg-black/5"
          >
            {t("next")}
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-blue-100" />
          {t("legend_reservation")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-orange-100" />
          {t("legend_indisponibilite")}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-black/10 bg-white shadow-sm">
        <CalendrierGrid
          vehicules={(vehicules ?? []).map((v) => ({
            id: v.id,
            nom: `${v.categories_vehicules?.nom ?? tCommon("dash")} (${v.plaque ?? tCommon("dash")})`,
          }))}
          jours={jours}
          occupation={occupation}
          colVehiculo={t("col_vehiculo")}
          chooseTitle={t("choose_title")}
          empty={t("empty")}
        />
      </div>
    </div>
  );
}
