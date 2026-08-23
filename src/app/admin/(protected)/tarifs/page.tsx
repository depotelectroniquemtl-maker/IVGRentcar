import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/queries/profile";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { TarifaInput } from "@/components/admin/TarifaInput";
import { tableCardClass, thClass, theadClass, trClass } from "@/components/admin/admin-ui";

export default async function TarifsPage() {
  const supabase = createClient();
  const profile = await getCurrentProfile();
  const esAdmin = profile?.role === "admin";
  const t = await getAdminTranslator("admin.tarifs");
  const tCommon = await getAdminTranslator("admin.common");

  const { data: categories, error } = await supabase
    .from("categories_vehicules")
    .select("id, nom, actif, tarifs(id, palier, prix_usd)")
    .order("nom");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
        <p className="text-sm text-ink-soft">
          {esAdmin ? t("subtitle_admin") : t("subtitle_readonly")}
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <div className={tableCardClass}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className={theadClass}>
              <tr>
                <th className={thClass}>{t("col_categoria")}</th>
                <th className={thClass}>{t("col_1_3")}</th>
                <th className={thClass}>{t("col_4_plus")}</th>
                <th className={thClass}>{t("col_15_plus")}</th>
                <th className={thClass}>{t("col_activo")}</th>
              </tr>
            </thead>
            <tbody>
              {categories?.map((cat) => {
                const tarifs = Object.fromEntries(
                  (cat.tarifs ?? []).map((tarif) => [tarif.palier, tarif]),
                ) as Record<string, { id: string; prix_usd: number }>;
                return (
                  <tr key={cat.id} className={trClass}>
                    <td className="px-4 py-3 font-medium text-ink">{cat.nom}</td>
                    {(["1_3_jours", "4_plus_jours", "15_plus_jours"] as const).map((palier) => (
                      <td key={palier} className="px-4 py-3">
                        {tarifs[palier] && esAdmin ? (
                          <TarifaInput id={tarifs[palier].id} prixInicial={tarifs[palier].prix_usd} />
                        ) : (
                          <span>US$ {tarifs[palier]?.prix_usd ?? tCommon("dash")}</span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3">{cat.actif ? tCommon("yes") : tCommon("no")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
