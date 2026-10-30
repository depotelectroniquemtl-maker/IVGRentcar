import { createClient } from "@/lib/supabase/server";
import { getAdminLocale, getAdminTranslator } from "@/lib/admin-i18n";
import { getCurrentProfile } from "@/lib/supabase/queries/profile";
import { SearchInput } from "@/components/admin/SearchInput";
import { DemandesSuivi, type DemandeVue, type VehiculeCatalogue } from "@/components/admin/DemandesSuivi";
import { NouvelleDemande } from "@/components/admin/NouvelleDemande";
import { buildContactMessage, contactLang, mailtoHref, whatsappHref } from "@/lib/contact-messages";
import { estSource, estMotif } from "@/lib/demandes/libelles";
import {
  ONGLETS,
  barreDe,
  dateCourte,
  dateHeureComplete,
  datesCourtes,
  estStatut,
  etatSuivi,
  heureCourte,
  ilYA,
  lienClient,
  ongletDe,
  prixCourt,
  type ClientRef,
  type Onglet,
} from "@/lib/demandes/suivi";

// Suivi des demandes par étapes (onglets À traiter / En discussion / Converties / Sans suite),
// reçues du site ou saisies à la main. Tout ce qui dépend de l'heure (alertes, « il y a
// 2 jours ») est calculé ici, côté serveur, avec une seule horloge, puis transmis tel quel à la
// liste et au panneau de détail.
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
  // « Supprimer la demande » n'est proposé qu'aux administrateurs (la base le refuse de toute
  // façon aux autres : policy demandes_delete_admin).
  const estAdmin = (await getCurrentProfile())?.role === "admin";

  const [{ data: demandes, error }, { data: clients }, { data: vehicules }] = await Promise.all([
    supabase
      .from("demandes_reservation")
      .select(
        "id, nom, whatsapp, whatsapp_a_verifier, langue, email, notes, notes_internes, source, vehicule_id, date_debut, date_fin, heure_debut, heure_fin, lieu_prise_en_charge, prix_estime_usd, statut, motif_sans_suite, contacte_le, derniere_relance_le, prochaine_relance_le, client_id, created_at, updated_at, vehicules(plaque, annee, categorie_id, categories_vehicules(nom)), clients(nom, langue)",
      )
      .order("created_at", { ascending: false }),
    // Fiches avec un téléphone : lien du Lot 1 (téléphone exact) pour les demandes sans client_id.
    supabase.from("clients").select("id, nom, telephone").not("telephone", "is", null),
    // Catalogue pour la saisie et la complétion du véhicule (véhicules actifs).
    supabase
      .from("vehicules")
      .select("id, plaque, annee, categorie_id, categories_vehicules(nom)")
      .eq("actif", true)
      .order("plaque"),
  ]);

  // Réservation créée à partir de chaque demande (lien demande_id), pour « Voir la réservation »
  // et « Annuler la réservation » (son statut dit si elle est encore active).
  const { data: liens } = demandes?.length
    ? await supabase
        .from("reservations")
        .select("id, demande_id, statut")
        .in(
          "demande_id",
          demandes.map((d) => d.id),
        )
    : { data: [] };
  const reservationParDemande = new Map(
    (liens ?? []).flatMap((r) => (r.demande_id ? [[r.demande_id, r] as const] : [])),
  );
  const fiches: ClientRef[] = (clients ?? []).flatMap((c) =>
    c.telephone ? [{ id: c.id, nom: c.nom, telephone: c.telephone }] : [],
  );
  const catalogue: VehiculeCatalogue[] = (vehicules ?? []).map((v) => ({
    id: v.id,
    categorieId: v.categorie_id,
    libelle: [v.categories_vehicules?.nom, v.annee, v.plaque ? `(${v.plaque})` : null].filter(Boolean).join(" "),
  }));

  const vues: DemandeVue[] = (demandes ?? []).flatMap((d) => {
    if (!estStatut(d.statut)) return [];
    const statut = d.statut;
    const source = estSource(d.source) ? d.source : "site";
    const motif = d.motif_sans_suite && estMotif(d.motif_sans_suite) ? d.motif_sans_suite : null;
    const creee = new Date(d.created_at);
    const majee = new Date(d.updated_at);
    const { alerte, dernierContact } = etatSuivi(
      statut,
      {
        createdAt: creee,
        contacteLe: d.contacte_le ? new Date(d.contacte_le) : null,
        derniereRelanceLe: d.derniere_relance_le ? new Date(d.derniere_relance_le) : null,
        prochaineRelance: d.prochaine_relance_le,
      },
      maintenant,
    );
    const reservation = reservationParDemande.get(d.id) ?? null;
    const reservationId = reservation?.id ?? null;
    const categorie = d.vehicules?.categories_vehicules?.nom ?? null;
    const vehicule = [categorie, d.vehicules?.annee].filter(Boolean).join(" ") || null;
    const lien = lienClient(d.client_id, d.clients?.nom ?? null, d.whatsapp, fiches);
    // Messages dans la langue de la fiche client si elle est connue, sinon celle de la demande.
    const langueContact = contactLang(d.clients?.langue ?? d.langue);
    const message = buildContactMessage({
      nom: d.nom,
      vehicule: categorie,
      dateDebut: d.date_debut,
      dateFin: d.date_fin,
      prix: d.prix_estime_usd,
      langue: langueContact,
    });
    const recue = dateHeureComplete(creee, locale);
    const sourceLibelle = t(`source_${source}`);

    let ligneStatut: string;
    if (statut === "nouvelle") ligneStatut = t("age_recue", { quand: ilYA(creee, maintenant, locale) });
    else if (statut === "contactee")
      ligneStatut = d.prochaine_relance_le
        ? t("relance_prevue_le", { date: dateCourte(d.prochaine_relance_le, locale, maintenant) })
        : dernierContact
          ? t("age_contact", { quand: ilYA(dernierContact, maintenant, locale) })
          : t("contact_inconnu");
    else if (statut === "convertie")
      ligneStatut = reservationId
        ? t("age_convertie", { quand: ilYA(majee, maintenant, locale) })
        : t("ancienne_conversion");
    else
      ligneStatut = [motif ? t(`motif_${motif}`) : null, t("age_sans_suite", { quand: ilYA(majee, maintenant, locale) })]
        .filter(Boolean)
        .join(" · ");

    return [
      {
        id: d.id,
        nom: d.nom,
        whatsapp: d.whatsapp,
        whatsappAVerifier: d.whatsapp_a_verifier,
        email: d.email,
        notes: d.notes,
        notesInternes: d.notes_internes,
        source,
        etiquette: t("etiquette_source", { source: sourceLibelle, vehicule: vehicule ?? t("vehicule_a_preciser") }),
        langue: d.langue,
        langueContact,
        vehiculeId: d.vehicule_id,
        categorieId: d.vehicules?.categorie_id ?? null,
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
        motif,
        contacteLe: d.contacte_le,
        prochaineRelance: d.prochaine_relance_le,
        onglet: ongletDe(statut, alerte),
        alerte,
        barre: barreDe(statut, alerte),
        ligneStatut,
        recueLe: t("recue_le", recue),
        reservationId,
        reservationAnnulee: reservation?.statut === "annulee",
        clientId: d.client_id,
        lien,
        waHref: d.whatsapp && !d.whatsapp_a_verifier ? whatsappHref(d.whatsapp, message.body) : null,
        mailHref: d.email ? mailtoHref(d.email, message.subject, message.body) : null,
      },
    ];
  });

  const filtrees = q
    ? vues.filter((d) => [d.nom, d.whatsapp, d.email].some((v) => v?.toLowerCase().includes(q)))
    : vues;
  const onglet: Onglet = ONGLETS.find((o) => o === ongletRaw) ?? "a_traiter";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
          <p className="mt-0.5 text-sm text-ink-soft">{t("subtitle")}</p>
        </div>
        <NouvelleDemande vehicules={catalogue} langueAdmin={locale} />
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <SearchInput placeholder={t("search_placeholder")} />

      <DemandesSuivi
        key={selection ?? ""}
        demandes={filtrees}
        ongletInitial={onglet}
        selectionInitiale={selection ?? null}
        aucuneDemande={vues.length === 0}
        estAdmin={estAdmin}
        vehicules={catalogue}
      />
    </div>
  );
}
