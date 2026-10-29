import { createClient } from "@/lib/supabase/server";
import { getAdminLocale, getAdminTranslator } from "@/lib/admin-i18n";
import { SearchInput } from "@/components/admin/SearchInput";
import { DemandesSuivi, type DemandeVue } from "@/components/admin/DemandesSuivi";
import { buildContactMessage, mailtoHref, whatsappHref } from "@/lib/contact-messages";
import {
  ONGLETS,
  alerteDe,
  barreDe,
  dateHeureComplete,
  datesCourtes,
  estStatut,
  heureCourte,
  ilYA,
  ongletDe,
  prixCourt,
  rattacherClient,
  type ClientRef,
  type Onglet,
} from "@/lib/demandes/suivi";

// Suivi des demandes par étapes (onglets À traiter / En discussion / Converties / Sans suite).
// Tout ce qui dépend de l'heure (alertes, « il y a 2 jours ») est calculé ici, côté serveur,
// avec une seule horloge, puis transmis tel quel à la liste et au panneau de détail.
export default async function DemandesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; onglet?: string; d?: string }>;
}) {
  const { q: qRaw, onglet: ongletRaw, d: selection } = await searchParams;
  const q = qRaw?.trim().toLowerCase() ?? "";
  const supabase = createClient();
  const locale = await getAdminLocale();
  const t = await getAdminTranslator("admin.demandes");
  const maintenant = new Date();

  const [{ data: demandes, error }, { data: clients }] = await Promise.all([
    supabase
      .from("demandes_reservation")
      .select(
        "id, nom, whatsapp, whatsapp_a_verifier, langue, email, notes, vehicule_id, date_debut, date_fin, heure_debut, heure_fin, lieu_prise_en_charge, prix_estime_usd, statut, created_at, updated_at, vehicules(plaque, annee, categories_vehicules(nom))",
      )
      .order("created_at", { ascending: false }),
    // Toutes les fiches avec un téléphone : rattachement par numéro exact, et repérage des
    // numéros proches avant de créer une fiche.
    supabase.from("clients").select("id, nom, telephone").not("telephone", "is", null),
  ]);

  // Réservation créée à partir de chaque demande (lien demande_id), pour « Voir la réservation ».
  const { data: liens } = demandes?.length
    ? await supabase
        .from("reservations")
        .select("id, demande_id")
        .in(
          "demande_id",
          demandes.map((d) => d.id),
        )
    : { data: [] };
  const reservationParDemande = new Map(
    (liens ?? []).flatMap((r) => (r.demande_id ? [[r.demande_id, r.id] as const] : [])),
  );
  const fiches: ClientRef[] = (clients ?? []).flatMap((c) =>
    c.telephone ? [{ id: c.id, nom: c.nom, telephone: c.telephone }] : [],
  );

  const vues: DemandeVue[] = (demandes ?? []).flatMap((d) => {
    if (!estStatut(d.statut)) return [];
    const statut = d.statut;
    const creee = new Date(d.created_at);
    const majee = new Date(d.updated_at);
    const alerte = alerteDe(statut, creee, majee, maintenant);
    const reservationId = reservationParDemande.get(d.id) ?? null;
    const categorie = d.vehicules?.categories_vehicules?.nom ?? null;
    const vehicule = [categorie, d.vehicules?.annee].filter(Boolean).join(" ") || null;
    const message = buildContactMessage({
      nom: d.nom,
      vehicule: categorie,
      dateDebut: d.date_debut,
      dateFin: d.date_fin,
      prix: d.prix_estime_usd,
      langue: d.langue,
    });
    const recue = dateHeureComplete(creee, locale);

    let ligneStatut: string;
    if (statut === "nouvelle") ligneStatut = t("age_recue", { quand: ilYA(creee, maintenant, locale) });
    else if (statut === "contactee") ligneStatut = t("age_contact", { quand: ilYA(majee, maintenant, locale) });
    else if (statut === "convertie")
      ligneStatut = reservationId
        ? t("age_convertie", { quand: ilYA(majee, maintenant, locale) })
        : t("ancienne_conversion");
    else ligneStatut = t("age_sans_suite", { quand: ilYA(majee, maintenant, locale) });

    return [
      {
        id: d.id,
        nom: d.nom,
        whatsapp: d.whatsapp,
        whatsappAVerifier: d.whatsapp_a_verifier,
        email: d.email,
        notes: d.notes,
        vehiculeId: d.vehicule_id,
        vehicule,
        plaque: d.vehicules?.plaque ?? null,
        dateDebut: d.date_debut,
        dateFin: d.date_fin,
        dates: datesCourtes(d.date_debut, d.date_fin, locale, maintenant),
        heureDebut: d.heure_debut?.slice(0, 5) ?? null,
        heureFin: d.heure_fin?.slice(0, 5) ?? null,
        heures: [heureCourte(d.heure_debut, locale), heureCourte(d.heure_fin, locale)]
          .filter(Boolean)
          .join(" → ") || null,
        lieu: d.lieu_prise_en_charge,
        prix: d.prix_estime_usd,
        prixTexte: prixCourt(d.prix_estime_usd),
        statut,
        onglet: ongletDe(statut, alerte),
        alerte,
        barre: barreDe(statut, alerte),
        ligneStatut,
        recueLe: t("recue_le", recue),
        reservationId,
        client: rattacherClient(d.whatsapp, fiches),
        waHref: d.whatsapp_a_verifier ? null : whatsappHref(d.whatsapp, message.body),
        mailHref: d.email ? mailtoHref(d.email, message.subject, message.body) : null,
      },
    ];
  });

  const filtrees = q
    ? vues.filter((d) => [d.nom, d.whatsapp].some((v) => v.toLowerCase().includes(q)))
    : vues;
  const onglet: Onglet = ONGLETS.find((o) => o === ongletRaw) ?? "a_traiter";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
        <p className="text-sm text-ink-soft">{t("subtitle")}</p>
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <SearchInput placeholder={t("search_placeholder")} />

      <DemandesSuivi
        demandes={filtrees}
        ongletInitial={onglet}
        selectionInitiale={selection ?? null}
        aucuneDemande={vues.length === 0}
      />
    </div>
  );
}
