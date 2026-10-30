"use client";

import { useCallback, useState, type ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { tableCardClass } from "@/components/admin/admin-ui";
import { IconeMessage } from "@/components/admin/demandes-ui";
import { PanneauDemande } from "@/components/admin/PanneauDemande";
import type { VehiculeOption } from "@/components/admin/ChampsVehiculeDates";
import type { Motif, Source } from "@/lib/demandes/libelles";
import {
  ONGLETS,
  type Alerte,
  type Barre,
  type LienClient,
  type Onglet,
  type StatutDemande,
} from "@/lib/demandes/suivi";

export type VehiculeCatalogue = VehiculeOption;

// Demande prête à afficher : tous les textes dépendant de l'heure ou de la langue sont
// calculés par la page serveur (voir demandes/page.tsx et lib/demandes/suivi.ts).
export type DemandeVue = {
  id: string;
  nom: string;
  whatsapp: string | null;
  whatsappAVerifier: boolean;
  email: string | null;
  notes: string | null;
  notesInternes: string | null;
  source: Source;
  etiquette: string;
  langue: string | null;
  langueContact: string;
  vehiculeId: string | null;
  categorieId: string | null;
  vehicule: string | null;
  plaque: string | null;
  dateDebut: string | null;
  dateFin: string | null;
  dates: string | null;
  heureDebut: string | null;
  heureFin: string | null;
  heures: string | null;
  lieu: string | null;
  prix: number | null;
  prixTexte: string | null;
  statut: StatutDemande;
  motif: Motif | null;
  contacteLe: string | null;
  prochaineRelance: string | null;
  onglet: Onglet;
  alerte: Alerte;
  barre: Barre;
  ligneStatut: string;
  recueLe: string;
  reservationId: string | null;
  reservationAnnulee: boolean;
  clientId: string | null;
  lien: LienClient;
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

export function PastilleStatut({ statut, children }: { statut: StatutDemande; children: ReactNode }) {
  return (
    <span className={`inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold ${STATUT_CLASS[statut]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export function PastilleAVerifier({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <span
      title={titre}
      className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold leading-4 text-amber-900"
    >
      {children}
    </span>
  );
}

// Nom complet, jamais tronqué ; lien vers la fiche client liée (client_id, sinon fiche unique
// au même téléphone exact). Le clic sur le lien n'ouvre pas le panneau.
export function NomClient({ d, className = "" }: { d: DemandeVue; className?: string }) {
  const t = useTranslations("admin.demandes");
  const base = `font-semibold [overflow-wrap:anywhere] ${className}`;
  if (!d.lien) return <span className={`${base} text-ink`}>{d.nom}</span>;
  return (
    <Link
      href={`/admin/clients/${d.lien.id}`}
      title={t("client_open")}
      onClick={(e) => e.stopPropagation()}
      className={`${base} text-sky-800 underline underline-offset-2 hover:text-sky-950`}
    >
      {d.nom}
    </Link>
  );
}

export function LigneAlerte({ d }: { d: DemandeVue }) {
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
  vehicules,
}: {
  demandes: DemandeVue[];
  ongletInitial: Onglet;
  selectionInitiale: string | null;
  aucuneDemande: boolean;
  estAdmin: boolean;
  vehicules: VehiculeOption[];
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
                        title={d.etiquette}
                        className="min-w-0 truncate rounded-full border border-sky-200 bg-sky-50 px-2 py-px text-[11px] font-medium leading-4 text-sky-900"
                      >
                        {d.etiquette}
                      </span>
                      {d.whatsappAVerifier && (
                        <PastilleAVerifier titre={t("a_verifier_hint")}>{t("a_verifier")}</PastilleAVerifier>
                      )}
                    </div>
                  </div>

                  <div data-col="dates" className="flex items-center gap-1.5 text-sm text-ink">
                    <span className={d.dates ? "" : "text-ink-soft"}>{d.dates ?? t("a_preciser")}</span>
                    {d.notes && (
                      <span title={t("contient_note")} className="pointer-events-auto text-ink-soft">
                        <IconeMessage />
                        <span className="sr-only">{t("contient_note")}</span>
                      </span>
                    )}
                  </div>

                  <div
                    data-col="prix"
                    className={`text-sm tabular-nums min-[620px]:text-right ${d.prixTexte ? "font-semibold text-ink" : "text-ink-soft"}`}
                  >
                    {d.prixTexte ?? t("a_preciser")}
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
          vehicules={vehicules}
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
