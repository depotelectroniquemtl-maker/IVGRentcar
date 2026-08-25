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
  const [heureDebut, setHeureDebut] = useState(
    reservation?.heure_debut?.slice(0, 5) ?? prefill?.heureDebut ?? "",
  );
  const [heureFin, setHeureFin] = useState(
    reservation?.heure_fin?.slice(0, 5) ?? prefill?.heureFin ?? "",
  );
  const [lieu, setLieu] = useState(reservation?.lieu_prise_en_charge ?? prefill?.lieu ?? "");
  const [statut, setStatut] = useState<(typeof STATUTS)[number]>(
    reservation?.statut ?? "confirmee",
  );
  const [prixTotal, setPrixTotal] = useState(
    reservation?.prix_total_usd?.toString() ?? prefill?.prixEstime?.toString() ?? "",
  );
  const [caution, setCaution] = useState(reservation?.caution_usd?.toString() ?? "");
  const [notes, setNotes] = useState(reservation?.notes ?? "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fechasValidas = !dateDebut || !dateFin || dateFin >= dateDebut;

  // Prix pré-rempli automatiquement dès que véhicule + dates changent, mais reste
  // modifiable à la main ensuite (demande explicite du client, ex: remise). On saute le
  // tout premier passage pour ne jamais écraser un prix déjà personnalisé au chargement
  // (édition d'une réservation existante, ou prix précalculé venant d'une demande).
  const premierRendu = useRef(true);
  useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false;
      return;
    }

    const categorieId = vehicules.find((v) => v.id === vehiculeId)?.categorie_id;
    if (!categorieId || !dateDebut || !dateFin || !fechasValidas) return;

    let cancelado = false;
    const supabase = createClient();
    supabase
      .rpc("calculer_prix_total", {
        p_categorie_id: categorieId,
        p_date_debut: dateDebut,
        p_date_fin: dateFin,
      })
      .then(({ data }) => {
        if (!cancelado && typeof data === "number") setPrixTotal(data.toString());
      });

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehiculeId, dateDebut, dateFin]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!fechasValidas) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const payload = {
      client_id: clientId,
      vehicule_id: vehiculeId,
      date_debut: dateDebut,
      date_fin: dateFin,
      heure_debut: heureDebut || null,
      heure_fin: heureFin || null,
      lieu_prise_en_charge: lieu || null,
      statut,
      prix_total_usd: prixTotal ? Number(prixTotal) : null,
      caution_usd: caution ? Number(caution) : null,
      notes: notes || null,
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
                onChange={(e) => setPrixTotal(e.target.value)}
                className={inputClass}
              />
              <span className="mt-1 block text-xs text-ink-soft">{t("field_precio_hint")}</span>
            </label>

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
