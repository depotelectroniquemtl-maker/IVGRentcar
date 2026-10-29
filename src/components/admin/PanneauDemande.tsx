"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { ConvertirDemandeButton } from "@/components/admin/ConvertirDemandeButton";
import { ChoixFicheClient } from "@/components/admin/ChoixFicheClient";
import {
  ChampsVehiculeDates,
  erreurDates,
  type ValeursVehiculeDates,
  type VehiculeOption,
} from "@/components/admin/ChampsVehiculeDates";
import {
  IconeCourriel,
  IconeFermer,
  MessageErreur,
  PanneauLateral,
  Section,
  boutonDanger,
  boutonPrincipal,
  boutonSecondaire,
  champClass,
} from "@/components/admin/demandes-ui";
import { LigneAlerte, NomClient, PastilleAVerifier, PastilleStatut, type DemandeVue } from "@/components/admin/DemandesSuivi";
import { chercherCandidats, type Candidat } from "@/lib/demandes/correspondance";
import { MOTIFS, type Motif } from "@/lib/demandes/libelles";

type MiseAJour = Database["public"]["Tables"]["demandes_reservation"]["Update"];
type Confirmation = "supprimer" | "annuler" | "sans_suite" | null;

export function PanneauDemande({
  d,
  estAdmin,
  vehicules,
  onFermer,
  onSupprimee,
}: {
  d: DemandeVue;
  estAdmin: boolean;
  vehicules: VehiculeOption[];
  onFermer: () => void;
  onSupprimee: (id: string) => void;
}) {
  const t = useTranslations("admin.demandes");
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const [motif, setMotif] = useState<Motif | null>(null);
  const [notesInternes, setNotesInternes] = useState(d.notesInternes ?? "");
  const [relancePrevue, setRelancePrevue] = useState(d.prochaineRelance ?? "");
  const [edition, setEdition] = useState(false);
  const [vd, setVd] = useState<ValeursVehiculeDates>(valeursInitiales(d));
  const [candidats, setCandidats] = useState<Candidat[] | null>(null);
  // Choix de fiche déjà affiché par « Convertir en réservation » : pas de second choix identique.
  const [choixConversion, setChoixConversion] = useState(false);
  const fermerRef = useRef<HTMLButtonElement>(null);
  const confirmationRef = useRef(confirmation);
  confirmationRef.current = confirmation;

  useEffect(() => {
    fermerRef.current?.focus();
    const surTouche = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Échap ferme d'abord la confirmation ouverte, puis le panneau.
      if (confirmationRef.current) setConfirmation(null);
      else onFermer();
    };
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [onFermer]);

  // Données rafraîchies (après un enregistrement) : on réaligne les champs modifiables.
  useEffect(() => {
    setNotesInternes(d.notesInternes ?? "");
    setRelancePrevue(d.prochaineRelance ?? "");
    setVd(valeursInitiales(d));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d.notesInternes, d.prochaineRelance, d.vehiculeId, d.dateDebut, d.dateFin, d.prix]);

  // Fiche client : sans client lié, recherche des fiches candidates (logique commune).
  useEffect(() => {
    if (d.clientId) return setCandidats(null);
    let annule = false;
    chercherCandidats(createClient(), { telephone: d.whatsapp, email: d.email }).then(({ candidats: c }) => {
      if (!annule) setCandidats(c ?? []);
    });
    return () => {
      annule = true;
    };
  }, [d.clientId, d.whatsapp, d.email]);

  // Toutes les écritures de la demande passent ici (le journal enregistre chaque modification
  // avec l'utilisateur, via le déclencheur existant).
  async function maj(payload: MiseAJour, cleErreur = "erreur_enregistrement"): Promise<boolean> {
    setEnCours(true);
    setErreur(null);
    const { error } = await createClient().from("demandes_reservation").update(payload).eq("id", d.id);
    setEnCours(false);
    if (error) {
      setErreur(t(cleErreur));
      return false;
    }
    router.refresh();
    return true;
  }

  const maintenant = () => new Date().toISOString();
  // « Marquer contactée » : passage manuel ; premier contact conservé s'il existe déjà.
  const marquerContactee = () =>
    maj({ statut: "contactee", contacte_le: d.contacteLe ?? maintenant(), derniere_relance_le: maintenant() }, "erreur_statut");
  const relanceFaite = () => maj({ derniere_relance_le: maintenant(), prochaine_relance_le: null });
  const reactiver = () => maj({ statut: "contactee", motif_sans_suite: null }, "erreur_statut");
  const remettreEnDiscussion = () => maj({ statut: "contactee" }, "erreur_statut");

  async function classerSansSuite() {
    if (!motif) return setErreur(t("motif_obligatoire"));
    if (await maj({ statut: "rejetee", motif_sans_suite: motif }, "erreur_statut")) {
      setConfirmation(null);
      setMotif(null);
    }
  }

  async function enregistrerVehiculeDates() {
    const err = erreurDates(vd);
    if (err) return setErreur(t(err));
    const ok = await maj({
      vehicule_id: vd.vehiculeId || null,
      date_debut: vd.dateDebut || null,
      date_fin: vd.dateFin || null,
      prix_estime_usd: vd.prix === "" ? null : Number(vd.prix),
    });
    if (ok) setEdition(false);
  }

  // Suppression définitive (administrateurs, policy demandes_delete_admin). Refusée tant
  // qu'une réservation non annulée est liée ; ne touche ni la réservation ni la fiche client
  // (une réservation annulée liée garde sa ligne : demande_id passe à NULL, ON DELETE SET NULL).
  async function supprimer() {
    setEnCours(true);
    setErreur(null);
    const supabase = createClient();
    const { data: actives, error: errLecture } = await supabase
      .from("reservations")
      .select("id")
      .eq("demande_id", d.id)
      .neq("statut", "annulee");
    if (errLecture) {
      setEnCours(false);
      setErreur(t("erreur_suppression"));
      return;
    }
    if ((actives?.length ?? 0) > 0) {
      setEnCours(false);
      setConfirmation(null);
      setErreur(t("suppression_reservation_active"));
      return;
    }
    // .select() : une suppression refusée par la RLS ne renvoie pas d'erreur, seulement 0 ligne.
    const { data: supprimees, error } = await supabase
      .from("demandes_reservation")
      .delete()
      .eq("id", d.id)
      .select("id");
    setEnCours(false);
    setConfirmation(null);
    if (error || !supprimees?.length) {
      setErreur(t(error ? "erreur_suppression" : "suppression_refusee"));
      return;
    }
    router.refresh();
    onSupprimee(d.id);
  }

  // Le client renonce : même écriture que l'annulation dans la fiche de réservation
  // (ReservationForm : statut = « annulee », la ligne est conservée), puis la demande passe
  // en « Sans suite » avec le motif « client annulé ». Si la réservation est déjà annulée,
  // seule la demande est mise à jour.
  async function annulerReservation() {
    if (!d.reservationId) return;
    setEnCours(true);
    setErreur(null);
    const supabase = createClient();
    if (!d.reservationAnnulee) {
      const { error } = await supabase
        .from("reservations")
        .update({ statut: "annulee" })
        .eq("id", d.reservationId);
      if (error) {
        setEnCours(false);
        setErreur(t("erreur_annulation"));
        return;
      }
    }
    const { error } = await supabase
      .from("demandes_reservation")
      .update({ statut: "rejetee", motif_sans_suite: "client_annule" })
      .eq("id", d.id);
    setEnCours(false);
    setConfirmation(null);
    if (error) setErreur(t("erreur_annulation_demande"));
    router.refresh();
  }

  // Fiche existante choisie explicitement : client_id de la demande.
  const utiliserFiche = (clientId: string) => maj({ client_id: clientId }, "erreur_lien_client");
  // Aucune fiche retenue : formulaire client prérempli (langue de la demande) ; au retour, la
  // fiche créée est liée à la demande (ClienteForm).
  const lienCreationFiche = `/admin/clients/nuevo?${new URLSearchParams({
    nom: d.nom,
    ...(d.whatsapp ? { telephone: d.whatsapp } : {}),
    ...(d.email ? { email: d.email } : {}),
    ...(d.langue ? { langue: d.langue } : {}),
    demande: d.id,
  }).toString()}`;

  const sousTitre = [d.etiquette, d.dates ?? t("dates_a_preciser"), d.heures, d.prixTexte].filter(Boolean).join(" · ");
  const conversionComplete = !!(d.vehiculeId && d.dateDebut && d.dateFin);
  const enCoursDeSuivi = d.statut === "nouvelle" || d.statut === "contactee";

  const boutonWhatsApp = (libelle: string, principal: boolean) =>
    d.waHref ? (
      <a href={d.waHref} target="_blank" rel="noopener noreferrer" className={principal ? boutonPrincipal : boutonSecondaire}>
        <WhatsAppIcon className="h-4 w-4" />
        {libelle}
      </a>
    ) : (
      <button type="button" disabled title={d.whatsapp ? t("a_verifier_hint") : t("sans_telephone")} className={boutonSecondaire}>
        <WhatsAppIcon className="h-4 w-4" />
        {libelle}
      </button>
    );
  const boutonCourriel = d.mailHref && (
    <a href={d.mailHref} className={boutonSecondaire}>
      <IconeCourriel />
      {t("btn_courriel")}
    </a>
  );
  const ouvrirEdition = () => {
    setEdition(true);
    setTimeout(() => document.getElementById("demande-vehicule-dates")?.scrollIntoView({ block: "center" }), 0);
  };

  return (
    <PanneauLateral titreId="demande-panneau-titre" onFermer={onFermer}>
      <header className="flex items-start gap-3 border-b border-black/10 px-5 py-4">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">{t("panneau_titre")}</p>
          <h2 id="demande-panneau-titre" className="mt-1 text-lg leading-6">
            <NomClient d={d} />
          </h2>
          <p className="mt-1 text-sm text-ink-soft">{sousTitre}</p>
        </div>
        <button
          ref={fermerRef}
          type="button"
          onClick={onFermer}
          aria-label={t("fermer")}
          className="rounded-md p-1.5 text-ink-soft transition-colors hover:bg-black/5 hover:text-ink"
        >
          <IconeFermer />
        </button>
      </header>

      <div className="flex flex-col gap-5 px-5 py-5 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <PastilleStatut statut={d.statut}>{t(`statut_${d.statut}`)}</PastilleStatut>
          <span className="text-xs text-ink-soft">
            <LigneAlerte d={d} />
          </span>
        </div>

        <Section titre={t("coordonnees")}>
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5">
            <dt className="text-ink-soft">{t("whatsapp")}</dt>
            <dd className="flex flex-wrap items-center gap-2 text-ink">
              <span className="tabular-nums">{d.whatsapp ?? t("non_renseigne")}</span>
              {d.whatsappAVerifier && (
                <PastilleAVerifier titre={t("a_verifier_hint")}>{t("a_verifier")}</PastilleAVerifier>
              )}
            </dd>
            <dt className="text-ink-soft">{t("courriel")}</dt>
            <dd className="text-ink [overflow-wrap:anywhere]">{d.email ?? t("non_renseigne")}</dd>
            <dt className="text-ink-soft">{t("champ_source")}</dt>
            <dd className="text-ink">{t(`source_${d.source}`)}</dd>
            <dt className="text-ink-soft">{t("champ_langue")}</dt>
            <dd className="text-ink">{t(`langue_${d.langueContact}`)}</dd>
            {d.lieu && (
              <>
                <dt className="text-ink-soft">{t("lieu")}</dt>
                <dd className="text-ink [overflow-wrap:anywhere]">{d.lieu}</dd>
              </>
            )}
          </dl>
          <p className="mt-2 text-xs text-ink-soft">{d.recueLe}</p>
        </Section>

        <Section titre={t("vehicule_dates_titre")} id="demande-vehicule-dates">
          {edition ? (
            <div className="flex flex-col gap-3">
              <ChampsVehiculeDates idPrefixe="panneau" vehicules={vehicules} valeurs={vd} onChange={setVd} />
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={enCours} onClick={enregistrerVehiculeDates} className={boutonPrincipal}>
                  {t("enregistrer")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEdition(false);
                    setVd(valeursInitiales(d));
                  }}
                  className={boutonSecondaire}
                >
                  {t("confirmation_retour")}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-2">
              <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5">
                <dt className="text-ink-soft">{t("champ_vehicule")}</dt>
                <dd className="text-ink">{d.vehicule ?? t("vehicule_a_preciser")}</dd>
                <dt className="text-ink-soft">{t("col_dates")}</dt>
                <dd className="text-ink">{d.dates ?? t("a_preciser")}</dd>
                <dt className="text-ink-soft">{t("col_prix")}</dt>
                <dd className="text-ink">{d.prixTexte ?? t("a_preciser")}</dd>
              </dl>
              {enCoursDeSuivi && (
                <button type="button" onClick={ouvrirEdition} className={boutonSecondaire}>
                  {conversionComplete ? t("btn_modifier") : t("btn_completer")}
                </button>
              )}
            </div>
          )}
        </Section>

        <Section titre={t("notes_titre")}>
          {/* Texte brut du visiteur : rendu comme texte (jamais en HTML), retours à la ligne gardés. */}
          {d.notes ? (
            <p className="whitespace-pre-wrap rounded-md bg-black/[0.03] px-3 py-2 text-ink [overflow-wrap:anywhere]">
              {d.notes}
            </p>
          ) : (
            <p className="text-ink-soft">{t("aucune_note")}</p>
          )}
        </Section>

        <Section titre={t("notes_internes_titre")}>
          <textarea
            aria-label={t("notes_internes_titre")}
            value={notesInternes}
            onChange={(e) => setNotesInternes(e.target.value)}
            rows={3}
            className={champClass}
          />
          <button
            type="button"
            disabled={enCours || notesInternes === (d.notesInternes ?? "")}
            onClick={() => maj({ notes_internes: notesInternes.trim() || null })}
            className={`${boutonSecondaire} mt-2`}
          >
            {t("enregistrer")}
          </button>
        </Section>

        {enCoursDeSuivi && (
          <div className="border-l-4 border-sky-600 bg-sky-50 px-3 py-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-sky-900">{t("prochaine_action")}</p>
            <p className="mt-0.5 font-semibold text-ink">
              {d.statut === "nouvelle"
                ? t(d.alerte === "retard" ? "action_repondre_retard" : "action_repondre")
                : t(d.alerte === "relancer" ? "action_relancer" : "action_attendre")}
            </p>
          </div>
        )}

        {enCoursDeSuivi && (
          <Section titre={t("champ_relance_prevue")}>
            <div className="flex flex-wrap items-end gap-2">
              <input
                type="date"
                aria-label={t("champ_relance_prevue")}
                value={relancePrevue}
                onChange={(e) => setRelancePrevue(e.target.value)}
                className={`${champClass} w-auto`}
              />
              <button
                type="button"
                disabled={enCours || relancePrevue === (d.prochaineRelance ?? "")}
                onClick={() => maj({ prochaine_relance_le: relancePrevue || null })}
                className={boutonSecondaire}
              >
                {t("enregistrer")}
              </button>
            </div>
            <p className="mt-1 text-xs text-ink-soft">{t("champ_relance_aide")}</p>
          </Section>
        )}

        <div className="flex flex-wrap gap-2">
          {d.statut === "nouvelle" && (
            <>
              {boutonWhatsApp(t("btn_whatsapp"), true)}
              {boutonCourriel}
              <button type="button" disabled={enCours} onClick={marquerContactee} className={boutonSecondaire}>
                {t("btn_marquer_contactee")}
              </button>
              <button type="button" disabled={enCours} onClick={() => setConfirmation("sans_suite")} className={boutonSecondaire}>
                {t("btn_sans_suite")}
              </button>
            </>
          )}
          {d.statut === "contactee" && (
            <>
              {boutonWhatsApp(t("btn_relancer_whatsapp"), d.alerte === "relancer")}
              {boutonCourriel}
              <button type="button" disabled={enCours} onClick={relanceFaite} className={boutonSecondaire}>
                {t("btn_relance_faite")}
              </button>
              {conversionComplete ? (
                <ConvertirDemandeButton
                  label={t("convert")}
                  className={d.alerte === "relancer" ? boutonSecondaire : boutonPrincipal}
                  demande={{
                    id: d.id,
                    nom: d.nom,
                    whatsapp: d.whatsapp,
                    whatsappAVerifier: d.whatsappAVerifier,
                    email: d.email,
                    langue: d.langue,
                    clientId: d.clientId,
                    vehiculeId: d.vehiculeId!,
                    dateDebut: d.dateDebut!,
                    dateFin: d.dateFin!,
                    heureDebut: d.heureDebut ?? undefined,
                    heureFin: d.heureFin ?? undefined,
                    lieu: d.lieu ?? undefined,
                    prix: d.prix ? String(d.prix) : undefined,
                  }}
                  onChoixAffiche={setChoixConversion}
                />
              ) : (
                <div className="flex w-full flex-col items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-950">
                  <p>{t("conversion_incomplete")}</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" disabled className={boutonSecondaire}>
                      {t("convert")}
                    </button>
                    <button type="button" onClick={ouvrirEdition} className={boutonSecondaire}>
                      {t("btn_completer")}
                    </button>
                  </div>
                </div>
              )}
              <button type="button" disabled={enCours} onClick={() => setConfirmation("sans_suite")} className={boutonSecondaire}>
                {t("btn_sans_suite")}
              </button>
            </>
          )}
          {d.statut === "convertie" &&
            (d.reservationId ? (
              <Link href={`/admin/reservations/${d.reservationId}`} className={boutonPrincipal}>
                {t("view_reservation")}
              </Link>
            ) : (
              <>
                <p className="w-full text-ink-soft">{t("conversion_sans_reservation")}</p>
                {/* Faux statut « Convertie » (aucune réservation) : on le corrige. */}
                <button type="button" disabled={enCours} onClick={remettreEnDiscussion} className={boutonSecondaire}>
                  {t("btn_remettre_discussion")}
                </button>
              </>
            ))}
          {d.statut === "rejetee" && (
            <>
              <p className="w-full text-ink">
                {t("motif_titre")} : {d.motif ? t(`motif_${d.motif}`) : t("motif_non_precise")}
              </p>
              <button type="button" disabled={enCours} onClick={reactiver} className={boutonSecondaire}>
                {t("btn_reactiver")}
              </button>
            </>
          )}
        </div>

        {confirmation === "sans_suite" && (
          <fieldset className="rounded-md border border-black/15 px-3 py-3">
            <legend className="px-1 font-semibold text-ink">{t("motif_choisir")}</legend>
            <div className="flex flex-col gap-1.5">
              {MOTIFS.map((m) => (
                <label key={m} className="flex items-center gap-2">
                  <input type="radio" name="motif-sans-suite" checked={motif === m} onChange={() => setMotif(m)} />
                  <span>{t(`motif_${m}`)}</span>
                </label>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" disabled={enCours || !motif} onClick={classerSansSuite} className={boutonPrincipal}>
                {t("sans_suite_confirmer")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmation(null);
                  setMotif(null);
                }}
                className={boutonSecondaire}
              >
                {t("confirmation_retour")}
              </button>
            </div>
          </fieldset>
        )}

        {erreur && <MessageErreur>{erreur}</MessageErreur>}

        <Section titre={t("fiche_titre")}>
          {d.clientId ? (
            <Link href={`/admin/clients/${d.clientId}`} className={boutonSecondaire}>
              {t("client_open")}
            </Link>
          ) : candidats === null ? (
            <p className="text-ink-soft">…</p>
          ) : choixConversion ? (
            <p className="text-ink-soft">{t("fiche_choix_conversion")}</p>
          ) : candidats.length === 0 ? (
            <div className="flex flex-col items-start gap-2">
              <p className="text-ink-soft">{t("candidats_aucun")}</p>
              <Link href={lienCreationFiche} className={boutonSecondaire}>
                {t("fiche_creer")}
              </Link>
            </div>
          ) : (
            <ChoixFicheClient
              candidats={candidats}
              mode="action"
              enCours={enCours}
              onUtiliser={utiliserFiche}
              onCreer={() => router.push(lienCreationFiche)}
            />
          )}
        </Section>

        {(estAdmin || (d.statut === "convertie" && d.reservationId)) && (
          <section className="border-t border-black/10 pt-4" aria-labelledby="demande-zone-sensible">
            <h3 id="demande-zone-sensible" className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-soft">
              {t("zone_sensible")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {d.statut === "convertie" && d.reservationId && (
                <button type="button" disabled={enCours} onClick={() => setConfirmation("annuler")} className={boutonDanger}>
                  {t("btn_annuler_reservation")}
                </button>
              )}
              {estAdmin && (
                <button type="button" disabled={enCours} onClick={() => setConfirmation("supprimer")} className={boutonDanger}>
                  {t("btn_supprimer")}
                </button>
              )}
            </div>

            {(confirmation === "supprimer" || confirmation === "annuler") && (
              <div
                role="alertdialog"
                aria-labelledby="demande-confirmation-titre"
                aria-describedby="demande-confirmation-texte"
                className="mt-3 rounded-md border border-red-300 bg-red-50 px-3 py-3 text-red-950"
              >
                <p id="demande-confirmation-titre" className="font-semibold">
                  {t(confirmation === "supprimer" ? "supprimer_titre" : "annuler_titre")}
                </p>
                <p id="demande-confirmation-texte" className="mt-1">
                  {confirmation === "supprimer" ? t("supprimer_texte", { nom: d.nom, source: d.etiquette }) : t("annuler_texte")}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    autoFocus
                    disabled={enCours}
                    onClick={confirmation === "supprimer" ? supprimer : annulerReservation}
                    className="inline-flex items-center justify-center rounded-md bg-red-700 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-800 disabled:opacity-60"
                  >
                    {t(confirmation === "supprimer" ? "supprimer_confirmer" : "annuler_confirmer")}
                  </button>
                  <button type="button" disabled={enCours} onClick={() => setConfirmation(null)} className={boutonSecondaire}>
                    {t("confirmation_retour")}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </PanneauLateral>
  );
}

function valeursInitiales(d: DemandeVue): ValeursVehiculeDates {
  return {
    vehiculeId: d.vehiculeId ?? "",
    dateDebut: d.dateDebut ?? "",
    dateFin: d.dateFin ?? "",
    prix: d.prix === null ? "" : String(d.prix),
    // Un prix déjà enregistré n'est jamais remplacé automatiquement.
    prixManuel: d.prix !== null,
  };
}
