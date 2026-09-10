import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { getCurrentProfile } from "@/lib/supabase/queries/profile";
import { ReservationForm } from "@/components/admin/ReservationForm";
import { DeleteReservationButton } from "@/components/admin/DeleteReservationButton";
import { MarcarDevueltoButton } from "@/components/admin/MarcarDevueltoButton";
import { secondaryLinkClass } from "@/components/admin/form-ui";

export default async function EditarReservaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient();
  const t = await getAdminTranslator("admin.reservations");
  const tContrats = await getAdminTranslator("admin.contrats");
  const tCommon = await getAdminTranslator("admin.common");
  const profile = await getCurrentProfile();

  const { data: reservation } = await supabase
    .from("reservations")
    .select(
      "id, numero, client_id, vehicule_id, date_debut, date_fin, date_retour_reelle, heure_debut, heure_fin, lieu_prise_en_charge, statut, prix_total_usd, caution_usd, assurance, notes, clients(nom)",
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
      .select("id, plaque, categorie_id, categories_vehicules(nom)")
      .eq("actif", true)
      .order("plaque"),
    supabase
      .from("vehicules")
      .select("id, plaque, categorie_id, categories_vehicules(nom)")
      .eq("id", reservation.vehicule_id)
      .single(),
  ]);

  const vehiculesById = new Map(
    (vehicules ?? []).map((v) => [
      v.id,
      {
        id: v.id,
        plaque: v.plaque,
        categorie_id: v.categorie_id,
        categorie_nom: v.categories_vehicules?.nom ?? tCommon("dash"),
      },
    ]),
  );
  if (vehiculeActuel && !vehiculesById.has(vehiculeActuel.id)) {
    vehiculesById.set(vehiculeActuel.id, {
      id: vehiculeActuel.id,
      plaque: vehiculeActuel.plaque,
      categorie_id: vehiculeActuel.categorie_id,
      categorie_nom: vehiculeActuel.categories_vehicules?.nom ?? tCommon("dash"),
    });
  }

  const secondaryActions = (
    <div className="flex flex-wrap items-center gap-4 text-sm">
      <Link
        href={`/admin/reservations/${reservation.id}/contrat/editar`}
        className={secondaryLinkClass}
      >
        {tContrats("action_finalizar")}
      </Link>
      <Link href={`/admin/reservations/${reservation.id}/contrat`} className={secondaryLinkClass}>
        {tContrats("action_ver")}
      </Link>
      <MarcarDevueltoButton id={reservation.id} dateRetourReelle={reservation.date_retour_reelle} />
      {profile?.role === "admin" && (
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden h-5 w-px bg-black/10 sm:block" aria-hidden />
          <DeleteReservationButton id={reservation.id} />
        </div>
      )}
    </div>
  );

  return (
    <ReservationForm
      title={t("edit_title", { numero: reservation.numero, cliente: reservation.clients?.nom ?? tCommon("dash") })}
      secondaryActions={secondaryActions}
      clients={clients ?? []}
      vehicules={Array.from(vehiculesById.values())}
      reservation={{
        ...reservation,
        statut: reservation.statut as "en_attente" | "confirmee" | "annulee",
      }}
    />
  );
}
