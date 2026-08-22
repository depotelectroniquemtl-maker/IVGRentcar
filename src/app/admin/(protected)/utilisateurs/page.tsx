import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/queries/profile";

// Écran réservé aux admins — la vérification se fait ici, côté serveur (pas seulement en
// cachant le lien dans la Sidebar). Un employé qui arriverait quand même sur cette URL
// voit un message de refus, et de toute façon la policy RLS "profiles_select_own_or_admin"
// l'empêcherait de voir les autres comptes.
export default async function UtilisateursPage() {
  const profile = await getCurrentProfile();

  if (profile?.role !== "admin") {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <p className="text-ink">Acceso restringido a administradores.</p>
      </div>
    );
  }

  const supabase = createClient();
  const { data: usuarios, error } = await supabase
    .from("profiles")
    .select("id, nom, role")
    .order("nom");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Usuarios</h1>
        <p className="text-sm text-ink-soft">
          Crear / editar cuentas de empleados — próximamente
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead className="bg-black/5 text-ink-soft">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Rol</th>
            </tr>
          </thead>
          <tbody>
            {usuarios?.map((u) => (
              <tr key={u.id} className="border-t border-black/5">
                <td className="px-4 py-3 font-medium text-ink">{u.nom}</td>
                <td className="px-4 py-3">
                  {u.role === "admin" ? "Admin" : "Empleado"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
