import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/queries/profile";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { VehiculeForm } from "@/components/admin/VehiculeForm";

// Création réservée aux admins (policy RLS "vehicules_insert_admin") — un employé peut
// modifier une fiche existante mais pas ajouter une nouvelle unité à la flotte.
export default async function NuevoVehiculoPage() {
  const profile = await getCurrentProfile();
  const t = await getAdminTranslator("admin.vehicules");

  if (profile?.role !== "admin") {
    const tCommon = await getAdminTranslator("admin.common");
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <p className="text-ink">{tCommon("access_restricted")}</p>
      </div>
    );
  }

  const supabase = createClient();
  const { data: categories } = await supabase
    .from("categories_vehicules")
    .select("id, nom")
    .order("nom");

  return <VehiculeForm title={t("new")} categories={categories ?? []} />;
}
