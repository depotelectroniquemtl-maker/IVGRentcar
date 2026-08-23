import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { DemandeStatutSelect } from "@/components/admin/DemandeStatutSelect";
import { StatCard, tableCardClass, thClass, theadClass, trClass } from "@/components/admin/admin-ui";

export default async function DemandesPage() {
  const supabase = createClient();
  const t = await getAdminTranslator("admin.demandes");
  const tCommon = await getAdminTranslator("admin.common");

  const { data: demandes, error } = await supabase
    .from("demandes_reservation")
    .select(
      "id, nom, whatsapp, vehicule_id, date_debut, date_fin, heure_debut, heure_fin, lieu_prise_en_charge, prix_estime_usd, statut, vehicules(plaque, categories_vehicules(nom))",
    )
    .order("created_at", { ascending: false });

  const nuevas = demandes?.filter((d) => d.statut === "nouvelle").length ?? 0;
  const contactadas = demandes?.filter((d) => d.statut === "contactee").length ?? 0;
  const convertidas = demandes?.filter((d) => d.statut === "convertie").length ?? 0;
  const rechazadas = demandes?.filter((d) => d.statut === "rejetee").length ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
        <p className="text-sm text-ink-soft">{t("subtitle")}</p>
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={t("statut_nouvelle")} value={nuevas} />
        <StatCard label={t("statut_contactee")} value={contactadas} tone="warn" />
        <StatCard label={t("statut_convertie")} value={convertidas} />
        <StatCard label={t("statut_rejetee")} value={rechazadas} tone="muted" />
      </div>

      <div className={tableCardClass}>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className={theadClass}>
            <tr>
              <th className={thClass}>{t("col_nombre")}</th>
              <th className={thClass}>{t("col_whatsapp")}</th>
              <th className={thClass}>{t("col_vehiculo")}</th>
              <th className={thClass}>{t("col_del")}</th>
              <th className={thClass}>{t("col_al")}</th>
              <th className={thClass}>{t("col_horario")}</th>
              <th className={thClass}>{t("col_precio")}</th>
              <th className={thClass}>{t("col_estado")}</th>
              <th className={`${thClass} text-right`}>{t("col_acciones")}</th>
            </tr>
          </thead>
          <tbody>
            {demandes?.map((d) => {
              const convertirParams = new URLSearchParams({
                vehicule_id: d.vehicule_id,
                date_debut: d.date_debut,
                date_fin: d.date_fin,
                demande_nom: d.nom,
                demande_whatsapp: d.whatsapp,
              });
              if (d.heure_debut) convertirParams.set("heure_debut", d.heure_debut.slice(0, 5));
              if (d.heure_fin) convertirParams.set("heure_fin", d.heure_fin.slice(0, 5));
              if (d.lieu_prise_en_charge) convertirParams.set("lieu", d.lieu_prise_en_charge);
              if (d.prix_estime_usd) convertirParams.set("prix", String(d.prix_estime_usd));

              return (
                <tr key={d.id} className={trClass}>
                  <td className="px-4 py-3 font-medium text-ink">{d.nom}</td>
                  <td className="px-4 py-3">{d.whatsapp}</td>
                  <td className="px-4 py-3">
                    {d.vehicules?.categories_vehicules?.nom ?? tCommon("dash")}
                    {d.vehicules?.plaque ? ` (${d.vehicules.plaque})` : ""}
                  </td>
                  <td className="px-4 py-3">{d.date_debut}</td>
                  <td className="px-4 py-3">{d.date_fin}</td>
                  <td className="px-4 py-3">
                    {d.heure_debut ?? tCommon("dash")} → {d.heure_fin ?? tCommon("dash")}
                  </td>
                  <td className="px-4 py-3">
                    {d.prix_estime_usd ? `US$ ${d.prix_estime_usd}` : tCommon("dash")}
                  </td>
                  <td className="px-4 py-3">
                    <DemandeStatutSelect id={d.id} statut={d.statut} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <Link
                        href={`/admin/reservations/nueva?${convertirParams.toString()}`}
                        className="inline-flex items-center rounded-md bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand-dark transition-colors hover:bg-brand/20"
                      >
                        {t("convert")}
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {demandes?.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-ink-soft">
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
