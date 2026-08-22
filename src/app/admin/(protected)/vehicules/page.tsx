import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/queries/profile";

const ETAT_LABELS: Record<string, string> = {
  disponible: "Disponible",
  maintenance: "Mantenimiento",
  hors_service: "Fuera de servicio",
};

export default async function VehiculesPage() {
  const supabase = createClient();
  const profile = await getCurrentProfile();

  const { data: vehicules, error } = await supabase
    .from("vehicules_disponibilite")
    .select("id, plaque, annee, categorie_nom, etat_operationnel, loue_aujourd_hui")
    .order("categorie_nom");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Vehículos</h1>
        {profile?.role === "admin" && (
          <Link
            href="/admin/vehicules/nuevo"
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Nuevo vehículo
          </Link>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-black/5 text-ink-soft">
            <tr>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Placa</th>
              <th className="px-4 py-3">Año</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Hoy</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {vehicules?.map((v) => (
              <tr key={v.id} className="border-t border-black/5">
                <td className="px-4 py-3 font-medium text-ink">{v.categorie_nom}</td>
                <td className="px-4 py-3">{v.plaque}</td>
                <td className="px-4 py-3">{v.annee ?? "—"}</td>
                <td className="px-4 py-3">
                  {v.etat_operationnel ? ETAT_LABELS[v.etat_operationnel] : "—"}
                </td>
                <td className="px-4 py-3">
                  {v.loue_aujourd_hui ? (
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                      Alquilado
                    </span>
                  ) : (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      Libre
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/vehicules/${v.id}`} className="text-brand hover:underline">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {vehicules?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-soft">
                  Ningún vehículo registrado todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
