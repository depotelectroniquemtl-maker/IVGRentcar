import { useTranslations } from "next-intl";
import type { CategorieAvecTarifs } from "@/lib/types";

const PALIERS = [
  { key: "1_3_jours", labelKey: "tier_1_3" },
  { key: "4_plus_jours", labelKey: "tier_4_plus" },
  { key: "15_plus_jours", labelKey: "tier_15_plus" },
] as const;

// Les trois paliers de prix d'une catégorie, lus dans la base (jamais écrits en dur).
export function TierPrices({ tarifs }: { tarifs: CategorieAvecTarifs["tarifs"] }) {
  const t = useTranslations("flotte");

  return (
    <div className="grid grid-cols-3 gap-2">
      {PALIERS.map(({ key, labelKey }, i) => {
        const prix = tarifs[key];
        return (
          <div
            key={key}
            className={`flex flex-col items-center rounded-md px-1 py-3 text-center ${
              i === 0 ? "bg-brand text-white" : "bg-black/[0.04] text-ink"
            }`}
          >
            <span
              className={`text-[11px] font-semibold uppercase leading-tight tracking-wide ${
                i === 0 ? "text-white" : "text-ink-soft"
              }`}
            >
              {t(`table.${labelKey}`)}
            </span>
            <span className="mt-1 text-lg font-extrabold tabular-nums">
              {prix !== null ? `US$${prix.toFixed(0)}` : "—"}
            </span>
            {/* Chaque palier est un tarif PAR JOUR (prix total = tarif du palier × nombre de jours). */}
            {prix !== null && (
              <span className={`text-[11px] leading-tight ${i === 0 ? "text-white" : "text-ink-soft"}`}>
                {t("per_day")}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
