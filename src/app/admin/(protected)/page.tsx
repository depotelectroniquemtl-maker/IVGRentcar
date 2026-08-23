import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { StatCard } from "@/components/admin/admin-ui";

export default async function DashboardPage() {
  const supabase = createClient();
  const t = await getAdminTranslator("admin.dashboard");

  const [{ count: enCoursCount }, { count: aVenirCount }, { data: vehicules }] =
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

      <p className="text-sm text-ink-soft">{t("coming_soon")}</p>
    </div>
  );
}
