import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { EditRowLink, Pill, StatCard, tableCardClass, thClass, theadClass, trClass } from "@/components/admin/admin-ui";

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
      "id, numero, date_debut, date_fin, statut, prix_total_usd, vehicules(plaque, categories_vehicules(nom)), clients(nom)",
    )
    .order("date_debut", { ascending: false })
    .limit(50);

  const fases = reservations?.map((r) => calcularFase(r.date_debut, r.date_fin, r.statut)) ?? [];
  const enCurso = fases.filter((f) => f === "en_cours").length;
  const proximas = fases.filter((f) => f === "a_venir").length;
  const pendientes = reservations?.filter((r) => r.statut === "en_attente").length ?? 0;
  const canceladas = reservations?.filter((r) => r.statut === "annulee").length ?? 0;

  return (
    <div className="flex flex-col gap-5">
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={t("stat_en_curso")} value={enCurso} />
        <StatCard label={t("stat_proximas")} value={proximas} />
        <StatCard label={t("stat_pendientes")} value={pendientes} tone="warn" />
        <StatCard label={t("stat_canceladas")} value={canceladas} tone="muted" />
      </div>

      <div className={tableCardClass}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className={theadClass}>
              <tr>
                <th className={thClass}>{t("col_numero")}</th>
                <th className={thClass}>{t("col_cliente")}</th>
                <th className={thClass}>{t("col_vehiculo")}</th>
                <th className={thClass}>{t("col_del")}</th>
                <th className={thClass}>{t("col_al")}</th>
                <th className={thClass}>{t("col_precio")}</th>
                <th className={thClass}>{t("col_estado")}</th>
                <th className={`${thClass} text-right`}>{t("col_acciones")}</th>
              </tr>
            </thead>
            <tbody>
              {reservations?.map((r) => {
                const fase = calcularFase(r.date_debut, r.date_fin, r.statut);
                return (
                  <tr key={r.id} className={trClass}>
                    <td className="px-4 py-3 font-mono text-xs text-ink-soft">#{r.numero}</td>
                    <td className="px-4 py-3 font-medium text-ink">
                      {r.clients?.nom ?? tCommon("dash")}
                    </td>
                    <td className="px-4 py-3">
                      {r.vehicules?.categories_vehicules?.nom} ({r.vehicules?.plaque ?? tCommon("dash")})
                    </td>
                    <td className="px-4 py-3">{r.date_debut}</td>
                    <td className="px-4 py-3">{r.date_fin}</td>
                    <td className="px-4 py-3">
                      {r.prix_total_usd ? `US$ ${r.prix_total_usd}` : tCommon("dash")}
                    </td>
                    <td className="px-4 py-3">
                      <Pill className={FASE_CLASSNAMES[fase]}>
                        {FASE_LABELS[fase]}
                        {r.statut === "en_attente" &&
                          ` · ${tCommon("reservation_statut_en_attente")}`}
                      </Pill>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <EditRowLink href={`/admin/reservations/${r.id}`} title={tCommon("edit")} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {reservations?.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-ink-soft">
                    {t("empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
