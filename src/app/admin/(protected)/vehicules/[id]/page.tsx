import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { VehiculeForm } from "@/components/admin/VehiculeForm";

export default async function EditarVehiculoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient();
  const t = await getAdminTranslator("admin.vehicules");

  const [{ data: vehicule }, { data: categories }] = await Promise.all([
    supabase
      .from("vehicules")
      .select("id, categorie_id, plaque, annee, etat_operationnel, notes, actif")
      .eq("id", id)
      .single(),
    supabase.from("categories_vehicules").select("id, nom").order("nom"),
  ]);

  if (!vehicule) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">
        {t("edit_title", { plaque: vehicule.plaque })}
      </h1>
      <VehiculeForm categories={categories ?? []} vehicule={vehicule} />
    </div>
  );
}
