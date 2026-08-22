import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const STATUT_LABELS: Record<string, string> = {
  en_attente: "Pendiente",
  confirmee: "Confirmada",
  annulee: "Anulada",
};

function calcularFase(dateDebut: string, dateFin: string, statut: string) {
  if (statut === "annulee") return "annulee";
  const hoy = new Date().toISOString().slice(0, 10);
  if (hoy < dateDebut) return "a_venir";
  if (hoy > dateFin) return "terminee";
  return "en_cours";
}

const FASE_LABELS: Record<string, { label: string; className: string }> = {
  a_venir: { label: "Próxima", className: "bg-blue-100 text-blue-700" },
  en_cours: { label: "En curso", className: "bg-green-100 text-green-700" },
  terminee: { label: "Terminada", className: "bg-black/10 text-ink-soft" },
  annulee: { label: "Anulada", className: "bg-red-100 text-red-700" },
};

export default async function ReservationsPage() {
  const supabase = createClient();

  const { data: reservations, error } = await supabase
    .from("reservations")
    .select(
      "id, date_debut, date_fin, statut, prix_total_usd, vehicules(plaque, categories_vehicules(nom)), clients(nom)",
    )
    .order("date_debut", { ascending: false })
    .limit(50);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Reservas</h1>
        <Link
          href="/admin/reservations/nueva"
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Nueva reserva
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-black/5 text-ink-soft">
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Vehículo</th>
              <th className="px-4 py-3">Del</th>
              <th className="px-4 py-3">Al</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {reservations?.map((r) => {
              const fase = calcularFase(r.date_debut, r.date_fin, r.statut);
              const faseInfo = FASE_LABELS[fase];
              return (
                <tr key={r.id} className="border-t border-black/5">
                  <td className="px-4 py-3 font-medium text-ink">
                    {r.clients?.nom ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {r.vehicules?.categories_vehicules?.nom} ({r.vehicules?.plaque})
                  </td>
                  <td className="px-4 py-3">{r.date_debut}</td>
                  <td className="px-4 py-3">{r.date_fin}</td>
                  <td className="px-4 py-3">
                    {r.prix_total_usd ? `US$ ${r.prix_total_usd}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${faseInfo.className}`}
                    >
                      {faseInfo.label}
                      {r.statut === "en_attente" && ` · ${STATUT_LABELS[r.statut]}`}
                    </span>
                  </td>
                </tr>
              );
            })}
            {reservations?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-soft">
                  Ninguna reserva todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
