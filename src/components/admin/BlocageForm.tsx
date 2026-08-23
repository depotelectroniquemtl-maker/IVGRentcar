"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import {
  FormSection,
  dangerLinkClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryLinkClass,
} from "@/components/admin/form-ui";

type Blocage = {
  id: string;
  vehicule_id: string;
  date_debut: string;
  date_fin: string;
  motif: string | null;
};

export function BlocageForm({
  title,
  vehicules,
  blocage,
  vehiculeIdPreseleccionado,
  dateDebutPreseleccionada,
}: {
  title: string;
  vehicules: { id: string; plaque: string | null; categorie_nom: string }[];
  blocage?: Blocage;
  vehiculeIdPreseleccionado?: string;
  dateDebutPreseleccionada?: string;
}) {
  const router = useRouter();
  const t = useTranslations("admin.blocages");
  const tCommon = useTranslations("admin.common");
  const editing = Boolean(blocage);

  const [vehiculeId, setVehiculeId] = useState(
    blocage?.vehicule_id ?? vehiculeIdPreseleccionado ?? "",
  );
  const [dateDebut, setDateDebut] = useState(
    blocage?.date_debut ?? dateDebutPreseleccionada ?? "",
  );
  const [dateFin, setDateFin] = useState(blocage?.date_fin ?? dateDebutPreseleccionada ?? "");
  const [motif, setMotif] = useState(blocage?.motif ?? "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const fechasValidas = !dateDebut || !dateFin || dateFin >= dateDebut;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!fechasValidas) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const payload = {
      vehicule_id: vehiculeId,
      date_debut: dateDebut,
      date_fin: dateFin,
      motif: motif || null,
    };

    const { error } = editing
      ? await supabase.from("indisponibilites_vehicule").update(payload).eq("id", blocage!.id)
      : await supabase.from("indisponibilites_vehicule").insert(payload);

    if (error) {
      // Contrainte "pas_de_chevauchement_indispo" (exclusion GiST).
      setError(error.code === "23P01" ? t("error_overlap") : error.message);
      setLoading(false);
      return;
    }

    router.push("/admin/calendrier");
    router.refresh();
  }

  async function handleDelete() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("indisponibilites_vehicule")
      .delete()
      .eq("id", blocage!.id);
    if (error) {
      setLoading(false);
      return;
    }
    router.push("/admin/calendrier");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin/calendrier" className={secondaryLinkClass}>
            {tCommon("cancel")}
          </Link>
          <button type="submit" disabled={loading || !fechasValidas} className={primaryButtonClass}>
            {loading ? tCommon("saving") : editing ? t("save_changes") : t("submit_create")}
          </button>
        </div>
      </div>

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

      <FormSection title={t("section_periodo")}>
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

        <label className="block text-sm">
          <span className={labelClass}>{t("field_motivo")}</span>
          <input
            type="text"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder={t("field_motivo_placeholder")}
            className={inputClass}
          />
        </label>
      </FormSection>

      {editing && (
        <div className="border-t border-black/10 pt-4">
          {!confirmingDelete ? (
            <button type="button" onClick={() => setConfirmingDelete(true)} className={dangerLinkClass}>
              {t("delete")}
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
              <span className="text-red-800">{t("delete_confirm")}</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="rounded-md bg-red-600 px-3 py-1.5 font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {loading ? tCommon("saving") : t("delete_confirm_yes")}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={loading}
                className="text-ink-soft hover:underline"
              >
                {tCommon("cancel")}
              </button>
            </div>
          )}
        </div>
      )}
      </div>
    </form>
  );
}
