"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const STATUTS = ["en_attente", "confirmee", "annulee"] as const;

const STATUT_LABELS: Record<(typeof STATUTS)[number], string> = {
  en_attente: "Pendiente",
  confirmee: "Confirmada",
  annulee: "Anulada",
};

const inputClass =
  "w-full rounded border border-black/20 px-3 py-2 focus:border-brand focus:outline-none";
const labelClass = "mb-1 block font-medium text-ink";

export function ReservationForm({
  clients,
  vehicules,
}: {
  clients: { id: string; nom: string }[];
  vehicules: { id: string; plaque: string; categorie_nom: string }[];
}) {
  const router = useRouter();

  const [clientId, setClientId] = useState("");
  const [vehiculeId, setVehiculeId] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [statut, setStatut] = useState<(typeof STATUTS)[number]>("confirmee");
  const [prixTotal, setPrixTotal] = useState("");
  const [caution, setCaution] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fechasValidas = !dateDebut || !dateFin || dateFin >= dateDebut;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!fechasValidas) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from("reservations").insert({
      client_id: clientId,
      vehicule_id: vehiculeId,
      date_debut: dateDebut,
      date_fin: dateFin,
      statut,
      prix_total_usd: prixTotal ? Number(prixTotal) : null,
      caution_usd: caution ? Number(caution) : null,
      notes: notes || null,
    });

    if (error) {
      // Contrainte "pas_de_chevauchement" (exclusion GiST) — deux réservations actives
      // qui se chevauchent sur le même véhicule sont rejetées au niveau base de données.
      setError(
        error.code === "23P01"
          ? "Ese vehículo ya tiene una reserva que se cruza con esas fechas."
          : error.message,
      );
      setLoading(false);
      return;
    }

    router.push("/admin/reservations");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4 rounded-lg bg-white p-8 shadow-sm">
      <label className="block text-sm">
        <span className={labelClass}>Cliente</span>
        <select
          required
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className={`${inputClass} bg-white`}
        >
          <option value="" disabled>
            Selecciona un cliente
          </option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className={labelClass}>Vehículo</span>
        <select
          required
          value={vehiculeId}
          onChange={(e) => setVehiculeId(e.target.value)}
          className={`${inputClass} bg-white`}
        >
          <option value="" disabled>
            Selecciona un vehículo
          </option>
          {vehicules.map((v) => (
            <option key={v.id} value={v.id}>
              {v.categorie_nom} ({v.plaque})
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className={labelClass}>Fecha de inicio</span>
          <input
            type="date"
            required
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block text-sm">
          <span className={labelClass}>Fecha de fin</span>
          <input
            type="date"
            required
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      {!fechasValidas && (
        <p className="text-sm text-red-600">
          La fecha de fin debe ser posterior o igual a la fecha de inicio.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className={labelClass}>Precio total (US$)</span>
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
          <span className={labelClass}>Depósito (US$)</span>
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
        <span className={labelClass}>Estado</span>
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
        <span className={labelClass}>Notas</span>
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
        {loading ? "Guardando…" : "Crear reserva"}
      </button>
    </form>
  );
}
