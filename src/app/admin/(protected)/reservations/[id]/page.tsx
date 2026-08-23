import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { ReservationForm } from "@/components/admin/ReservationForm";

export default async function EditarReservaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient();
  const t = await getAdminTranslator("admin.reservations");
  const tCommon = await getAdminTranslator("admin.common");

  const { data: reservation } = await supabase
    .from("reservations")
    .select(
      "id, client_id, vehicule_id, date_debut, date_fin, statut, prix_total_usd, caution_usd, notes, clients(nom)",
    )
    .eq("id", id)
    .single();

  if (!reservation) notFound();

  // Le véhicule assigné doit rester sélectionnable même s'il a été désactivé depuis —
  // sinon le formulaire d'édition perdrait silencieusement la valeur actuelle.
  const [{ data: clients }, { data: vehicules }, { data: vehiculeActuel }] = await Promise.all([
    supabase.from("clients").select("id, nom").order("nom"),
    supabase
      .from("vehicules")
      .select("id, plaque, categories_vehicules(nom)")
      .eq("actif", true)
      .order("plaque"),
    supabase
      .from("vehicules")
      .select("id, plaque, categories_vehicules(nom)")
      .eq("id", reservation.vehicule_id)
      .single(),
  ]);

  const vehiculesById = new Map(
    (vehicules ?? []).map((v) => [
      v.id,
      { id: v.id, plaque: v.plaque, categorie_nom: v.categories_vehicules?.nom ?? tCommon("dash") },
    ]),
  );
  if (vehiculeActuel && !vehiculesById.has(vehiculeActuel.id)) {
    vehiculesById.set(vehiculeActuel.id, {
      id: vehiculeActuel.id,
      plaque: vehiculeActuel.plaque,
      categorie_nom: vehiculeActuel.categories_vehicules?.nom ?? tCommon("dash"),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">
        {t("edit_title", { cliente: reservation.clients?.nom ?? tCommon("dash") })}
      </h1>
      <ReservationForm
        clients={clients ?? []}
        vehicules={Array.from(vehiculesById.values())}
        reservation={{
          ...reservation,
          statut: reservation.statut as "en_attente" | "confirmee" | "annulee",
        }}
      />
    </div>
  );
}
