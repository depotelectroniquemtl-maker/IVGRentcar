import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";

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
  const occupation = new Map<string, Map<string, Occupation>>();
  function marquer(vehiculeId: string, debut: string, fin: string, occ: Occupation) {
    if (!occupation.has(vehiculeId)) occupation.set(vehiculeId, new Map());
    const parVehicule = occupation.get(vehiculeId)!;
    for (const jour of jours) {
      if (jour >= debut && jour <= fin) parVehicule.set(jour, occ);
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
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-black/5 text-ink-soft">
              <th className="sticky left-0 z-10 min-w-[160px] bg-black/5 px-3 py-2">
                {t("col_vehiculo")}
              </th>
              {jours.map((jour) => (
                <th key={jour} className="min-w-[44px] px-1 py-2 text-center font-medium">
                  {jour.slice(8, 10)}
                  <span className="block text-[10px] font-normal text-ink-soft/70">
                    {new Date(jour + "T00:00:00").toLocaleDateString(undefined, {
                      weekday: "short",
                    })}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vehicules?.map((v) => {
              const nomVehicule = `${v.categories_vehicules?.nom ?? tCommon("dash")} (${v.plaque ?? tCommon("dash")})`;
              const parJour = occupation.get(v.id);

              return (
                <tr key={v.id} className="border-t border-black/5">
                  <td className="sticky left-0 z-10 min-w-[160px] bg-white px-3 py-2 font-medium text-ink">
                    {nomVehicule}
                  </td>
                  {jours.map((jour) => {
                    const occ = parJour?.get(jour);

                    if (!occ) {
                      return (
                        <td key={jour} className="border-l border-black/5 p-0">
                          <Link
                            href={`/admin/calendrier/elegir?vehicule_id=${v.id}&date=${jour}`}
                            className="flex h-10 w-full items-center justify-center text-black/10 hover:bg-black/[0.04] hover:text-ink"
                            title={t("choose_title")}
                          >
                            +
                          </Link>
                        </td>
                      );
                    }

                    const href =
                      occ.type === "reservation"
                        ? `/admin/reservations/${occ.id}`
                        : `/admin/blocages/${occ.id}`;
                    const colorClass =
                      occ.type === "reservation"
                        ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                        : "bg-orange-100 text-orange-800 hover:bg-orange-200";

                    return (
                      <td key={jour} className="border-l border-black/5 p-0">
                        <Link
                          href={href}
                          title={occ.label}
                          className={`flex h-10 w-full items-center justify-center overflow-hidden px-0.5 text-[10px] font-medium leading-tight ${colorClass}`}
                        >
                          <span className="truncate">{occ.label}</span>
                        </Link>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {vehicules?.length === 0 && (
              <tr>
                <td colSpan={WINDOW_DAYS + 1} className="px-4 py-6 text-center text-ink-soft">
                  {t("empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
