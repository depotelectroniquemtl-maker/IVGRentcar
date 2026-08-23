"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Card, inputClass, labelClass, primaryButtonClass, secondaryLinkClass } from "@/components/admin/form-ui";

const ETATS = ["disponible", "maintenance", "hors_service"] as const;

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
  title,
  categories,
  vehicule,
}: {
  title: string;
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
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin/vehicules" className={secondaryLinkClass}>
            {tCommon("cancel")}
          </Link>
          <button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading ? tCommon("saving") : editing ? t("save_changes") : t("submit_create")}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
        <div className="flex flex-col gap-5">
          <Card title={t("section_identificacion")}>
            <label className="block text-sm">
              <span className={labelClass}>{t("field_categoria")}</span>
              <select
                required
                value={categorieId}
                onChange={(e) => setCategorieId(e.target.value)}
                className={inputClass}
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

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block text-sm">
                <span className={labelClass}>{t("field_placa")}</span>
                <input
                  type="text"
                  value={plaque}
                  onChange={(e) => setPlaque(e.target.value)}
                  placeholder={t("field_placa_placeholder")}
                  className={`${inputClass} font-mono`}
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

              <label className="block text-sm">
                <span className={labelClass}>{t("field_color")}</span>
                <input
                  type="text"
                  value={couleur}
                  onChange={(e) => setCouleur(e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
          </Card>

          <Card title={t("field_notas")}>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className={inputClass}
            />
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card title={t("section_estado")}>
            <div className="flex flex-col gap-2">
              <span className={labelClass}>{t("field_estado")}</span>
              <div className="flex gap-2">
                {ETATS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setEtat(s)}
                    className={`flex-1 rounded-md border px-2 py-2 text-xs font-semibold transition-colors ${
                      s === etat
                        ? "border-brand/40 bg-brand/10 text-brand-dark"
                        : "border-black/15 text-ink-soft hover:bg-black/5"
                    }`}
                  >
                    {ETAT_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={actif}
                onChange={(e) => setActif(e.target.checked)}
                className="h-4 w-4 rounded border-black/20"
              />
              <span className="font-medium text-ink">{t("field_activo")}</span>
            </label>
          </Card>
        </div>
      </div>
    </form>
  );
}
