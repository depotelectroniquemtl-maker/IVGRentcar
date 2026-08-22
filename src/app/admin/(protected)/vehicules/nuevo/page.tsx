import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/queries/profile";
import { VehiculeForm } from "@/components/admin/VehiculeForm";

// Création réservée aux admins (policy RLS "vehicules_insert_admin") — un employé peut
// modifier une fiche existante mais pas ajouter une nouvelle unité à la flotte.
export default async function NuevoVehiculoPage() {
  const profile = await getCurrentProfile();

  if (profile?.role !== "admin") {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <p className="text-ink">Acceso restringido a administradores.</p>
      </div>
    );
  }

  const supabase = createClient();
  const { data: categories } = await supabase
    .from("categories_vehicules")
    .select("id, nom")
    .order("nom");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Nuevo vehículo</h1>
      <VehiculeForm categories={categories ?? []} />
    </div>
  );
}
