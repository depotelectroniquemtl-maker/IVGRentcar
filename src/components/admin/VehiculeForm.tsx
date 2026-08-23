"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

const ETATS = ["disponible", "maintenance", "hors_service"] as const;

const inputClass =
  "w-full rounded border border-black/20 px-3 py-2 focus:border-brand focus:outline-none";
const labelClass = "mb-1 block font-medium text-ink";

type Vehicule = {
  id: string;
  categorie_id: string;
  plaque: string | null;
  annee: number | null;
  couleur: string | null;
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
  const t = useTranslations("admin.vehicules");
  const tCommon = useTranslations("admin.common");
  const editing = Boolean(vehicule);

  const ETAT_LABELS: Record<(typeof ETATS)[number], string> = {
    disponible: tCommon("vehicule_etat_disponible"),
    maintenance: tCommon("vehicule_etat_maintenance"),
    hors_service: tCommon("vehicule_etat_hors_service"),
  };

  const [categorieId, setCategorieId] = useState(vehicule?.categorie_id ?? "");
  const [plaque, setPlaque] = useState(vehicule?.plaque ?? "");
  const [annee, setAnnee] = useState(vehicule?.annee?.toString() ?? "");
  const [couleur, setCouleur] = useState(vehicule?.couleur ?? "");
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
      plaque: plaque.trim() || null,
      annee: annee ? Number(annee) : null,
      couleur: couleur || null,
      etat_operationnel: etat,
      notes: notes || null,
      actif,
    };

    const { error } = editing
      ? await supabase.from("vehicules").update(payload).eq("id", vehicule!.id)
      : await supabase.from("vehicules").insert(payload);

    if (error) {
      setError(error.code === "23505" ? t("error_duplicate_plaque") : error.message);
      setLoading(false);
      return;
    }

    router.push("/admin/vehicules");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4 rounded-lg bg-white p-8 shadow-sm">
      <label className="block text-sm">
        <span className={labelClass}>{t("field_categoria")}</span>
        <select
          required
          value={categorieId}
          onChange={(e) => setCategorieId(e.target.value)}
          className={`${inputClass} bg-white`}
        >
          <option value="" disabled>
            {t("field_categoria_placeholder")}
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
          <span className={labelClass}>{t("field_placa")}</span>
          <input
            type="text"
            value={plaque}
            onChange={(e) => setPlaque(e.target.value)}
            placeholder={t("field_placa_placeholder")}
            className={inputClass}
          />
        </label>

        <label className="block text-sm">
          <span className={labelClass}>{t("field_anio")}</span>
          <input
            type="number"
            value={annee}
            onChange={(e) => setAnnee(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className={labelClass}>{t("field_color")}</span>
        <input
          type="text"
          value={couleur}
          onChange={(e) => setCouleur(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="block text-sm">
        <span className={labelClass}>{t("field_estado")}</span>
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
        <span className={labelClass}>{t("field_notas")}</span>
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
        <span className="font-medium text-ink">{t("field_activo")}</span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? tCommon("saving") : editing ? t("save_changes") : t("submit_create")}
      </button>
    </form>
  );
}
