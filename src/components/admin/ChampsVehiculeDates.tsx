"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { champClass, libelleClass } from "@/components/admin/demandes-ui";

export type VehiculeOption = { id: string; categorieId: string; libelle: string };
export type ValeursVehiculeDates = {
  vehiculeId: string;
  dateDebut: string;
  dateFin: string;
  prix: string;
  // Prix saisi à la main : le calcul automatique ne le remplace plus.
  prixManuel: boolean;
};

// Véhicule, dates et prix estimé d'une demande (saisie manuelle et complétion dans le panneau).
// Le prix vient de calculer_prix_total dès que véhicule et dates sont connus, tant qu'il n'a pas
// été saisi à la main ; aucune autre logique de prix ici.
export function ChampsVehiculeDates({
  idPrefixe,
  vehicules,
  valeurs,
  onChange,
}: {
  idPrefixe: string;
  vehicules: VehiculeOption[];
  valeurs: ValeursVehiculeDates;
  onChange: (v: ValeursVehiculeDates) => void;
}) {
  const t = useTranslations("admin.demandes");
  const courant = useRef(valeurs);
  courant.current = valeurs;
  const categorieId = vehicules.find((v) => v.id === valeurs.vehiculeId)?.categorieId;

  useEffect(() => {
    if (!categorieId || !valeurs.dateDebut || !valeurs.dateFin || valeurs.dateFin < valeurs.dateDebut) return;
    if (courant.current.prixManuel) return;
    let annule = false;
    createClient()
      .rpc("calculer_prix_total", {
        p_categorie_id: categorieId,
        p_date_debut: valeurs.dateDebut,
        p_date_fin: valeurs.dateFin,
      })
      .then(({ data }) => {
        if (annule || courant.current.prixManuel || typeof data !== "number") return;
        onChange({ ...courant.current, prix: String(data) });
      });
    return () => {
      annule = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorieId, valeurs.dateDebut, valeurs.dateFin]);

  const maj = (partiel: Partial<ValeursVehiculeDates>) => onChange({ ...valeurs, ...partiel });

  return (
    <div className="flex flex-col gap-3">
      <label className="block text-sm">
        <span className={libelleClass}>{t("champ_vehicule")}</span>
        <select
          id={`${idPrefixe}-vehicule`}
          value={valeurs.vehiculeId}
          onChange={(e) => maj({ vehiculeId: e.target.value })}
          className={champClass}
        >
          <option value="">{t("vehicule_a_preciser")}</option>
          {vehicules.map((v) => (
            <option key={v.id} value={v.id}>
              {v.libelle}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className={libelleClass}>{t("champ_date_debut")}</span>
          <input
            type="date"
            value={valeurs.dateDebut}
            onChange={(e) => maj({ dateDebut: e.target.value })}
            className={champClass}
          />
        </label>
        <label className="block text-sm">
          <span className={libelleClass}>{t("champ_date_fin")}</span>
          <input
            type="date"
            value={valeurs.dateFin}
            min={valeurs.dateDebut || undefined}
            onChange={(e) => maj({ dateFin: e.target.value })}
            className={champClass}
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className={libelleClass}>{t("champ_prix")}</span>
        <input
          type="number"
          min={0}
          step="0.01"
          value={valeurs.prix}
          onChange={(e) => maj({ prix: e.target.value, prixManuel: e.target.value !== "" })}
          className={champClass}
        />
        <span className="mt-1 block text-xs text-ink-soft">{t("champ_prix_aide")}</span>
      </label>
    </div>
  );
}

// Contrôle commun avant enregistrement : les deux dates ensemble, fin après début.
export function erreurDates(v: ValeursVehiculeDates): "dates_incompletes" | "dates_inversees" | null {
  if (!!v.dateDebut !== !!v.dateFin) return "dates_incompletes";
  if (v.dateDebut && v.dateFin && v.dateFin < v.dateDebut) return "dates_inversees";
  return null;
}
