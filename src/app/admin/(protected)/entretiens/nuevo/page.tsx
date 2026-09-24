import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { EntretienForm } from "@/components/admin/EntretienForm";
import { estGroupeValide, groupeDeType } from "@/lib/vehicule-groupe";

export default async function NuevoEntretienPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicule_id?: string; groupe?: string }>;
}) {
  const { vehicule_id: vehiculeIdPreseleccionado, groupe: groupeParam } = await searchParams;
  const supabase = createClient();
  const t = await getAdminTranslator("admin.entretiens");
  const tCommon = await getAdminTranslator("admin.common");

  const { data: vehicules } = await supabase
    .from("vehicules")
    .select("id, plaque, categories_vehicules(nom, type)")
    .order("plaque");

  // Un véhicule présélectionné (depuis sa fiche) impose son groupe ; sinon ?groupe=, sinon voitures.
  const vehiculePresel = vehicules?.find((v) => v.id === vehiculeIdPreseleccionado);
  const groupe = vehiculePresel
    ? groupeDeType(vehiculePresel.categories_vehicules?.type)
    : estGroupeValide(groupeParam)
      ? groupeParam
      : "voitures";

  const vehiculesFormatted = (vehicules ?? [])
    .filter((v) => groupeDeType(v.categories_vehicules?.type) === groupe)
    .map((v) => ({
      id: v.id,
      plaque: v.plaque,
      categorie_nom: v.categories_vehicules?.nom ?? tCommon("dash"),
    }));

  return (
    <EntretienForm
      title={t("new")}
      vehicules={vehiculesFormatted}
      vehiculeIdPreseleccionado={vehiculePresel?.id}
      groupe={groupe}
    />
  );
}
