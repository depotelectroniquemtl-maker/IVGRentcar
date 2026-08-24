import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { getCurrentProfile } from "@/lib/supabase/queries/profile";
import { ContratForm } from "@/components/admin/ContratForm";

export default async function EditarContratoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient();
  const t = await getAdminTranslator("admin.contrats");
  const tCommon = await getAdminTranslator("admin.common");
  const profile = await getCurrentProfile();
  if (!profile) notFound();

  const [{ data: reservation }, { data: contrat }, { data: garantesGuardados }] = await Promise.all([
    supabase
      .from("reservations")
      .select("id, prix_total_usd, vehicules(couleur, plaque, categories_vehicules(nom))")
      .eq("id", id)
      .single(),
    supabase
      .from("contrats_location")
      .select(
        "id, heure_remise, couleur_vehicule, deducible_usd, abono_usd, solde_usd, niveau_essence, accessoires, garant_id, garant_nom, garant_adresse, garant_cedula, garant_telephone, notes",
      )
      .eq("reservation_id", id)
      .maybeSingle(),
    supabase.from("garants").select("id, nom, telephone, cedula, adresse").order("nom"),
  ]);

  if (!reservation) notFound();

  const vehiculeLabel = `${reservation.vehicules?.categories_vehicules?.nom ?? tCommon("dash")} (${reservation.vehicules?.plaque ?? tCommon("dash")})`;

  return (
    <ContratForm
      title={t("edit_title", { vehiculo: vehiculeLabel })}
      reservationId={id}
      prixTotalUsd={reservation.prix_total_usd}
      couleurVehiculeParDefaut={reservation.vehicules?.couleur ?? null}
      garantesGuardados={garantesGuardados ?? []}
      contrat={
        contrat
          ? { ...contrat, accessoires: (contrat.accessoires as Record<string, boolean>) ?? {} }
          : undefined
      }
    />
  );
}
