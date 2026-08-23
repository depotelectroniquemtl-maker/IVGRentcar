import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { BlocageForm } from "@/components/admin/BlocageForm";

export default async function NuevoBlocagePage({
  searchParams,
}: {
  searchParams: Promise<{ vehicule_id?: string; date_debut?: string }>;
}) {
  const params = await searchParams;
  const supabase = createClient();
  const t = await getAdminTranslator("admin.blocages");
  const tCommon = await getAdminTranslator("admin.common");

  const { data: vehicules } = await supabase
    .from("vehicules")
    .select("id, plaque, categories_vehicules(nom)")
    .order("plaque");

  const vehiculesFormatted = (vehicules ?? []).map((v) => ({
    id: v.id,
    plaque: v.plaque,
    categorie_nom: v.categories_vehicules?.nom ?? tCommon("dash"),
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">{t("new")}</h1>
      <BlocageForm
        vehicules={vehiculesFormatted}
        vehiculeIdPreseleccionado={params.vehicule_id}
        dateDebutPreseleccionada={params.date_debut}
      />
    </div>
  );
}
