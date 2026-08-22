"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ETATS = ["disponible", "maintenance", "hors_service"] as const;

const ETAT_LABELS: Record<(typeof ETATS)[number], string> = {
  disponible: "Disponible",
  maintenance: "Mantenimiento",
  hors_service: "Fuera de servicio",
};

const inputClass =
  "w-full rounded border border-black/20 px-3 py-2 focus:border-brand focus:outline-none";
const labelClass = "mb-1 block font-medium text-ink";

type Vehicule = {
  id: string;
  categorie_id: string;
  plaque: string;
  annee: number | null;
  etat_operationnel: string;
  notes: string | null;
  actif: boolean;
};

export function VehiculeForm({
  categories,
  vehicule,
}: {
  categories: { id: string; nom: string }[];
  vehicule?: Vehicule;
}) {
  const router = useRouter();
  const editing = Boolean(vehicule);

  const [categorieId, setCategorieId] = useState(vehicule?.categorie_id ?? "");
  const [plaque, setPlaque] = useState(vehicule?.plaque ?? "");
  const [annee, setAnnee] = useState(vehicule?.annee?.toString() ?? "");
  const [etat, setEtat] = useState(vehicule?.etat_operationnel ?? "disponible");
  const [notes, setNotes] = useState(vehicule?.notes ?? "");
  const [actif, setActif] = useState(vehicule?.actif ?? true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const payload = {
      categorie_id: categorieId,
      plaque,
      annee: annee ? Number(annee) : null,
      etat_operationnel: etat,
      notes: notes || null,
      actif,
    };

    const { error } = editing
      ? await supabase.from("vehicules").update(payload).eq("id", vehicule!.id)
      : await supabase.from("vehicules").insert(payload);

    if (error) {
      setError(
        error.code === "23505"
          ? "Ya existe un vehículo con esa placa."
          : error.message,
      );
      setLoading(false);
      return;
    }

    router.push("/admin/vehicules");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4 rounded-lg bg-white p-8 shadow-sm">
      <label className="block text-sm">
        <span className={labelClass}>Categoría</span>
        <select
          required
          value={categorieId}
          onChange={(e) => setCategorieId(e.target.value)}
          className={`${inputClass} bg-white`}
        >
          <option value="" disabled>
            Selecciona una categoría
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nom}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className={labelClass}>Placa</span>
          <input
            type="text"
            required
            value={plaque}
            onChange={(e) => setPlaque(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block text-sm">
          <span className={labelClass}>Año</span>
          <input
            type="number"
            value={annee}
            onChange={(e) => setAnnee(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className={labelClass}>Estado operacional</span>
        <select
          value={etat}
          onChange={(e) => setEtat(e.target.value)}
          className={`${inputClass} bg-white`}
        >
          {ETATS.map((s) => (
            <option key={s} value={s}>
              {ETAT_LABELS[s]}
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

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={actif}
          onChange={(e) => setActif(e.target.checked)}
          className="h-4 w-4 rounded border-black/20"
        />
        <span className="font-medium text-ink">Activo</span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? "Guardando…" : editing ? "Guardar cambios" : "Crear vehículo"}
      </button>
    </form>
  );
}
