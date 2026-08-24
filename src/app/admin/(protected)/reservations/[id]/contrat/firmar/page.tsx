import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { FirmarContratForm } from "@/components/admin/FirmarContratForm";
import { Card, secondaryLinkClass } from "@/components/admin/form-ui";

export default async function FirmarContratPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient();
  const t = await getAdminTranslator("admin.contrats");
  const tReservations = await getAdminTranslator("admin.reservations");
  const tCommon = await getAdminTranslator("admin.common");

  const { data: reservation } = await supabase
    .from("reservations")
    .select(
      "id, date_debut, date_fin, prix_total_usd, clients(nom), vehicules(plaque, categories_vehicules(nom))",
    )
    .eq("id", id)
    .single();

  if (!reservation || !reservation.clients || !reservation.vehicules) notFound();

  // Signer suppose un contrat déjà finalisé (c'est la ligne contrats_location qui
  // reçoit la signature) — sans ça, rien à mettre à jour, on renvoie vers la
  // finalisation plutôt que de laisser l'utilisateur signer dans le vide.
  const { data: contrat } = await supabase
    .from("contrats_location")
    .select("id")
    .eq("reservation_id", id)
    .maybeSingle();

  if (!contrat) redirect(`/admin/reservations/${id}/contrat/editar`);

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-ink">{t("firma_title")}</h1>
        <Link href={`/admin/reservations/${id}/contrat`} className={secondaryLinkClass}>
          {tCommon("cancel")}
        </Link>
      </div>

      <p className="text-sm text-ink-soft">{t("firma_intro")}</p>

      <Card title={t("firma_recap_title")}>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-ink-soft">{tReservations("field_cliente")}</dt>
            <dd className="font-medium text-ink">{reservation.clients.nom}</dd>
          </div>
          <div>
            <dt className="text-ink-soft">{tReservations("field_vehiculo")}</dt>
            <dd className="font-medium text-ink">
              {reservation.vehicules.categories_vehicules?.nom} (
              {reservation.vehicules.plaque ?? tCommon("dash")})
            </dd>
          </div>
          <div>
            <dt className="text-ink-soft">{tReservations("col_del")}</dt>
            <dd className="font-medium text-ink">{reservation.date_debut}</dd>
          </div>
          <div>
            <dt className="text-ink-soft">{tReservations("col_al")}</dt>
            <dd className="font-medium text-ink">{reservation.date_fin}</dd>
          </div>
          <div>
            <dt className="text-ink-soft">{tReservations("field_precio")}</dt>
            <dd className="font-medium text-ink">
              {reservation.prix_total_usd ? `US$ ${reservation.prix_total_usd}` : tCommon("dash")}
            </dd>
          </div>
        </dl>
      </Card>

      <Card title={t("action_firmar")}>
        <FirmarContratForm
          reservationId={id}
          clearLabel={t("firma_clear")}
          confirmLabel={t("firma_confirm")}
          savingLabel={tCommon("saving")}
          errorLabel={t("firma_error")}
        />
      </Card>
    </div>
  );
}
