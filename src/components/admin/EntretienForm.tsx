"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

const TYPES = ["vidange", "freins", "pneus", "reparation", "inspection", "autre"] as const;

const inputClass =
  "w-full rounded border border-black/20 px-3 py-2 focus:border-brand focus:outline-none";
const labelClass = "mb-1 block font-medium text-ink";

export function EntretienForm({
  vehicules,
  vehiculeIdPreseleccionado,
}: {
  vehicules: { id: string; plaque: string | null; categorie_nom: string }[];
  vehiculeIdPreseleccionado?: string;
}) {
  const router = useRouter();
  const t = useTranslations("admin.entretiens");
  const tCommon = useTranslations("admin.common");

  const TYPE_LABELS: Record<(typeof TYPES)[number], string> = {
    vidange: tCommon("entretien_type_vidange"),
    freins: tCommon("entretien_type_freins"),
    pneus: tCommon("entretien_type_pneus"),
    reparation: tCommon("entretien_type_reparation"),
    inspection: tCommon("entretien_type_inspection"),
    autre: tCommon("entretien_type_autre"),
  };

  const [vehiculeId, setVehiculeId] = useState(vehiculeIdPreseleccionado ?? "");
  const [type, setType] = useState<(typeof TYPES)[number]>("vidange");
  const [dateEntretien, setDateEntretien] = useState(() => new Date().toISOString().slice(0, 10));
  const [cout, setCout] = useState("");
  const [prochainEntretien, setProchainEntretien] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from("entretiens").insert({
      vehicule_id: vehiculeId,
      type,
      date_entretien: dateEntretien,
      cout_usd: cout ? Number(cout) : null,
      prochain_entretien: prochainEntretien || null,
      notes: notes || null,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin/entretiens");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4 rounded-lg bg-white p-8 shadow-sm">
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

      <label className="block text-sm">
        <span className={labelClass}>{t("field_tipo")}</span>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as (typeof TYPES)[number])}
          className={`${inputClass} bg-white`}
        >
          {TYPES.map((ty) => (
            <option key={ty} value={ty}>
              {TYPE_LABELS[ty]}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className={labelClass}>{t("field_fecha")}</span>
          <input
            type="date"
            required
            value={dateEntretien}
            onChange={(e) => setDateEntretien(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block text-sm">
          <span className={labelClass}>{t("field_costo")}</span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={cout}
            onChange={(e) => setCout(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className={labelClass}>{t("field_proximo")}</span>
        <input
          type="date"
          value={prochainEntretien}
          onChange={(e) => setProchainEntretien(e.target.value)}
          className={inputClass}
        />
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
        disabled={loading}
        className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? tCommon("saving") : t("submit_create")}
      </button>
    </form>
  );
}
