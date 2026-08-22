import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { DemandeStatutSelect } from "@/components/admin/DemandeStatutSelect";

export default async function DemandesPage() {
  const supabase = createClient();
  const t = await getAdminTranslator("admin.demandes");
  const tCommon = await getAdminTranslator("admin.common");

  const { data: demandes, error } = await supabase
    .from("demandes_reservation")
    .select(
      "id, nom, whatsapp, date_debut, date_fin, statut, categories_vehicules(nom)",
    )
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
        <p className="text-sm text-ink-soft">{t("subtitle")}</p>
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-black/5 text-ink-soft">
            <tr>
              <th className="px-4 py-3">{t("col_nombre")}</th>
              <th className="px-4 py-3">{t("col_whatsapp")}</th>
              <th className="px-4 py-3">{t("col_categoria")}</th>
              <th className="px-4 py-3">{t("col_del")}</th>
              <th className="px-4 py-3">{t("col_al")}</th>
              <th className="px-4 py-3">{t("col_estado")}</th>
            </tr>
          </thead>
          <tbody>
            {demandes?.map((d) => (
              <tr key={d.id} className="border-t border-black/5">
                <td className="px-4 py-3 font-medium text-ink">{d.nom}</td>
                <td className="px-4 py-3">{d.whatsapp}</td>
                <td className="px-4 py-3">{d.categories_vehicules?.nom ?? tCommon("dash")}</td>
                <td className="px-4 py-3">{d.date_debut}</td>
                <td className="px-4 py-3">{d.date_fin}</td>
                <td className="px-4 py-3">
                  <DemandeStatutSelect id={d.id} statut={d.statut} />
                </td>
              </tr>
            ))}
            {demandes?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-soft">
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
