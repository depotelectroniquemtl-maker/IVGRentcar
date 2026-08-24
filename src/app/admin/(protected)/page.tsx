import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { Pill, StatCard, tableCardClass, thClass, theadClass, trClass } from "@/components/admin/admin-ui";

function diasDesde(dateFin: string, hoy: string) {
  const f = new Date(dateFin + "T00:00:00");
  const h = new Date(hoy + "T00:00:00");
  return Math.round((h.getTime() - f.getTime()) / 86400000);
}

export default async function DashboardPage() {
  const supabase = createClient();
  const t = await getAdminTranslator("admin.dashboard");
  const tReservations = await getAdminTranslator("admin.reservations");
  const tCommon = await getAdminTranslator("admin.common");

  const hoy = new Date().toISOString().slice(0, 10);
  const manana = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const [{ count: enCoursCount }, { count: aVenirCount }, { data: vehicules }, { data: retornos }] =
    await Promise.all([
      supabase
        .from("reservations_avec_phase")
        .select("id", { count: "exact", head: true })
        .eq("phase", "en_cours"),
      supabase
        .from("reservations_avec_phase")
        .select("id", { count: "exact", head: true })
        .eq("phase", "a_venir"),
      supabase.from("vehicules_disponibilite").select("id, loue_aujourd_hui, etat_operationnel"),
      supabase
        .from("reservations")
        .select("id, date_fin, clients(nom), vehicules(plaque, categories_vehicules(nom))")
        .neq("statut", "annulee")
        .is("date_retour_reelle", null)
        .lte("date_fin", manana)
        .order("date_fin", { ascending: true }),
    ]);

  const totalVehicules = vehicules?.length ?? 0;
  const disponiblesAujourdhui =
    vehicules?.filter(
      (v) => !v.loue_aujourd_hui && v.etat_operationnel === "disponible",
    ).length ?? 0;

  const stats = [
    { label: t("stat_active_reservations"), value: enCoursCount ?? 0 },
    { label: t("stat_upcoming_reservations"), value: aVenirCount ?? 0 },
    { label: t("stat_available_today"), value: `${disponiblesAujourdhui} / ${totalVehicules}` },
  ];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">
          {t("quick_actions_title")}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/reservations/nueva"
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            {t("action_nueva_reserva")}
          </Link>
          <Link
            href="/admin/clients/nuevo"
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            {t("action_nuevo_cliente")}
          </Link>
        </div>
      </div>

      <div className={tableCardClass}>
        <div className="flex items-center justify-between gap-3 border-b border-black/10 px-6 py-4">
          <h2 className="text-sm font-bold text-ink">{t("retornos_title")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className={theadClass}>
              <tr>
                <th className={thClass}>{tReservations("col_vehiculo")}</th>
                <th className={thClass}>{tReservations("col_cliente")}</th>
                <th className={thClass}>{tReservations("col_al")}</th>
                <th className={thClass}>{tReservations("col_estado")}</th>
              </tr>
            </thead>
            <tbody>
              {retornos?.map((r) => {
                const esRetraso = r.date_fin < hoy;
                const esHoy = r.date_fin === hoy;
                const href = `/admin/reservations/${r.id}`;
                return (
                  <tr key={r.id} className={trClass}>
                    <td className="p-0">
                      <Link href={href} className="block px-4 py-3">
                        {r.vehicules?.categories_vehicules?.nom} (
                        {r.vehicules?.plaque ?? tCommon("dash")})
                      </Link>
                    </td>
                    <td className="p-0">
                      <Link href={href} className="block px-4 py-3 font-medium text-ink">
                        {r.clients?.nom ?? tCommon("dash")}
                      </Link>
                    </td>
                    <td className="p-0">
                      <Link href={href} className="block px-4 py-3">
                        {r.date_fin}
                      </Link>
                    </td>
                    <td className="p-0">
                      <Link href={href} className="block px-4 py-3">
                        {esRetraso ? (
                          <Pill className="bg-red-100 text-red-700">
                            {t("retorno_en_retraso", { n: diasDesde(r.date_fin, hoy) })}
                          </Pill>
                        ) : esHoy ? (
                          <Pill className="bg-amber-100 text-amber-700">{t("retorno_hoy")}</Pill>
                        ) : (
                          <Pill className="bg-black/5 text-ink-soft">{t("retorno_manana")}</Pill>
                        )}
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {retornos?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-ink-soft">
                    {t("retornos_empty")}
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
