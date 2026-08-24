import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { getCurrentProfile } from "@/lib/supabase/queries/profile";
import { ClienteForm } from "@/components/admin/ClienteForm";
import { DeleteClientButton } from "@/components/admin/DeleteClientButton";
import { Card } from "@/components/admin/form-ui";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient();
  const t = await getAdminTranslator("admin.clients");
  const tReservations = await getAdminTranslator("admin.reservations");
  const tCommon = await getAdminTranslator("admin.common");
  const profile = await getCurrentProfile();

  const [{ data: cliente }, { data: reservas }] = await Promise.all([
    supabase
      .from("clients")
      .select(
        "id, nom, telephone, email, numero_permis, permis_expiration, cedula, passeport, passeport_expiration, nationalite, adresse, residencia, notes",
      )
      .eq("id", id)
      .single(),
    supabase
      .from("reservations")
      .select(
        "id, numero, date_debut, date_fin, statut, prix_total_usd, vehicules(plaque, categories_vehicules(nom))",
      )
      .eq("client_id", id)
      .order("date_debut", { ascending: false }),
  ]);

  if (!cliente) notFound();

  const STATUT_LABELS: Record<string, string> = {
    en_attente: tCommon("reservation_statut_en_attente"),
    confirmee: tCommon("reservation_statut_confirmee"),
    annulee: tCommon("reservation_statut_annulee"),
  };

  return (
    <div className="flex flex-col gap-5">
      <ClienteForm
        title={t("edit_title", { nom: cliente.nom })}
        secondaryActions={
          profile?.role === "admin" ? (
            <div className="flex justify-end">
              <DeleteClientButton id={cliente.id} />
            </div>
          ) : undefined
        }
        cliente={cliente}
      />

      <Card title={t("reservas_title")}>
        {reservas?.length ? (
          <ul className="flex flex-col divide-y divide-black/5">
            {reservas.map((r) => (
              <li key={r.id} className="flex flex-col gap-1 py-3 text-sm first:pt-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/admin/reservations/${r.id}`}
                    className="font-medium text-brand hover:underline"
                  >
                    #{r.numero} — {r.vehicules?.categories_vehicules?.nom ?? tCommon("dash")} (
                    {r.vehicules?.plaque ?? tCommon("dash")})
                  </Link>
                  <span className="text-ink-soft">{STATUT_LABELS[r.statut] ?? r.statut}</span>
                </div>
                <div className="flex items-center justify-between text-ink-soft">
                  <span>
                    {r.date_debut} → {r.date_fin}
                  </span>
                  <span>{r.prix_total_usd ? `US$ ${r.prix_total_usd}` : tCommon("dash")}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-soft">{tReservations("empty")}</p>
        )}
      </Card>
    </div>
  );
}
