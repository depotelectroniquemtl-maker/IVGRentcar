import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { EntretienForm } from "@/components/admin/EntretienForm";

export default async function NuevoEntretienPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicule_id?: string }>;
}) {
  const { vehicule_id: vehiculeIdPreseleccionado } = await searchParams;
  const supabase = createClient();
  const t = await getAdminTranslator("admin.entretiens");
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
      <EntretienForm
        vehicules={vehiculesFormatted}
        vehiculeIdPreseleccionado={vehiculeIdPreseleccionado}
      />
    </div>
  );
}
