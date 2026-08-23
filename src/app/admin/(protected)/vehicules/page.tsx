import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/queries/profile";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { VehiculeRowActions } from "@/components/admin/VehiculeRowActions";
import { Pill, StatCard, tableCardClass, thClass, theadClass, trClass } from "@/components/admin/admin-ui";

const ESTADO_PILL_CLASS: Record<string, string> = {
  disponible: "bg-green-100 text-green-700",
  maintenance: "bg-amber-100 text-amber-700",
  hors_service: "bg-red-100 text-red-700",
};

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
    .select("id, plaque, annee, categorie_nom, etat_operationnel, actif, loue_aujourd_hui")
    .order("categorie_nom");

  const activos = vehicules?.filter((v) => v.actif && v.etat_operationnel === "disponible").length ?? 0;
  const mantenimiento = vehicules?.filter((v) => v.actif && v.etat_operationnel === "maintenance").length ?? 0;
  const fueraDeServicio = vehicules?.filter((v) => v.actif && v.etat_operationnel === "hors_service").length ?? 0;
  const inactivos = vehicules?.filter((v) => !v.actif).length ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {t("subtitle", { count: vehicules?.length ?? 0 })}
          </p>
        </div>
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={t("stat_active")} value={activos} tone="neutral" />
        <StatCard label={t("stat_maintenance")} value={mantenimiento} tone="warn" />
        <StatCard label={t("stat_hors_service")} value={fueraDeServicio} tone="crit" />
        <StatCard label={t("stat_inactive")} value={inactivos} tone="muted" />
      </div>

      <div className={tableCardClass}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className={theadClass}>
              <tr>
                <th className={thClass}>{t("col_categoria")}</th>
                <th className={thClass}>{t("col_placa")}</th>
                <th className={thClass}>{t("col_anio")}</th>
                <th className={thClass}>{t("col_estado")}</th>
                <th className={thClass}>{t("col_hoy")}</th>
                <th className={`${thClass} text-right`}>{t("col_acciones")}</th>
              </tr>
            </thead>
            <tbody>
              {vehicules?.map((v) => (
                <tr key={v.id} className={trClass}>
                  <td className="px-4 py-3 font-medium text-ink">{v.categorie_nom}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">
                    {v.plaque ?? tCommon("dash")}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{v.annee ?? tCommon("dash")}</td>
                  <td className="px-4 py-3">
                    {v.actif ? (
                      <Pill className={v.etat_operationnel ? ESTADO_PILL_CLASS[v.etat_operationnel] : ""}>
                        {v.etat_operationnel ? ETAT_LABELS[v.etat_operationnel] : tCommon("dash")}
                      </Pill>
                    ) : (
                      <Pill className="bg-black/5 text-ink-soft">{t("stat_inactive")}</Pill>
                    )}
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
                  <td className="px-4 py-3">
                    <VehiculeRowActions
                      id={v.id ?? ""}
                      actif={v.actif ?? true}
                      canDeactivate={profile?.role === "admin"}
                    />
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
    </div>
  );
}
