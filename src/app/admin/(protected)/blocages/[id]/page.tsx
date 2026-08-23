import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { BlocageForm } from "@/components/admin/BlocageForm";

export default async function EditarBlocagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient();
  const t = await getAdminTranslator("admin.blocages");
  const tCommon = await getAdminTranslator("admin.common");

  const [{ data: blocage }, { data: vehicules }] = await Promise.all([
    supabase
      .from("indisponibilites_vehicule")
      .select("id, vehicule_id, date_debut, date_fin, motif")
      .eq("id", id)
      .single(),
    supabase.from("vehicules").select("id, plaque, categories_vehicules(nom)").order("plaque"),
  ]);

  if (!blocage) notFound();

  const vehiculesFormatted = (vehicules ?? []).map((v) => ({
    id: v.id,
    plaque: v.plaque,
    categorie_nom: v.categories_vehicules?.nom ?? tCommon("dash"),
  }));

  const vehiculeActuel = vehiculesFormatted.find((v) => v.id === blocage.vehicule_id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">
        {t("edit_title", { vehiculo: vehiculeActuel?.categorie_nom ?? tCommon("dash") })}
      </h1>
      <BlocageForm vehicules={vehiculesFormatted} blocage={blocage} />
    </div>
  );
}
