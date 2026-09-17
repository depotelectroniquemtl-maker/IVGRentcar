"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { FormSection, inputClass, labelClass, primaryButtonClass, secondaryLinkClass } from "@/components/admin/form-ui";

const TYPES = ["vidange", "freins", "pneus", "reparation", "inspection", "autre"] as const;

type Entretien = {
  id: string;
  vehicule_id: string;
  type: string;
  date_entretien: string;
  cout_usd: number | null;
  prochain_entretien: string | null;
  notes: string | null;
};

export function EntretienForm({
  title,
  vehicules,
  vehiculeIdPreseleccionado,
  entretien,
  secondaryActions,
}: {
  title: string;
  vehicules: { id: string; plaque: string | null; categorie_nom: string }[];
  vehiculeIdPreseleccionado?: string;
  entretien?: Entretien;
  secondaryActions?: ReactNode;
}) {
  const router = useRouter();
  const t = useTranslations("admin.entretiens");
  const tCommon = useTranslations("admin.common");
  const editing = Boolean(entretien);

  const TYPE_LABELS: Record<(typeof TYPES)[number], string> = {
    vidange: tCommon("entretien_type_vidange"),
    freins: tCommon("entretien_type_freins"),
    pneus: tCommon("entretien_type_pneus"),
    reparation: tCommon("entretien_type_reparation"),
    inspection: tCommon("entretien_type_inspection"),
    autre: tCommon("entretien_type_autre"),
  };

  const [vehiculeId, setVehiculeId] = useState(entretien?.vehicule_id ?? vehiculeIdPreseleccionado ?? "");
  const [type, setType] = useState<(typeof TYPES)[number]>(
    (entretien?.type as (typeof TYPES)[number] | undefined) ?? "vidange",
  );
  const [dateEntretien, setDateEntretien] = useState(
    entretien?.date_entretien ?? (() => new Date().toISOString().slice(0, 10))(),
  );
  const [cout, setCout] = useState(entretien?.cout_usd != null ? String(entretien.cout_usd) : "");
  const [prochainEntretien, setProchainEntretien] = useState(entretien?.prochain_entretien ?? "");
  const [notes, setNotes] = useState(entretien?.notes ?? "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const payload = {
      vehicule_id: vehiculeId,
      type,
      date_entretien: dateEntretien,
      cout_usd: cout ? Number(cout) : null,
      prochain_entretien: prochainEntretien || null,
      notes: notes || null,
    };

    const { error } = editing
      ? await supabase.from("entretiens").update(payload).eq("id", entretien!.id)
      : await supabase.from("entretiens").insert(payload);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin/entretiens");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin/entretiens" className={secondaryLinkClass}>
            {tCommon("cancel")}
          </Link>
          <button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading ? tCommon("saving") : editing ? t("save_changes") : t("submit_create")}
          </button>
        </div>
      </div>

      {secondaryActions}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-col gap-6 rounded-lg border border-black/10 bg-white p-8 shadow-sm">
      <FormSection title={t("section_vehiculo")}>
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
      </FormSection>

      <FormSection title={t("section_detalle")}>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className={labelClass}>{t("field_tipo")}</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as (typeof TYPES)[number])}
              className={inputClass}
            >
              {TYPES.map((ty) => (
                <option key={ty} value={ty}>
                  {TYPE_LABELS[ty]}
                </option>
              ))}
            </select>
          </label>

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
      </FormSection>

      <FormSection title={tCommon("section_notas")}>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className={inputClass}
        />
      </FormSection>
      </div>
    </form>
  );
}
