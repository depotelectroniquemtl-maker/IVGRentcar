import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/queries/profile";
import { getAdminTranslator } from "@/lib/admin-i18n";

export default async function VehiculesPage() {
  const supabase = createClient();
  const profile = await getCurrentProfile();
  const t = await getAdminTranslator("admin.vehicules");
  const tCommon = await getAdminTranslator("admin.common");

  const ETAT_LABELS: Record<string, string> = {
    disponible: tCommon("vehicule_etat_disponible"),
    maintenance: tCommon("vehicule_etat_maintenance"),
    hors_service: tCommon("vehicule_etat_hors_service"),
  };

  const { data: vehicules, error } = await supabase
    .from("vehicules_disponibilite")
    .select("id, plaque, annee, categorie_nom, etat_operationnel, loue_aujourd_hui")
    .order("categorie_nom");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
        {profile?.role === "admin" && (
          <Link
            href="/admin/vehicules/nuevo"
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            {t("new")}
          </Link>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-black/5 text-ink-soft">
            <tr>
              <th className="px-4 py-3">{t("col_categoria")}</th>
              <th className="px-4 py-3">{t("col_placa")}</th>
              <th className="px-4 py-3">{t("col_anio")}</th>
              <th className="px-4 py-3">{t("col_estado")}</th>
              <th className="px-4 py-3">{t("col_hoy")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {vehicules?.map((v) => (
              <tr key={v.id} className="border-t border-black/5">
                <td className="px-4 py-3 font-medium text-ink">{v.categorie_nom}</td>
                <td className="px-4 py-3">{v.plaque}</td>
                <td className="px-4 py-3">{v.annee ?? tCommon("dash")}</td>
                <td className="px-4 py-3">
                  {v.etat_operationnel ? ETAT_LABELS[v.etat_operationnel] : tCommon("dash")}
                </td>
                <td className="px-4 py-3">
                  {v.loue_aujourd_hui ? (
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                      {t("rented")}
                    </span>
                  ) : (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      {t("free")}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/vehicules/${v.id}`} className="text-brand hover:underline">
                    {tCommon("edit")}
                  </Link>
                </td>
              </tr>
            ))}
            {vehicules?.length === 0 && (
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
