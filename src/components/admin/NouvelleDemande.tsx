"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { CountryCode } from "libphonenumber-js/min";
import { createClient } from "@/lib/supabase/client";
import { PhoneField } from "@/components/site/PhoneField";
import { defaultCountryForLocale, normalizePhone } from "@/lib/phone";
import {
  chercherCandidats,
  chercherDemandesRecentes,
  type Candidat,
  type DemandeRecente,
} from "@/lib/demandes/correspondance";
import { LANGUES, SOURCES_MANUELLES, estLangue, type Langue } from "@/lib/demandes/libelles";
import { ChoixFicheClient } from "@/components/admin/ChoixFicheClient";
import {
  ChampsVehiculeDates,
  erreurDates,
  type ValeursVehiculeDates,
  type VehiculeOption,
} from "@/components/admin/ChampsVehiculeDates";
import {
  IconeFermer,
  IconePlus,
  MessageErreur,
  PanneauLateral,
  Section,
  boutonPrincipal,
  boutonSecondaire,
  champClass,
  libelleClass,
} from "@/components/admin/demandes-ui";

const VIDE: ValeursVehiculeDates = { vehiculeId: "", dateDebut: "", dateFin: "", prix: "", prixManuel: false };

// Saisie manuelle d'une demande reçue par WhatsApp, courriel, téléphone ou au comptoir.
// Véhicule et dates sont facultatifs ici (obligatoires avant la conversion). Aucune fiche
// client n'est créée : on peut seulement rattacher la demande à une fiche existante, par un
// choix explicite. Une demande récente (30 jours) au même contact est signalée avant création.
export function NouvelleDemande({ vehicules, langueAdmin }: { vehicules: VehiculeOption[]; langueAdmin: string }) {
  const t = useTranslations("admin.demandes");
  const [ouvert, setOuvert] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOuvert(true)} className={boutonPrincipal}>
        <IconePlus />
        {t("nouvelle_demande")}
      </button>
      {ouvert && (
        <Formulaire
          vehicules={vehicules}
          langueAdmin={langueAdmin}
          onFermer={() => setOuvert(false)}
        />
      )}
    </>
  );
}

function Formulaire({
  vehicules,
  langueAdmin,
  onFermer,
}: {
  vehicules: VehiculeOption[];
  langueAdmin: string;
  onFermer: () => void;
}) {
  const t = useTranslations("admin.demandes");
  const tReservar = useTranslations("reservar");
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  // Admin en espagnol : République dominicaine (clientèle locale), comme la fiche client.
  const [pays, setPays] = useState<CountryCode>(langueAdmin === "es" ? "DO" : defaultCountryForLocale(langueAdmin));
  const [erreurTel, setErreurTel] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [source, setSource] = useState<(typeof SOURCES_MANUELLES)[number]>("whatsapp");
  const [langue, setLangue] = useState<Langue>(estLangue(langueAdmin) ? langueAdmin : "fr");
  const [vd, setVd] = useState<ValeursVehiculeDates>(VIDE);
  const [notesInternes, setNotesInternes] = useState("");
  const [dejaRepondu, setDejaRepondu] = useState(false);
  const [relancePrevue, setRelancePrevue] = useState("");
  const [candidats, setCandidats] = useState<Candidat[] | null>(null);
  const [ficheChoisie, setFicheChoisie] = useState<string | null>(null);
  const [doublons, setDoublons] = useState<DemandeRecente[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  // Téléphone E.164 si le champ est rempli et valide ; undefined si invalide (erreur affichée).
  function telephoneE164(afficherErreur: boolean): string | null | undefined {
    if (!telephone.trim()) return null;
    const r = normalizePhone(telephone, pays);
    if (!r.ok) {
      if (afficherErreur) setErreurTel(tReservar(`phone_error_${r.error}`));
      return undefined;
    }
    return r.e164;
  }

  // Fiches candidates (même logique que la conversion), recalculées quand le contact change.
  async function rechercherFiches() {
    const tel = telephoneE164(false);
    const mail = email.trim() || null;
    if (!tel && !mail) {
      setCandidats(null);
      setFicheChoisie(null);
      return;
    }
    const { candidats: trouves } = await chercherCandidats(createClient(), { telephone: tel ?? null, email: mail });
    setCandidats(trouves);
    setFicheChoisie((avant) => (avant && trouves?.some((c) => c.id === avant) ? avant : null));
  }

  async function enregistrer(e: FormEvent | null, malgreDoublons = false) {
    e?.preventDefault();
    setErreur(null);
    if (!nom.trim()) return setErreur(t("nom_obligatoire"));
    const tel = telephoneE164(true);
    if (tel === undefined) return;
    setErreurTel(null);
    const mail = email.trim() || null;
    if (!tel && !mail) return setErreur(t("contact_obligatoire"));
    const errDates = erreurDates(vd);
    if (errDates) return setErreur(t(errDates));

    setEnCours(true);
    const supabase = createClient();
    if (!malgreDoublons) {
      const { demandes: recentes, error } = await chercherDemandesRecentes(supabase, { telephone: tel, email: mail });
      if (error) {
        setEnCours(false);
        return setErreur(t("erreur_creation"));
      }
      if (recentes && recentes.length > 0) {
        setEnCours(false);
        return setDoublons(recentes);
      }
    }

    const maintenant = new Date().toISOString();
    const { data, error } = await supabase
      .from("demandes_reservation")
      .insert({
        nom: nom.trim(),
        whatsapp: tel,
        email: mail,
        source,
        langue,
        vehicule_id: vd.vehiculeId || null,
        date_debut: vd.dateDebut || null,
        date_fin: vd.dateFin || null,
        prix_estime_usd: vd.prix === "" ? null : Number(vd.prix),
        notes_internes: notesInternes.trim() || null,
        statut: dejaRepondu ? "contactee" : "nouvelle",
        contacte_le: dejaRepondu ? maintenant : null,
        derniere_relance_le: dejaRepondu ? maintenant : null,
        prochaine_relance_le: relancePrevue || null,
        client_id: ficheChoisie,
      })
      .select("id")
      .single();
    setEnCours(false);
    if (error || !data) return setErreur(t("erreur_creation"));
    onFermer();
    router.push(`/admin/demandes?d=${data.id}`);
    router.refresh();
  }

  return (
    <PanneauLateral titreId="nouvelle-demande-titre" onFermer={onFermer}>
      <header className="flex items-start gap-3 border-b border-black/10 px-5 py-4">
        <h2 id="nouvelle-demande-titre" className="min-w-0 flex-1 text-lg font-semibold text-ink">
          {t("nouvelle_titre")}
        </h2>
        <button type="button" onClick={onFermer} aria-label={t("fermer")} className="rounded-md p-1.5 text-ink-soft transition-colors hover:bg-black/5 hover:text-ink">
          <IconeFermer />
        </button>
      </header>

      <form onSubmit={(e) => enregistrer(e)} className="flex flex-col gap-5 px-5 py-5 text-sm" noValidate>
        <Section titre={t("coordonnees")}>
          <div className="flex flex-col gap-3">
            <label className="block">
              <span className={libelleClass}>{t("champ_nom")}</span>
              <input value={nom} onChange={(e) => setNom(e.target.value)} required className={champClass} autoFocus />
            </label>
            <div onBlur={rechercherFiches}>
              <PhoneField
                id="nouvelle-demande-telephone"
                required={false}
                namesLocale="fr"
                label={t("champ_telephone")}
                country={pays}
                onCountryChange={(c) => {
                  setPays(c);
                  setErreurTel(null);
                }}
                value={telephone}
                onValueChange={(v) => {
                  setTelephone(v);
                  setErreurTel(null);
                }}
                error={erreurTel}
              />
            </div>
            <label className="block">
              <span className={libelleClass}>{t("champ_courriel")}</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={rechercherFiches} className={champClass} />
            </label>
            <p className="text-xs text-ink-soft">{t("contact_obligatoire")}</p>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className={libelleClass}>{t("champ_source")}</span>
                <select value={source} onChange={(e) => setSource(e.target.value as typeof source)} className={champClass}>
                  {SOURCES_MANUELLES.map((s) => (
                    <option key={s} value={s}>
                      {t(`source_${s}`)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={libelleClass}>{t("champ_langue")}</span>
                <select value={langue} onChange={(e) => setLangue(e.target.value as Langue)} className={champClass}>
                  {LANGUES.map((l) => (
                    <option key={l} value={l}>
                      {t(`langue_${l}`)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </Section>

        {candidats && (
          <Section titre={t("fiche_titre")}>
            <ChoixFicheClient candidats={candidats} mode="saisie" selection={ficheChoisie} onSelection={setFicheChoisie} />
          </Section>
        )}

        <Section titre={t("vehicule_dates_titre")}>
          <ChampsVehiculeDates idPrefixe="nouvelle-demande" vehicules={vehicules} valeurs={vd} onChange={setVd} />
          <p className="mt-2 text-xs text-ink-soft">{t("vehicule_dates_aide")}</p>
        </Section>

        <Section titre={t("suivi_titre")}>
          <div className="flex flex-col gap-3">
            <label className="flex items-start gap-2">
              <input type="checkbox" checked={dejaRepondu} onChange={(e) => setDejaRepondu(e.target.checked)} className="mt-0.5" />
              <span>{t("champ_deja_repondu")}</span>
            </label>
            <label className="block">
              <span className={libelleClass}>{t("champ_relance_prevue")}</span>
              <input type="date" value={relancePrevue} onChange={(e) => setRelancePrevue(e.target.value)} className={champClass} />
              <span className="mt-1 block text-xs text-ink-soft">{t("champ_relance_aide")}</span>
            </label>
            <label className="block">
              <span className={libelleClass}>{t("champ_notes_internes")}</span>
              <textarea value={notesInternes} onChange={(e) => setNotesInternes(e.target.value)} rows={3} className={champClass} />
            </label>
          </div>
        </Section>

        {doublons && (
          <div role="alertdialog" aria-labelledby="doublon-titre" className="rounded-md border border-amber-300 bg-amber-50 px-3 py-3 text-amber-950">
            <p id="doublon-titre" className="font-semibold">
              {t("doublon_titre")}
            </p>
            <p className="mt-1">{t("doublon_texte")}</p>
            <ul className="mt-1 list-disc pl-5">
              {doublons.map((d) => (
                <li key={d.id}>
                  <Link href={`/admin/demandes?d=${d.id}`} target="_blank" className="font-semibold text-sky-800 underline underline-offset-2">
                    {d.nom}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" disabled={enCours} onClick={() => enregistrer(null, true)} className={boutonPrincipal}>
                {t("doublon_creer")}
              </button>
              <button type="button" onClick={onFermer} className={boutonSecondaire}>
                {t("doublon_annuler")}
              </button>
            </div>
          </div>
        )}

        {erreur && <MessageErreur>{erreur}</MessageErreur>}

        {!doublons && (
          <div className="flex flex-wrap gap-2 border-t border-black/10 pt-4">
            <button type="submit" disabled={enCours} className={boutonPrincipal}>
              {enCours ? "…" : t("enregistrer_demande")}
            </button>
            <button type="button" onClick={onFermer} className={boutonSecondaire}>
              {t("doublon_annuler")}
            </button>
          </div>
        )}
      </form>
    </PanneauLateral>
  );
}
