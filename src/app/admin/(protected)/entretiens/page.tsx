import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { Pill, StatCard, tableCardClass, thClass, theadClass, trClass } from "@/components/admin/admin-ui";

export default async function EntretiensPage() {
  const supabase = createClient();
  const t = await getAdminTranslator("admin.entretiens");
  const tCommon = await getAdminTranslator("admin.common");

  const TYPE_LABELS: Record<string, string> = {
    vidange: tCommon("entretien_type_vidange"),
    freins: tCommon("entretien_type_freins"),
    pneus: tCommon("entretien_type_pneus"),
    reparation: tCommon("entretien_type_reparation"),
    inspection: tCommon("entretien_type_inspection"),
    autre: tCommon("entretien_type_autre"),
  };

  const { data: entretiens, error } = await supabase
    .from("entretiens")
    .select(
      "id, type, date_entretien, cout_usd, prochain_entretien, vehicules(plaque, categories_vehicules(nom))",
    )
    .order("date_entretien", { ascending: false })
    .limit(50);

  const hoy = new Date().toISOString().slice(0, 10);
  const en30dias = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const inicioMes = hoy.slice(0, 7);

  const registros = entretiens?.length ?? 0;
  const costoEsteMes =
    entretiens
      ?.filter((e) => e.date_entretien.startsWith(inicioMes))
      .reduce((sum, e) => sum + (e.cout_usd ?? 0), 0) ?? 0;
  const proximos30dias =
    entretiens?.filter((e) => e.prochain_entretien && e.prochain_entretien <= en30dias && e.prochain_entretien >= hoy)
      .length ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
        <Link
          href="/admin/entretiens/nuevo"
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          {t("new")}
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label={t("stat_registros")} value={registros} />
        <StatCard label={t("stat_costo_mes")} value={`US$ ${costoEsteMes}`} />
        <StatCard label={t("stat_proximos_30")} value={proximos30dias} tone="warn" />
      </div>

      <div className={tableCardClass}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className={theadClass}>
              <tr>
                <th className={thClass}>{t("col_vehiculo")}</th>
                <th className={thClass}>{t("col_tipo")}</th>
                <th className={thClass}>{t("col_fecha")}</th>
                <th className={thClass}>{t("col_costo")}</th>
                <th className={thClass}>{t("col_proximo")}</th>
              </tr>
            </thead>
            <tbody>
              {entretiens?.map((e) => {
                const vencido = e.prochain_entretien != null && e.prochain_entretien < hoy;
                return (
                  <tr key={e.id} className={trClass}>
                    <td className="px-4 py-3 font-medium text-ink">
                      {e.vehicules?.categories_vehicules?.nom} (
                      {e.vehicules?.plaque ?? tCommon("dash")})
                    </td>
                    <td className="px-4 py-3">{TYPE_LABELS[e.type] ?? e.type}</td>
                    <td className="px-4 py-3">{e.date_entretien}</td>
                    <td className="px-4 py-3">
                      {e.cout_usd ? `US$ ${e.cout_usd}` : tCommon("dash")}
                    </td>
                    <td className="px-4 py-3">
                      {vencido ? (
                        <Pill className="bg-red-100 text-red-700">{t("vencido")}</Pill>
                      ) : (
                        (e.prochain_entretien ?? tCommon("dash"))
                      )}
                    </td>
                  </tr>
                );
              })}
              {entretiens?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-ink-soft">
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
