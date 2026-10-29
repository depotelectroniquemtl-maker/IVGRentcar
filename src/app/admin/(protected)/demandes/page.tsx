import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { DemandeStatutSelect } from "@/components/admin/DemandeStatutSelect";
import { ConvertirDemandeButton } from "@/components/admin/ConvertirDemandeButton";
import { StatCard, tableCardClass, thClass, theadClass, trClass } from "@/components/admin/admin-ui";
import { SearchInput } from "@/components/admin/SearchInput";
import { buildContactMessage, whatsappHref } from "@/lib/contact-messages";

export default async function DemandesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: qRaw } = await searchParams;
  const q = qRaw?.trim().toLowerCase() ?? "";
  const supabase = createClient();
  const t = await getAdminTranslator("admin.demandes");
  const tCommon = await getAdminTranslator("admin.common");

  const { data: demandes, error } = await supabase
    .from("demandes_reservation")
    .select(
      "id, nom, whatsapp, whatsapp_a_verifier, langue, email, vehicule_id, date_debut, date_fin, heure_debut, heure_fin, lieu_prise_en_charge, prix_estime_usd, statut, vehicules(plaque, categories_vehicules(nom))",
    )
    .order("created_at", { ascending: false });

  // Réservation créée à partir de chaque demande (lien demande_id), pour « Voir la réservation ».
  const { data: liens } = demandes?.length
    ? await supabase
        .from("reservations")
        .select("id, demande_id, client_id")
        .in(
          "demande_id",
          demandes.map((d) => d.id),
        )
    : { data: [] };
  const reservationParDemande = new Map(
    (liens ?? []).flatMap((r) => (r.demande_id ? [[r.demande_id, r.id] as const] : [])),
  );

  // Fiche client de chaque demande, pour rendre le nom cliquable : le client de la réservation
  // liée (demande convertie) s'il existe, sinon l'unique fiche client portant le même numéro
  // WhatsApp. Aucune fiche, ou plusieurs fiches pour ce numéro : le nom reste du texte simple.
  const { data: clientsMemeTel } = demandes?.length
    ? await supabase
        .from("clients")
        .select("id, telephone")
        .in(
          "telephone",
          Array.from(new Set(demandes.map((d) => d.whatsapp))),
        )
    : { data: [] };
  const clientsParTel = new Map<string, string[]>();
  for (const c of clientsMemeTel ?? []) {
    if (c.telephone) clientsParTel.set(c.telephone, [...(clientsParTel.get(c.telephone) ?? []), c.id]);
  }
  const clientParDemande = new Map(
    (demandes ?? []).flatMap((d) => {
      const viaReservation = liens?.find((r) => r.demande_id === d.id)?.client_id;
      const memeTel = clientsParTel.get(d.whatsapp);
      const id = viaReservation ?? (memeTel?.length === 1 ? memeTel[0] : null);
      return id ? [[d.id, id] as const] : [];
    }),
  );

  const nuevas = demandes?.filter((d) => d.statut === "nouvelle").length ?? 0;
  const contactadas = demandes?.filter((d) => d.statut === "contactee").length ?? 0;
  const convertidas = demandes?.filter((d) => d.statut === "convertie").length ?? 0;
  const rechazadas = demandes?.filter((d) => d.statut === "rejetee").length ?? 0;

  const demandesFiltradas = q
    ? demandes?.filter((d) =>
        [d.nom, d.whatsapp, d.vehicules?.categories_vehicules?.nom, d.vehicules?.plaque]
          .filter((v): v is string => Boolean(v))
          .some((v) => v.toLowerCase().includes(q)),
      )
    : demandes;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
        <p className="text-sm text-ink-soft">{t("subtitle")}</p>
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={t("statut_nouvelle")} value={nuevas} />
        <StatCard label={t("statut_contactee")} value={contactadas} tone="warn" />
        <StatCard label={t("statut_convertie")} value={convertidas} />
        <StatCard label={t("statut_rejetee")} value={rechazadas} tone="muted" />
      </div>

      <SearchInput placeholder={t("search_placeholder")} />

      <div className={tableCardClass}>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className={theadClass}>
            <tr>
              <th className={thClass}>{t("col_nombre")}</th>
              <th className={thClass}>{t("col_whatsapp")}</th>
              <th className={thClass}>{t("col_vehiculo")}</th>
              <th className={thClass}>{t("col_del")}</th>
              <th className={thClass}>{t("col_al")}</th>
              <th className={thClass}>{t("col_horario")}</th>
              <th className={thClass}>{t("col_precio")}</th>
              <th className={thClass}>{t("col_estado")}</th>
              <th className={`${thClass} text-right`}>{t("col_acciones")}</th>
            </tr>
          </thead>
          <tbody>
            {demandesFiltradas?.map((d) => {
              const vehiculeNom = d.vehicules?.categories_vehicules?.nom ?? null;
              const message = buildContactMessage({
                nom: d.nom,
                vehicule: vehiculeNom,
                dateDebut: d.date_debut,
                dateFin: d.date_fin,
                prix: d.prix_estime_usd,
                langue: d.langue,
              });
              return (
                <tr key={d.id} className={trClass}>
                  <td className="px-4 py-3 font-medium text-ink">
                    {clientParDemande.has(d.id) ? (
                      <Link
                        href={`/admin/clients/${clientParDemande.get(d.id)}`}
                        title={t("client_open")}
                        className="text-brand-dark underline-offset-2 hover:underline"
                      >
                        {d.nom}
                      </Link>
                    ) : (
                      d.nom
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {d.whatsapp_a_verifier ? (
                      <div className="flex flex-col items-start gap-1">
                        <span className="whitespace-nowrap">{d.whatsapp}</span>
                        <span
                          title={t("a_verifier_hint")}
                          className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-800"
                        >
                          ⚠ {t("a_verifier")}
                        </span>
                      </div>
                    ) : (
                      <a
                        href={whatsappHref(d.whatsapp, message.body)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={t("whatsapp_open")}
                        className="whitespace-nowrap font-medium text-brand-dark underline-offset-2 hover:underline"
                      >
                        {d.whatsapp}
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {d.vehicules?.categories_vehicules?.nom ?? tCommon("dash")}
                    {d.vehicules?.plaque ? ` (${d.vehicules.plaque})` : ""}
                  </td>
                  <td className="px-4 py-3">{d.date_debut}</td>
                  <td className="px-4 py-3">{d.date_fin}</td>
                  <td className="px-4 py-3">
                    {d.heure_debut ?? tCommon("dash")} → {d.heure_fin ?? tCommon("dash")}
                  </td>
                  <td className="px-4 py-3">
                    {d.prix_estime_usd ? `US$ ${d.prix_estime_usd}` : tCommon("dash")}
                  </td>
                  <td className="px-4 py-3">
                    <DemandeStatutSelect id={d.id} statut={d.statut} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {reservationParDemande.has(d.id) ? (
                        <Link
                          href={`/admin/reservations/${reservationParDemande.get(d.id)}`}
                          className="inline-flex items-center rounded-md bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand-dark transition-colors hover:bg-brand/20"
                        >
                          {t("view_reservation")}
                        </Link>
                      ) : d.statut === "convertie" ? (
                        <span className="px-2.5 py-1 text-xs font-semibold text-ink-soft">
                          {t("already_converted")}
                        </span>
                      ) : (
                      <ConvertirDemandeButton
                        label={t("convert")}
                        nom={d.nom}
                        whatsapp={d.whatsapp}
                        whatsappAVerifier={d.whatsapp_a_verifier}
                        demandeId={d.id}
                        email={d.email}
                        vehiculeId={d.vehicule_id}
                        dateDebut={d.date_debut}
                        dateFin={d.date_fin}
                        heureDebut={d.heure_debut?.slice(0, 5)}
                        heureFin={d.heure_fin?.slice(0, 5)}
                        lieu={d.lieu_prise_en_charge ?? undefined}
                        prix={d.prix_estime_usd ? String(d.prix_estime_usd) : undefined}
                      />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {demandesFiltradas?.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-ink-soft">
                  {q ? tCommon("no_results") : t("empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
