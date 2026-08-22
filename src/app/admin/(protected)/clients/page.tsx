import { createClient } from "@/lib/supabase/server";

export default async function ClientsPage() {
  const supabase = createClient();

  const { data: clients, error } = await supabase
    .from("clients")
    .select("id, nom, telephone, email, numero_permis")
    .order("nom");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Clientes</h1>
        <p className="text-sm text-ink-soft">Crear / editar — próximamente</p>
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-black/5 text-ink-soft">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Teléfono</th>
              <th className="px-4 py-3">Correo</th>
              <th className="px-4 py-3">Licencia</th>
            </tr>
          </thead>
          <tbody>
            {clients?.map((c) => (
              <tr key={c.id} className="border-t border-black/5">
                <td className="px-4 py-3 font-medium text-ink">{c.nom}</td>
                <td className="px-4 py-3">{c.telephone ?? "—"}</td>
                <td className="px-4 py-3">{c.email ?? "—"}</td>
                <td className="px-4 py-3">{c.numero_permis ?? "—"}</td>
              </tr>
            ))}
            {clients?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-ink-soft">
                  Ningún cliente todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
