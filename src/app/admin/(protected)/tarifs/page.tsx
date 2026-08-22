import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/queries/profile";

export default async function TarifsPage() {
  const supabase = createClient();
  const profile = await getCurrentProfile();

  const { data: categories, error } = await supabase
    .from("categories_vehicules")
    .select("id, nom, actif, tarifs(palier, prix_usd)")
    .order("nom");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Tarifas</h1>
        {profile?.role === "admin" ? (
          <p className="text-sm text-ink-soft">Edición de precios — próximamente</p>
        ) : (
          <p className="text-sm text-ink-soft">Solo lectura — contacta a un admin para modificar</p>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-black/5 text-ink-soft">
            <tr>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">1-3 días</th>
              <th className="px-4 py-3">4+ días</th>
              <th className="px-4 py-3">15+ días</th>
              <th className="px-4 py-3">Activo</th>
            </tr>
          </thead>
          <tbody>
            {categories?.map((cat) => {
              const tarifs = Object.fromEntries(
                (cat.tarifs ?? []).map((t) => [t.palier, t.prix_usd]),
              ) as Record<string, number>;
              return (
                <tr key={cat.id} className="border-t border-black/5">
                  <td className="px-4 py-3 font-medium text-ink">{cat.nom}</td>
                  <td className="px-4 py-3">US$ {tarifs["1_3_jours"] ?? "—"}</td>
                  <td className="px-4 py-3">US$ {tarifs["4_plus_jours"] ?? "—"}</td>
                  <td className="px-4 py-3">US$ {tarifs["15_plus_jours"] ?? "—"}</td>
                  <td className="px-4 py-3">{cat.actif ? "Sí" : "No"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
