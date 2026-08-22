import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { ReservationForm } from "@/components/admin/ReservationForm";

export default async function NuevaReservaPage() {
  const supabase = createClient();
  const t = await getAdminTranslator("admin.reservations");
  const tCommon = await getAdminTranslator("admin.common");

  const [{ data: clients }, { data: vehicules }] = await Promise.all([
    supabase.from("clients").select("id, nom").order("nom"),
    supabase
      .from("vehicules")
      .select("id, plaque, categories_vehicules(nom)")
      .eq("actif", true)
      .order("plaque"),
  ]);

  const vehiculesFormatted = (vehicules ?? []).map((v) => ({
    id: v.id,
    plaque: v.plaque,
    categorie_nom: v.categories_vehicules?.nom ?? tCommon("dash"),
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">{t("new")}</h1>
      <ReservationForm clients={clients ?? []} vehicules={vehiculesFormatted} />
    </div>
  );
}
