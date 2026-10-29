"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { ConvertirDemandeButton } from "@/components/admin/ConvertirDemandeButton";
import { tableCardClass } from "@/components/admin/admin-ui";
import {
  ONGLETS,
  type Alerte,
  type Barre,
  type Onglet,
  type RattachementClient,
  type StatutDemande,
} from "@/lib/demandes/suivi";

// Demande prête à afficher : tous les textes dépendant de l'heure ou de la langue sont
// calculés par la page serveur (voir demandes/page.tsx et lib/demandes/suivi.ts).
export type DemandeVue = {
  id: string;
  nom: string;
  whatsapp: string;
  whatsappAVerifier: boolean;
  email: string | null;
  notes: string | null;
  vehiculeId: string;
  vehicule: string | null;
  plaque: string | null;
  dateDebut: string;
  dateFin: string;
  dates: string;
  heureDebut: string | null;
  heureFin: string | null;
  heures: string | null;
  lieu: string | null;
  prix: number | null;
  prixTexte: string | null;
  statut: StatutDemande;
  onglet: Onglet;
  alerte: Alerte;
  barre: Barre;
  ligneStatut: string;
  recueLe: string;
  reservationId: string | null;
  reservationAnnulee: boolean;
  client: RattachementClient;
  waHref: string | null;
  mailHref: string | null;
};

// Colonnes identiques pour l'en-tête et chaque ligne : Client | Dates | Prix | Statut.
const GRILLE =
  "min-[620px]:grid min-[620px]:grid-cols-[minmax(0,1.7fr)_112px_88px_minmax(0,1.1fr)] min-[620px]:gap-x-5";

const BARRE_CLASS: Record<NonNullable<Barre> | "aucune", string> = {
  rouge: "border-l-red-600",
  orange: "border-l-orange-500",
  bleu: "border-l-sky-600",
  vert: "border-l-green-600",
  aucune: "border-l-transparent",
};

const STATUT_CLASS: Record<StatutDemande, string> = {
  nouvelle: "bg-sky-100 text-sky-900",
  contactee: "bg-amber-100 text-amber-900",
  convertie: "bg-green-100 text-green-900",
  rejetee: "bg-slate-200 text-slate-800",
};

const boutonPrincipal =
  "inline-flex items-center justify-center gap-2 rounded-md bg-brand px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60";
// Actions destructives : rouge, toujours dans la zone « Actions sensibles » en bas du panneau,
// jamais à côté du bouton principal.
const boutonDanger =
  "inline-flex items-center justify-center rounded-md border border-red-300 bg-white px-3.5 py-2 text-sm font-semibold text-red-800 transition-colors hover:bg-red-50 disabled:opacity-60";
const boutonSecondaire =
  "inline-flex items-center justify-center gap-2 rounded-md border border-black/15 bg-white px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-black/5 disabled:opacity-60";

// Icônes Tabler (MIT), tracés repris tels quels.
function IconeMessage({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M8 9h8" />
      <path d="M8 13h6" />
      <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z" />
    </svg>
  );
}

function IconeCourriel({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" />
      <path d="M3 7l9 6l9 -6" />
    </svg>
  );
}

function IconeFermer({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

function PastilleStatut({ statut, children }: { statut: StatutDemande; children: ReactNode }) {
  return (
    <span className={`inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold ${STATUT_CLASS[statut]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

function PastilleAVerifier({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <span
      title={titre}
      className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold leading-4 text-amber-900"
    >
      {children}
    </span>
  );
}

function NomClient({ d, className = "" }: { d: DemandeVue; className?: string }) {
  const t = useTranslations("admin.demandes");
  // Nom complet, jamais tronqué : il peut passer à la ligne, même au milieu d'un mot très long.
  const base = `font-semibold [overflow-wrap:anywhere] ${className}`;
  if (d.client.type !== "unique") return <span className={`${base} text-ink`}>{d.nom}</span>;
  return (
    <Link
      href={`/admin/clients/${d.client.id}`}
      title={t("client_open")}
      onClick={(e) => e.stopPropagation()}
      className={`${base} text-sky-800 underline underline-offset-2 hover:text-sky-950`}
    >
      {d.nom}
    </Link>
  );
}

function LigneAlerte({ d }: { d: DemandeVue }) {
  const t = useTranslations("admin.demandes");
  return (
    <>
      {d.alerte && (
        <>
          <span className={`font-semibold ${d.alerte === "retard" ? "text-red-700" : "text-orange-800"}`}>
            {t(d.alerte === "retard" ? "alerte_retard" : "alerte_relancer")}
          </span>
          {" · "}
        </>
      )}
      {d.ligneStatut}
    </>
  );
}

export function DemandesSuivi({
  demandes,
  ongletInitial,
  selectionInitiale,
  aucuneDemande,
  estAdmin,
}: {
  demandes: DemandeVue[];
  ongletInitial: Onglet;
  selectionInitiale: string | null;
  aucuneDemande: boolean;
  estAdmin: boolean;
}) {
  const t = useTranslations("admin.demandes");
  const [onglet, setOnglet] = useState<Onglet>(ongletInitial);
  const [selection, setSelection] = useState<string | null>(selectionInitiale);
  // Demandes supprimées dans cette page : retirées tout de suite de la liste et des compteurs,
  // sans attendre le rafraîchissement des données serveur.
  const [supprimees, setSupprimees] = useState<Set<string>>(() => new Set());

  // Onglet et demande ouverte gardés dans l'URL (?onglet=…&d=…) : un rechargement ou le retour
  // après la création d'une fiche client rouvre le même écran.
  const majUrl = useCallback((cle: string, valeur: string | null) => {
    const url = new URL(window.location.href);
    if (valeur) url.searchParams.set(cle, valeur);
    else url.searchParams.delete(cle);
    window.history.replaceState(null, "", url);
  }, []);

  function choisirOnglet(o: Onglet) {
    setOnglet(o);
    majUrl("onglet", o === "a_traiter" ? null : o);
  }
  function ouvrir(id: string | null) {
    setSelection(id);
    majUrl("d", id);
  }

  const visibles = demandes.filter((d) => !supprimees.has(d.id));
  const compteurs = Object.fromEntries(
    ONGLETS.map((o) => [o, visibles.filter((d) => d.onglet === o).length]),
  ) as Record<Onglet, number>;
  const liste = visibles.filter((d) => d.onglet === onglet);
  const ouverte = selection ? visibles.find((d) => d.id === selection) ?? null : null;

  return (
    <>
      <div role="tablist" aria-label={t("onglets_label")} className="flex flex-wrap gap-1 border-b border-black/10">
        {ONGLETS.map((o) => {
          const actif = o === onglet;
          const urgent = o === "a_traiter" && compteurs[o] > 0;
          return (
            <button
              key={o}
              type="button"
              role="tab"
              aria-selected={actif}
              onClick={() => choisirOnglet(o)}
              className={`-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
                actif ? "border-brand text-ink" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              {t(`onglet_${o}`)}
              <span
                className={`min-w-6 rounded-full px-1.5 py-0.5 text-center text-xs font-bold tabular-nums ${
                  urgent ? "bg-red-100 text-red-800" : "bg-black/5 text-ink-soft"
                }`}
              >
                {compteurs[o]}
              </span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className={tableCardClass}>
        <div
          className={`hidden border-b border-black/10 border-l-4 border-l-transparent bg-black/[0.03] px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-ink-soft ${GRILLE}`}
          data-entete
        >
          <div>{t("col_client")}</div>
          <div>{t("col_dates")}</div>
          <div className="text-right">{t("col_prix")}</div>
          <div className="min-[620px]:pl-7">{t("col_statut")}</div>
        </div>

        {liste.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-ink-soft">
            {aucuneDemande ? t("empty") : t("empty_onglet")}
          </p>
        ) : (
          <ul>
            {liste.map((d, i) => (
              <li
                key={d.id}
                data-demande={d.id}
                className={`relative border-l-4 shadow-[inset_0_-1px_0_rgba(0,0,0,0.06)] transition-colors ${
                  BARRE_CLASS[d.barre ?? "aucune"]
                } ${
                  d.id === selection
                    ? "bg-sky-100/70"
                    : `${i % 2 === 1 ? "bg-[#F1F3F5]" : "bg-white"} hover:bg-[#E7ECF1]`
                }`}
              >
                {/* Toute la ligne ouvre le panneau ; le lien du nom reste au-dessus et cliquable. */}
                <button
                  type="button"
                  onClick={() => ouvrir(d.id)}
                  aria-label={t("ouvrir_detail", { nom: d.nom })}
                  className="absolute inset-0 h-full w-full cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sky-700"
                />
                <div
                  className={`pointer-events-none relative flex min-h-[62px] flex-col gap-1.5 px-4 py-2.5 min-[620px]:items-center ${GRILLE}`}
                >
                  <div data-col="client" className="min-w-0">
                    <div className="min-h-5 text-sm leading-5">
                      <NomClient d={d} className="pointer-events-auto relative" />
                    </div>
                    <div className="mt-1 flex h-5 min-w-0 items-center gap-1.5">
                      <span
                        title={t("source_site", { vehicule: d.vehicule ?? "—" })}
                        className="min-w-0 truncate rounded-full border border-sky-200 bg-sky-50 px-2 py-px text-[11px] font-medium leading-4 text-sky-900"
                      >
                        {t("source_site", { vehicule: d.vehicule ?? "—" })}
                      </span>
                      {d.whatsappAVerifier && (
                        <PastilleAVerifier titre={t("a_verifier_hint")}>{t("a_verifier")}</PastilleAVerifier>
                      )}
                    </div>
                  </div>

                  <div data-col="dates" className="flex items-center gap-1.5 text-sm text-ink">
                    <span>{d.dates}</span>
                    {d.notes && (
                      <span title={t("contient_note")} className="pointer-events-auto text-ink-soft">
                        <IconeMessage />
                        <span className="sr-only">{t("contient_note")}</span>
                      </span>
                    )}
                  </div>

                  <div data-col="prix" className="text-sm font-semibold tabular-nums text-ink min-[620px]:text-right">
                    {d.prixTexte ?? "—"}
                  </div>

                  <div data-col="statut" className="min-w-0 min-[620px]:pl-7">
                    <PastilleStatut statut={d.statut}>{t(`statut_${d.statut}`)}</PastilleStatut>
                    <div className="mt-1 h-4 truncate text-[11px] leading-4 text-ink-soft" title={d.ligneStatut}>
                      <LigneAlerte d={d} />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {ouverte && (
        <PanneauDemande
          d={ouverte}
          estAdmin={estAdmin}
          onFermer={() => ouvrir(null)}
          onSupprimee={(id) => {
            setSupprimees((avant) => new Set(avant).add(id));
            ouvrir(null);
          }}
        />
      )}
    </>
  );
}

function PanneauDemande({
  d,
  estAdmin,
  onFermer,
  onSupprimee,
}: {
  d: DemandeVue;
  estAdmin: boolean;
  onFermer: () => void;
  onSupprimee: (id: string) => void;
}) {
  const t = useTranslations("admin.demandes");
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<"supprimer" | "annuler" | null>(null);
  const fermerRef = useRef<HTMLButtonElement>(null);
  const confirmationRef = useRef(confirmation);
  confirmationRef.current = confirmation;

  useEffect(() => {
    fermerRef.current?.focus();
    setConfirmation(null);
    setErreur(null);
    const surTouche = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Échap ferme d'abord la confirmation ouverte, puis le panneau.
      if (confirmationRef.current) setConfirmation(null);
      else onFermer();
    };
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [d.id, onFermer]);

  // Seuls changements de statut possibles ici : contactée (manuel), sans suite, réactivation.
  // « Convertie » n'est posé que par la conversion réelle (formulaire de réservation).
  async function changerStatut(statut: "contactee" | "rejetee") {
    setEnCours(true);
    setErreur(null);
    const { error } = await createClient().from("demandes_reservation").update({ statut }).eq("id", d.id);
    setEnCours(false);
    if (error) {
      setErreur(t("erreur_statut"));
      return;
    }
    router.refresh();
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
  // en « Sans suite ». Si la réservation est déjà annulée, seule la demande est mise à jour.
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
    const { error } = await supabase.from("demandes_reservation").update({ statut: "rejetee" }).eq("id", d.id);
    setEnCours(false);
    setConfirmation(null);
    if (error) {
      setErreur(t("erreur_annulation_demande"));
      router.refresh();
      return;
    }
    router.refresh();
  }

  const sousTitre = [t("source_site", { vehicule: d.vehicule ?? "—" }), d.dates, d.heures, d.prixTexte]
    .filter(Boolean)
    .join(" · ");
  const boutonWhatsApp = (libelle: string, principal: boolean) =>
    d.waHref ? (
      <a href={d.waHref} target="_blank" rel="noopener noreferrer" className={principal ? boutonPrincipal : boutonSecondaire}>
        <WhatsAppIcon className="h-4 w-4" />
        {libelle}
      </a>
    ) : (
      <button type="button" disabled title={t("a_verifier_hint")} className={boutonSecondaire}>
        <WhatsAppIcon className="h-4 w-4" />
        {libelle}
      </button>
    );

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onFermer} aria-hidden="true" />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="demande-panneau-titre"
        className="relative flex h-full w-full max-w-[440px] flex-col overflow-y-auto bg-white shadow-xl"
      >
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
                <span className="tabular-nums">{d.whatsapp}</span>
                {d.whatsappAVerifier && (
                  <PastilleAVerifier titre={t("a_verifier_hint")}>{t("a_verifier")}</PastilleAVerifier>
                )}
              </dd>
              {d.email && (
                <>
                  <dt className="text-ink-soft">{t("courriel")}</dt>
                  <dd className="text-ink [overflow-wrap:anywhere]">{d.email}</dd>
                </>
              )}
              {d.lieu && (
                <>
                  <dt className="text-ink-soft">{t("lieu")}</dt>
                  <dd className="text-ink [overflow-wrap:anywhere]">{d.lieu}</dd>
                </>
              )}
            </dl>
            <p className="mt-2 text-xs text-ink-soft">{d.recueLe}</p>
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

          {(d.statut === "nouvelle" || d.statut === "contactee") && (
            <div className="border-l-4 border-sky-600 bg-sky-50 px-3 py-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-sky-900">{t("prochaine_action")}</p>
              <p className="mt-0.5 font-semibold text-ink">
                {d.statut === "nouvelle"
                  ? t(d.alerte === "retard" ? "action_repondre_retard" : "action_repondre")
                  : t(d.alerte === "relancer" ? "action_relancer" : "action_attendre")}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {d.statut === "nouvelle" && (
              <>
                {boutonWhatsApp(t("btn_whatsapp"), true)}
                {d.mailHref && (
                  <a href={d.mailHref} className={boutonSecondaire}>
                    <IconeCourriel />
                    {t("btn_courriel")}
                  </a>
                )}
                <button type="button" disabled={enCours} onClick={() => changerStatut("contactee")} className={boutonSecondaire}>
                  {t("btn_marquer_contactee")}
                </button>
                <button type="button" disabled={enCours} onClick={() => changerStatut("rejetee")} className={boutonSecondaire}>
                  {t("btn_sans_suite")}
                </button>
              </>
            )}
            {d.statut === "contactee" && (
              <>
                {boutonWhatsApp(t("btn_relancer_whatsapp"), d.alerte === "relancer")}
                <ConvertirDemandeButton
                  label={t("convert")}
                  className={d.alerte === "relancer" ? boutonSecondaire : boutonPrincipal}
                  demandeId={d.id}
                  nom={d.nom}
                  whatsapp={d.whatsapp}
                  whatsappAVerifier={d.whatsappAVerifier}
                  email={d.email}
                  vehiculeId={d.vehiculeId}
                  dateDebut={d.dateDebut}
                  dateFin={d.dateFin}
                  heureDebut={d.heureDebut ?? undefined}
                  heureFin={d.heureFin ?? undefined}
                  lieu={d.lieu ?? undefined}
                  prix={d.prix ? String(d.prix) : undefined}
                />
                <button type="button" disabled={enCours} onClick={() => changerStatut("rejetee")} className={boutonSecondaire}>
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
                  <button type="button" disabled={enCours} onClick={() => changerStatut("contactee")} className={boutonSecondaire}>
                    {t("btn_remettre_discussion")}
                  </button>
                </>
              ))}
            {d.statut === "rejetee" && (
              <button type="button" disabled={enCours} onClick={() => changerStatut("contactee")} className={boutonSecondaire}>
                {t("btn_reactiver")}
              </button>
            )}
          </div>
          {erreur && (
            <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {erreur}
            </p>
          )}

          <Section titre={t("fiche_titre")}>
            {d.client.type === "unique" && (
              <Link href={`/admin/clients/${d.client.id}`} className={boutonSecondaire}>
                {t("client_open")}
              </Link>
            )}
            {d.client.type === "plusieurs" && <p className="text-ink">{t("fiche_plusieurs")}</p>}
            {d.client.type === "aucun" && (
              <div className="flex flex-col items-start gap-2">
                <p className="text-ink-soft">{t("fiche_aucune")}</p>
                {d.client.proches.length > 0 && (
                  <div role="note" className="w-full rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900">
                    <p>{t("fiche_proche")}</p>
                    <ul className="mt-1 list-disc pl-5">
                      {d.client.proches.map((c) => (
                        <li key={c.id}>
                          <Link href={`/admin/clients/${c.id}`} className="font-semibold underline underline-offset-2">
                            {c.nom}
                          </Link>{" "}
                          <span className="tabular-nums">({c.telephone})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <Link
                  href={`/admin/clients/nuevo?${new URLSearchParams({
                    nom: d.nom,
                    telephone: d.whatsapp,
                    ...(d.email ? { email: d.email } : {}),
                    demande: d.id,
                  }).toString()}`}
                  className={boutonSecondaire}
                >
                  {t("fiche_creer")}
                </Link>
              </div>
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

              {confirmation && (
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
                    {confirmation === "supprimer"
                      ? t("supprimer_texte", { nom: d.nom, source: t("source_site", { vehicule: d.vehicule ?? "—" }) })
                      : t("annuler_texte")}
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
      </section>
    </div>
  );
}

function Section({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-soft">{titre}</h3>
      {children}
    </section>
  );
}
