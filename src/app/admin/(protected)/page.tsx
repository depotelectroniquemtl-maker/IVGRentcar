import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();

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
    { label: "Reservas en curso", value: enCoursCount ?? 0 },
    { label: "Próximas reservas", value: aVenirCount ?? 0 },
    { label: "Vehículos disponibles hoy", value: `${disponiblesAujourdhui} / ${totalVehicules}` },
  ];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-ink">Panel</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-sm text-ink-soft">{s.label}</p>
            <p className="mt-2 text-3xl font-bold text-brand">{s.value}</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-ink-soft">
        Próximamente: calendario de disponibilidad, alertas de retorno y accesos rápidos
        para crear una reserva.
      </p>
    </div>
  );
}
