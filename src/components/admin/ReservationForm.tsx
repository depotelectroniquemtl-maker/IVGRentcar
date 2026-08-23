"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

const STATUTS = ["en_attente", "confirmee", "annulee"] as const;

const inputClass =
  "w-full rounded border border-black/20 px-3 py-2 focus:border-brand focus:outline-none";
const labelClass = "mb-1 block font-medium text-ink";

type Reservation = {
  id: string;
  client_id: string;
  vehicule_id: string;
  date_debut: string;
  date_fin: string;
  statut: (typeof STATUTS)[number];
  prix_total_usd: number | null;
  caution_usd: number | null;
  notes: string | null;
};

export function ReservationForm({
  clients,
  vehicules,
  reservation,
}: {
  clients: { id: string; nom: string }[];
  vehicules: { id: string; plaque: string | null; categorie_nom: string }[];
  reservation?: Reservation;
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

  const [clientId, setClientId] = useState(reservation?.client_id ?? "");
  const [vehiculeId, setVehiculeId] = useState(reservation?.vehicule_id ?? "");
  const [dateDebut, setDateDebut] = useState(reservation?.date_debut ?? "");
  const [dateFin, setDateFin] = useState(reservation?.date_fin ?? "");
  const [statut, setStatut] = useState<(typeof STATUTS)[number]>(
    reservation?.statut ?? "confirmee",
  );
  const [prixTotal, setPrixTotal] = useState(reservation?.prix_total_usd?.toString() ?? "");
  const [caution, setCaution] = useState(reservation?.caution_usd?.toString() ?? "");
  const [notes, setNotes] = useState(reservation?.notes ?? "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fechasValidas = !dateDebut || !dateFin || dateFin >= dateDebut;

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
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4 rounded-lg bg-white p-8 shadow-sm">
      <label className="block text-sm">
        <span className={labelClass}>{t("field_cliente")}</span>
        <select
          required
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className={`${inputClass} bg-white`}
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
          className={`${inputClass} bg-white`}
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
          <span className={labelClass}>{t("field_precio")}</span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={prixTotal}
            onChange={(e) => setPrixTotal(e.target.value)}
            className={inputClass}
          />
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
      </div>

      <label className="block text-sm">
        <span className={labelClass}>{t("field_estado")}</span>
        <select
          value={statut}
          onChange={(e) => setStatut(e.target.value as (typeof STATUTS)[number])}
          className={`${inputClass} bg-white`}
        >
          {STATUTS.map((s) => (
            <option key={s} value={s}>
              {STATUT_LABELS[s]}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className={labelClass}>{t("field_notas")}</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className={inputClass}
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || !fechasValidas}
        className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? tCommon("saving") : editing ? t("save_changes") : t("submit_create")}
      </button>
    </form>
  );
}
