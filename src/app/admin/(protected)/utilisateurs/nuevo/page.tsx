import { getCurrentProfile } from "@/lib/supabase/queries/profile";
import { UsuarioForm } from "@/components/admin/UsuarioForm";

export default async function NuevoUsuarioPage() {
  const profile = await getCurrentProfile();

  if (profile?.role !== "admin") {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <p className="text-ink">Acceso restringido a administradores.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Nuevo usuario</h1>
      <UsuarioForm />
    </div>
  );
}
