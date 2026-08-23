import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";

function calcularFase(dateDebut: string, dateFin: string, statut: string) {
  if (statut === "annulee") return "annulee";
  const hoy = new Date().toISOString().slice(0, 10);
  if (hoy < dateDebut) return "a_venir";
  if (hoy > dateFin) return "terminee";
  return "en_cours";
}

const FASE_CLASSNAMES: Record<string, string> = {
  a_venir: "bg-blue-100 text-blue-700",
  en_cours: "bg-green-100 text-green-700",
  terminee: "bg-black/10 text-ink-soft",
  annulee: "bg-red-100 text-red-700",
};

export default async function ReservationsPage() {
  const supabase = createClient();
  const t = await getAdminTranslator("admin.reservations");
  const tCommon = await getAdminTranslator("admin.common");

  const FASE_LABELS: Record<string, string> = {
    a_venir: t("fase_a_venir"),
    en_cours: t("fase_en_cours"),
    terminee: t("fase_terminee"),
    annulee: t("fase_annulee"),
  };

  const { data: reservations, error } = await supabase
    .from("reservations")
    .select(
      "id, date_debut, date_fin, statut, prix_total_usd, vehicules(plaque, categories_vehicules(nom)), clients(nom)",
    )
    .order("date_debut", { ascending: false })
    .limit(50);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
        <Link
          href="/admin/reservations/nueva"
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          {t("new")}
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-black/5 text-ink-soft">
            <tr>
              <th className="px-4 py-3">{t("col_cliente")}</th>
              <th className="px-4 py-3">{t("col_vehiculo")}</th>
              <th className="px-4 py-3">{t("col_del")}</th>
              <th className="px-4 py-3">{t("col_al")}</th>
              <th className="px-4 py-3">{t("col_precio")}</th>
              <th className="px-4 py-3">{t("col_estado")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {reservations?.map((r) => {
              const fase = calcularFase(r.date_debut, r.date_fin, r.statut);
              return (
                <tr key={r.id} className="border-t border-black/5">
                  <td className="px-4 py-3 font-medium text-ink">
                    {r.clients?.nom ?? tCommon("dash")}
                  </td>
                  <td className="px-4 py-3">
                    {r.vehicules?.categories_vehicules?.nom} ({r.vehicules?.plaque})
                  </td>
                  <td className="px-4 py-3">{r.date_debut}</td>
                  <td className="px-4 py-3">{r.date_fin}</td>
                  <td className="px-4 py-3">
                    {r.prix_total_usd ? `US$ ${r.prix_total_usd}` : tCommon("dash")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${FASE_CLASSNAMES[fase]}`}
                    >
                      {FASE_LABELS[fase]}
                      {r.statut === "en_attente" &&
                        ` · ${tCommon("reservation_statut_en_attente")}`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/reservations/${r.id}`}
                      className="text-brand hover:underline"
                    >
                      {tCommon("edit")}
                    </Link>
                  </td>
                </tr>
              );
            })}
            {reservations?.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-ink-soft">
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
