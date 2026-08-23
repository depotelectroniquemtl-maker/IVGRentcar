import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { ReservationForm } from "@/components/admin/ReservationForm";

export default async function NuevaReservaPage({
  searchParams,
}: {
  searchParams: Promise<{
    vehicule_id?: string;
    date_debut?: string;
    date_fin?: string;
    heure_debut?: string;
    heure_fin?: string;
    lieu?: string;
    prix?: string;
    demande_nom?: string;
    demande_whatsapp?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = createClient();
  const t = await getAdminTranslator("admin.reservations");
  const tCommon = await getAdminTranslator("admin.common");

  const [{ data: clients }, { data: vehicules }] = await Promise.all([
    supabase.from("clients").select("id, nom").order("nom"),
    supabase
      .from("vehicules")
      .select("id, plaque, categorie_id, categories_vehicules(nom)")
      .eq("actif", true)
      .order("plaque"),
  ]);

  const vehiculesFormatted = (vehicules ?? []).map((v) => ({
    id: v.id,
    plaque: v.plaque,
    categorie_id: v.categorie_id,
    categorie_nom: v.categories_vehicules?.nom ?? tCommon("dash"),
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">{t("new")}</h1>
      <ReservationForm
        clients={clients ?? []}
        vehicules={vehiculesFormatted}
        prefill={{
          vehiculeId: params.vehicule_id,
          dateDebut: params.date_debut,
          dateFin: params.date_fin,
          heureDebut: params.heure_debut,
          heureFin: params.heure_fin,
          lieu: params.lieu,
          prixEstime: params.prix ? Number(params.prix) : undefined,
          demandeNom: params.demande_nom,
          demandeWhatsapp: params.demande_whatsapp,
        }}
      />
    </div>
  );
}
