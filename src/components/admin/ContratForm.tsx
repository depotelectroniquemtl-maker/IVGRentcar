"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { ACCESSOIRES_CONTRAT, NIVEAUX_ESSENCE } from "@/lib/contrat-accessoires";

const inputClass =
  "w-full rounded border border-black/20 px-3 py-2 focus:border-brand focus:outline-none";
const labelClass = "mb-1 block font-medium text-ink";

type Contrat = {
  id: string;
  heure_remise: string | null;
  couleur_vehicule: string | null;
  deducible_usd: number | null;
  abono_usd: number | null;
  solde_usd: number | null;
  niveau_essence: string | null;
  accessoires: Record<string, boolean>;
  garant_nom: string | null;
  garant_adresse: string | null;
  garant_cedula: string | null;
  garant_telephone: string | null;
  notes: string | null;
};

export function ContratForm({
  reservationId,
  prixTotalUsd,
  couleurVehiculeParDefaut,
  contrat,
}: {
  reservationId: string;
  prixTotalUsd: number | null;
  couleurVehiculeParDefaut: string | null;
  contrat?: Contrat;
}) {
  const router = useRouter();
  const t = useTranslations("admin.contrats");
  const tCommon = useTranslations("admin.common");
  const editing = Boolean(contrat);

  const [heureRemise, setHeureRemise] = useState(contrat?.heure_remise?.slice(0, 5) ?? "");
  const [couleurVehicule, setCouleurVehicule] = useState(
    contrat?.couleur_vehicule ?? couleurVehiculeParDefaut ?? "",
  );
  const [deducible, setDeducible] = useState(contrat?.deducible_usd?.toString() ?? "");
  const [abono, setAbono] = useState(contrat?.abono_usd?.toString() ?? "");
  const [solde, setSolde] = useState(contrat?.solde_usd?.toString() ?? "");
  const [niveauEssence, setNiveauEssence] = useState(contrat?.niveau_essence ?? "");
  const [accessoires, setAccessoires] = useState<Record<string, boolean>>(
    contrat?.accessoires ?? {},
  );
  const [garantNom, setGarantNom] = useState(contrat?.garant_nom ?? "");
  const [garantAdresse, setGarantAdresse] = useState(contrat?.garant_adresse ?? "");
  const [garantCedula, setGarantCedula] = useState(contrat?.garant_cedula ?? "");
  const [garantTelephone, setGarantTelephone] = useState(contrat?.garant_telephone ?? "");
  const [notes, setNotes] = useState(contrat?.notes ?? "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Saldo pré-calculé (prix total - abono) dès que l'abono change, mais reste un champ
  // libre modifiable ensuite — même logique que le prix auto-calculé de ReservationForm.
  const premierRendu = useRef(true);
  useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false;
      return;
    }
    if (prixTotalUsd == null) return;
    const abonoNum = abono ? Number(abono) : 0;
    setSolde((prixTotalUsd - abonoNum).toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abono]);

  function toggleAccessoire(key: string) {
    setAccessoires((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const payload = {
      reservation_id: reservationId,
      heure_remise: heureRemise || null,
      couleur_vehicule: couleurVehicule || null,
      deducible_usd: deducible ? Number(deducible) : null,
      abono_usd: abono ? Number(abono) : null,
      solde_usd: solde ? Number(solde) : null,
      niveau_essence: niveauEssence || null,
      accessoires,
      garant_nom: garantNom || null,
      garant_adresse: garantAdresse || null,
      garant_cedula: garantCedula || null,
      garant_telephone: garantTelephone || null,
      notes: notes || null,
    };

    const { error } = editing
      ? await supabase.from("contrats_location").update(payload).eq("id", contrat!.id)
      : await supabase.from("contrats_location").insert(payload);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(`/admin/reservations/${reservationId}/contrat`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-4 rounded-lg bg-white p-8 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className={labelClass}>{t("field_hora_entrega")}</span>
          <input
            type="time"
            value={heureRemise}
            onChange={(e) => setHeureRemise(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block text-sm">
          <span className={labelClass}>{t("field_color_vehiculo")}</span>
          <input
            type="text"
            value={couleurVehicule}
            onChange={(e) => setCouleurVehicule(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm">
          <span className={labelClass}>{t("field_deducible")}</span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={deducible}
            onChange={(e) => setDeducible(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block text-sm">
          <span className={labelClass}>{t("field_abono")}</span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={abono}
            onChange={(e) => setAbono(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block text-sm">
          <span className={labelClass}>{t("field_saldo")}</span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={solde}
            onChange={(e) => setSolde(e.target.value)}
            className={inputClass}
          />
          <span className="mt-1 block text-xs text-ink-soft">{t("field_saldo_hint")}</span>
        </label>
      </div>

      <label className="block text-sm">
        <span className={labelClass}>{t("field_nivel_gasolina")}</span>
        <select
          value={niveauEssence}
          onChange={(e) => setNiveauEssence(e.target.value)}
          className={`${inputClass} bg-white`}
        >
          <option value="">{t("field_nivel_gasolina_placeholder")}</option>
          {NIVEAUX_ESSENCE.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="rounded border border-black/10 p-4">
        <legend className="px-1 text-sm font-bold text-ink">{t("section_garante")}</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className={labelClass}>{t("field_garante_nombre")}</span>
            <input
              type="text"
              value={garantNom}
              onChange={(e) => setGarantNom(e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block text-sm">
            <span className={labelClass}>{t("field_garante_telefono")}</span>
            <input
              type="tel"
              value={garantTelephone}
              onChange={(e) => setGarantTelephone(e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block text-sm">
            <span className={labelClass}>{t("field_garante_cedula")}</span>
            <input
              type="text"
              value={garantCedula}
              onChange={(e) => setGarantCedula(e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block text-sm">
            <span className={labelClass}>{t("field_garante_direccion")}</span>
            <input
              type="text"
              value={garantAdresse}
              onChange={(e) => setGarantAdresse(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="rounded border border-black/10 p-4">
        <legend className="px-1 text-sm font-bold text-ink">{t("section_accesorios")}</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ACCESSOIRES_CONTRAT.map((item) => (
            <label key={item.key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(accessoires[item.key])}
                onChange={() => toggleAccessoire(item.key)}
                className="h-4 w-4 rounded border-black/20"
              />
              {item.label}
            </label>
          ))}
        </div>
      </fieldset>

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
        {loading ? tCommon("saving") : editing ? t("save_changes") : t("submit_create")}
      </button>
    </form>
  );
}
