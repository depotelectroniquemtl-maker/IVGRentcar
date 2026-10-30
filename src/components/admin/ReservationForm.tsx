"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Card, inputClass, labelClass, primaryButtonClass, secondaryLinkClass } from "@/components/admin/form-ui";

const STATUTS = ["en_attente", "confirmee", "annulee"] as const;

type Reservation = {
  id: string;
  client_id: string;
  vehicule_id: string;
  date_debut: string;
  date_fin: string;
  heure_debut: string | null;
  heure_fin: string | null;
  lieu_prise_en_charge: string | null;
  statut: (typeof STATUTS)[number];
  prix_total_usd: number | null;
  caution_usd: number | null;
  assurance: string | null;
  notes: string | null;
};

type Prefill = {
  clientId?: string;
  vehiculeId?: string;
  dateDebut?: string;
  dateFin?: string;
  heureDebut?: string;
  heureFin?: string;
  lieu?: string;
  prixEstime?: number;
  demandeId?: string;
  demandeNom?: string;
  demandeWhatsapp?: string;
};

export function ReservationForm({
  title,
  secondaryActions,
  clients,
  vehicules,
  reservation,
  prefill,
}: {
  title: string;
  secondaryActions?: ReactNode;
  clients: { id: string; nom: string }[];
  vehicules: { id: string; plaque: string | null; categorie_nom: string; categorie_id: string }[];
  reservation?: Reservation;
  prefill?: Prefill;
}) {
  const router = useRouter();
  const t = useTranslations("admin.reservations");
  const tCommon = useTranslations("admin.common");
  const editing = Boolean(reservation);

  const STATUT_LABELS: Record<(typeof STATUTS)[number], string> = {
    en_attente: tCommon("reservation_statut_en_attente"),
    confirmee: tCommon("reservation_statut_confirmee"),
    annulee: tCommon("reservation_statut_annulee"),
  };

  const [clientId, setClientId] = useState(reservation?.client_id ?? prefill?.clientId ?? "");
  const [vehiculeId, setVehiculeId] = useState(
    reservation?.vehicule_id ?? prefill?.vehiculeId ?? "",
  );
  const [dateDebut, setDateDebut] = useState(reservation?.date_debut ?? prefill?.dateDebut ?? "");
  const [dateFin, setDateFin] = useState(reservation?.date_fin ?? prefill?.dateFin ?? "");
  // Création : 10:00 par défaut (horaire le plus courant) pour accélérer la saisie manuelle
  // par le staff — contrairement au formulaire public, ça reste un champ libre, modifiable ici.
  // Modification : l'heure enregistrée telle quelle, ou un champ vide s'il n'y en a pas ; jamais
  // de valeur par défaut, et l'heure n'est renvoyée à la base que si elle a été changée ici
  // (voir handleSubmit) : enregistrer une réservation ne modifie jamais ses heures en silence.
  const heureDebutInitiale = editing
    ? (reservation?.heure_debut?.slice(0, 5) ?? "")
    : (prefill?.heureDebut ?? "10:00");
  const heureFinInitiale = editing
    ? (reservation?.heure_fin?.slice(0, 5) ?? "")
    : (prefill?.heureFin ?? "10:00");
  const [heureDebut, setHeureDebut] = useState(heureDebutInitiale);
  const [heureFin, setHeureFin] = useState(heureFinInitiale);
  const [lieu, setLieu] = useState(reservation?.lieu_prise_en_charge ?? prefill?.lieu ?? "");
  const [statut, setStatut] = useState<(typeof STATUTS)[number]>(
    reservation?.statut ?? "confirmee",
  );
  const [prixTotal, setPrixTotal] = useState(
    reservation?.prix_total_usd?.toString() ?? prefill?.prixEstime?.toString() ?? "",
  );
  const [caution, setCaution] = useState(reservation?.caution_usd?.toString() ?? "");
  const [assurance, setAssurance] = useState(reservation?.assurance ?? "");
  const [notes, setNotes] = useState(reservation?.notes ?? "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fechasValidas = !dateDebut || !dateFin || dateFin >= dateDebut;

  // Prix convenu protégé. Le tarif automatique (calculer_prix_total) est recalculé à chaque
  // changement de véhicule ou de dates et gardé dans prixAuto. Deux modes :
  //   - automatique : le prix suit le tarif, et chaque mise à jour est annoncée (jamais en
  //     silence) ;
  //   - protégé : le prix a été saisi à la main, ou le prix enregistré diffère du tarif à
  //     l'ouverture (remise négociée, ancien tarif). Un changement de dates ou de véhicule ne
  //     le touche alors jamais : un encadré montre le tarif automatique et laisse choisir.
  // Vider le champ repasse en mode automatique. Sans tarif pour le véhicule (null), le prix
  // n'est pas modifié et rien n'est affiché.
  const [prixAuto, setPrixAuto] = useState<number | null>(null);
  const [protege, setProtege] = useState(false);
  const [avis, setAvis] = useState<
    { type: "ecart"; auto: number } | { type: "maj"; avant: number | null; apres: number } | null
  >(null);
  const etat = useRef({ prixTotal, protege });
  etat.current = { prixTotal, protege };
  // Ouverture : premier calcul pour le véhicule et les dates initiaux. Marquée traitée seulement
  // quand ce calcul aboutit (le double appel des effets en mode strict ne la consomme pas).
  const cleInitiale = useRef(`${vehiculeId}|${dateDebut}|${dateFin}`);
  const ouvertureTraitee = useRef(false);

  useEffect(() => {
    const ouverture = !ouvertureTraitee.current && `${vehiculeId}|${dateDebut}|${dateFin}` === cleInitiale.current;

    const categorieId = vehicules.find((v) => v.id === vehiculeId)?.categorie_id;
    if (!categorieId || !dateDebut || !dateFin || !fechasValidas) {
      setPrixAuto(null);
      return;
    }

    let cancelado = false;
    const supabase = createClient();
    supabase
      .rpc("calculer_prix_total", {
        p_categorie_id: categorieId,
        p_date_debut: dateDebut,
        p_date_fin: dateFin,
      })
      .then(({ data }) => {
        if (cancelado) return;
        const ouvertureEnAttente = !ouvertureTraitee.current;
        ouvertureTraitee.current = true;
        const auto = typeof data === "number" ? data : null;
        setPrixAuto(auto);
        if (auto === null) {
          setAvis(null);
          return;
        }
        const actuel = etat.current.prixTotal === "" ? null : Number(etat.current.prixTotal);

        // Ouverture (réservation existante ou préremplie) : le prix affiché n'est jamais modifié ;
        // s'il diffère du tarif, il est considéré comme convenu.
        if (ouverture) {
          if (actuel !== null && !memePrix(actuel, auto)) setProtege(true);
          return;
        }
        // Dates changées avant la fin du calcul d'ouverture : un prix déjà présent est
        // considéré comme convenu (comportement sûr), jamais écrasé.
        if (ouvertureEnAttente && actuel !== null && !memePrix(actuel, auto)) {
          setProtege(true);
          setAvis({ type: "ecart", auto });
          return;
        }
        if (etat.current.protege) {
          setAvis(actuel !== null && !memePrix(actuel, auto) ? { type: "ecart", auto } : null);
          return;
        }
        setPrixTotal(auto.toString());
        setAvis(actuel !== null && memePrix(actuel, auto) ? null : { type: "maj", avant: actuel, apres: auto });
      });

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehiculeId, dateDebut, dateFin]);

  function saisirPrix(valeur: string) {
    setPrixTotal(valeur);
    setAvis(null);
    // Une valeur différente du tarif automatique active la protection ; vider le champ ou
    // retaper exactement le tarif repasse en mode automatique.
    setProtege(valeur !== "" && (prixAuto === null || !memePrix(Number(valeur), prixAuto)));
  }

  function utiliserTarifAuto(auto: number) {
    setPrixTotal(auto.toString());
    setProtege(false);
    setAvis(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!fechasValidas) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    // Lien vers la demande d'origine, seulement à la création depuis une demande.
    const demandeId = !editing ? prefill?.demandeId : undefined;
    const payload = {
      client_id: clientId,
      vehicule_id: vehiculeId,
      date_debut: dateDebut,
      date_fin: dateFin,
      ...(!editing || heureDebut !== heureDebutInitiale ? { heure_debut: heureDebut || null } : {}),
      ...(!editing || heureFin !== heureFinInitiale ? { heure_fin: heureFin || null } : {}),
      lieu_prise_en_charge: lieu || null,
      statut,
      prix_total_usd: prixTotal ? Number(prixTotal) : null,
      caution_usd: caution ? Number(caution) : null,
      assurance: assurance.trim() || null,
      notes: notes || null,
      ...(demandeId ? { demande_id: demandeId } : {}),
    };

    const { error } = editing
      ? await supabase.from("reservations").update(payload).eq("id", reservation!.id)
      : await supabase.from("reservations").insert(payload);

    if (error) {
      // Contrainte "pas_de_chevauchement" (exclusion GiST) — deux réservations actives
      // qui se chevauchent sur le même véhicule sont rejetées au niveau base de données.
      setError(error.code === "23P01" ? t("error_overlap") : error.message);
      setLoading(false);
      return;
    }

    // Réservation créée depuis une demande : la demande passe à « Convertie ».
    if (demandeId) {
      await supabase
        .from("demandes_reservation")
        .update({ statut: "convertie" })
        .eq("id", demandeId);
    }

    router.push("/admin/reservations");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin/reservations" className={secondaryLinkClass}>
            {tCommon("cancel")}
          </Link>
          <button type="submit" disabled={loading || !fechasValidas} className={primaryButtonClass}>
            {loading ? tCommon("saving") : editing ? t("save_changes") : t("submit_create")}
          </button>
        </div>
      </div>

      {secondaryActions}

      {prefill?.demandeNom && (
        <p className="rounded bg-brand-light px-3 py-2 text-sm text-ink">
          {t("convert_prefill_notice", {
            nombre: prefill.demandeNom,
            whatsapp: prefill.demandeWhatsapp ?? "",
          })}
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
        <div className="flex flex-col gap-5">
          <Card title={t("section_cliente_vehiculo")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className={labelClass}>{t("field_cliente")}</span>
                <select
                  required
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className={inputClass}
                >
                  <option value="" disabled>
                    {t("field_cliente_placeholder")}
                  </option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className={labelClass}>{t("field_vehiculo")}</span>
                <select
                  required
                  value={vehiculeId}
                  onChange={(e) => setVehiculeId(e.target.value)}
                  className={inputClass}
                >
                  <option value="" disabled>
                    {t("field_vehiculo_placeholder")}
                  </option>
                  {vehicules.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.categorie_nom} ({v.plaque ?? tCommon("dash")})
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </Card>

          <Card title={t("section_fechas")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className={labelClass}>{t("field_fecha_inicio")}</span>
                <input
                  type="date"
                  required
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="block text-sm">
                <span className={labelClass}>{t("field_fecha_fin")}</span>
                <input
                  type="date"
                  required
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>

            {!fechasValidas && <p className="text-sm text-red-600">{t("error_fechas")}</p>}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className={labelClass}>{t("field_hora_inicio")}</span>
                <input
                  type="time"
                  value={heureDebut}
                  onChange={(e) => setHeureDebut(e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="block text-sm">
                <span className={labelClass}>{t("field_hora_fin")}</span>
                <input
                  type="time"
                  value={heureFin}
                  onChange={(e) => setHeureFin(e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>

            <label className="block text-sm">
              <span className={labelClass}>{t("field_lugar")}</span>
              <input
                type="text"
                value={lieu}
                onChange={(e) => setLieu(e.target.value)}
                className={inputClass}
              />
            </label>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card title={t("section_tarifa")}>
            <label className="block text-sm">
              <span className={labelClass}>{t("field_precio")}</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={prixTotal}
                onChange={(e) => saisirPrix(e.target.value)}
                className={inputClass}
              />
              <span className="mt-1 block text-xs text-ink-soft">
                {protege ? t("prix_convenu_hint") : t("field_precio_hint")}
              </span>
            </label>

            {avis?.type === "ecart" && (
              <div role="alert" className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-950">
                <p>
                  {t("prix_convenu_ecart", { convenu: Number(prixTotal), auto: avis.auto })}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => utiliserTarifAuto(avis.auto)}
                    className="rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-black"
                  >
                    {t("prix_utiliser_auto")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvis(null)}
                    className="rounded-md border border-amber-400 bg-white px-3 py-1.5 text-xs font-semibold text-amber-950 transition-colors hover:bg-amber-100"
                  >
                    {t("prix_garder_convenu")}
                  </button>
                </div>
              </div>
            )}
            {avis?.type === "maj" && (
              <p role="status" className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-950">
                {avis.avant === null
                  ? t("prix_auto_applique", { apres: avis.apres })
                  : t("prix_auto_maj", { avant: avis.avant, apres: avis.apres })}
              </p>
            )}

            <label className="block text-sm">
              <span className={labelClass}>{t("field_deposito")}</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={caution}
                onChange={(e) => setCaution(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block text-sm">
              <span className={labelClass}>{t("field_assurance")}</span>
              <input
                type="text"
                value={assurance}
                onChange={(e) => setAssurance(e.target.value)}
                placeholder={t("field_assurance_placeholder")}
                className={inputClass}
              />
            </label>
          </Card>

          <Card title={t("section_estado")}>
            <label className="block text-sm">
              <span className={labelClass}>{t("field_estado")}</span>
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value as (typeof STATUTS)[number])}
                className={inputClass}
              >
                {STATUTS.map((s) => (
                  <option key={s} value={s}>
                    {STATUT_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
          </Card>

          <Card title={t("field_notas")}>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className={inputClass}
            />
          </Card>
        </div>
      </div>
    </form>
  );
}

// Comparaison au centime près (le champ accepte deux décimales, la base renvoie un numeric).
function memePrix(a: number, b: number) {
  return Math.abs(a - b) < 0.005;
}
