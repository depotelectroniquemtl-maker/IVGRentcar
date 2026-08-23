import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";

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

  return (
    <div className="flex flex-col gap-6">
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

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-black/5 text-ink-soft">
            <tr>
              <th className="px-4 py-3">{t("col_vehiculo")}</th>
              <th className="px-4 py-3">{t("col_tipo")}</th>
              <th className="px-4 py-3">{t("col_fecha")}</th>
              <th className="px-4 py-3">{t("col_costo")}</th>
              <th className="px-4 py-3">{t("col_proximo")}</th>
            </tr>
          </thead>
          <tbody>
            {entretiens?.map((e) => (
              <tr key={e.id} className="border-t border-black/5">
                <td className="px-4 py-3 font-medium text-ink">
                  {e.vehicules?.categories_vehicules?.nom} (
                  {e.vehicules?.plaque ?? tCommon("dash")})
                </td>
                <td className="px-4 py-3">{TYPE_LABELS[e.type] ?? e.type}</td>
                <td className="px-4 py-3">{e.date_entretien}</td>
                <td className="px-4 py-3">
                  {e.cout_usd ? `US$ ${e.cout_usd}` : tCommon("dash")}
                </td>
                <td className="px-4 py-3">{e.prochain_entretien ?? tCommon("dash")}</td>
              </tr>
            ))}
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
  );
}
