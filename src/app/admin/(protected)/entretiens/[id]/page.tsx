import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { EntretienForm } from "@/components/admin/EntretienForm";
import { groupeDeType } from "@/lib/vehicule-groupe";

export default async function EditarEntretienPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient();
  const t = await getAdminTranslator("admin.entretiens");
  const tCommon = await getAdminTranslator("admin.common");

  const { data: entretien } = await supabase
    .from("entretiens")
    .select(
      "id, vehicule_id, type, date_entretien, cout_usd, prochain_entretien, notes, vehicules(plaque, categories_vehicules(nom, type))",
    )
    .eq("id", id)
    .single();

  if (!entretien) notFound();

  const { data: vehicules } = await supabase
    .from("vehicules")
    .select("id, plaque, categories_vehicules(nom, type)")
    .order("plaque");

  const groupe = groupeDeType(entretien.vehicules?.categories_vehicules?.type);

  const vehiculesFormatted = (vehicules ?? [])
    .filter((v) => groupeDeType(v.categories_vehicules?.type) === groupe)
    .map((v) => ({
      id: v.id,
      plaque: v.plaque,
      categorie_nom: v.categories_vehicules?.nom ?? tCommon("dash"),
    }));

  const vehiculeLabel = `${entretien.vehicules?.categories_vehicules?.nom ?? ""} (${
    entretien.vehicules?.plaque ?? tCommon("dash")
  })`;

  return (
    <EntretienForm
      title={t("edit_title", { vehiculo: vehiculeLabel })}
      vehicules={vehiculesFormatted}
      entretien={entretien}
      groupe={groupe}
    />
  );
}
