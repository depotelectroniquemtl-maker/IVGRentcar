import { useTranslations } from "next-intl";
import type { CategorieAvecTarifs } from "@/lib/types";

function formatUsd(value: number | null) {
  if (value === null) return "—";
  return `US$ ${value.toFixed(0)}`;
}

/**
 * Grille tarifaire — reprend la structure de la fiche tarifaire papier du client
 * (1 rangée par véhicule, 3 colonnes de palier colorées), en composant réutilisable.
 */
export function PriceTable({ categories }: { categories: CategorieAvecTarifs[] }) {
  const t = useTranslations("flotte");

  return (
    <div className="overflow-x-auto rounded-lg border border-black/10">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="bg-ink text-white text-sm">
            <th className="px-4 py-3 font-semibold">{t("table.vehicle")}</th>
            <th className="px-4 py-3 font-semibold">{t("table.capacity")}</th>
            <th className="bg-green-600 px-4 py-3 font-semibold">
              {t("table.tier_1_3")}
            </th>
            <th className="bg-blue-600 px-4 py-3 font-semibold">
              {t("table.tier_4_plus")}
            </th>
            <th className="bg-purple-600 px-4 py-3 font-semibold">
              {t("table.tier_15_plus")}
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, i) => (
            <tr
              key={cat.id}
              className={i % 2 === 0 ? "bg-white" : "bg-black/[0.03]"}
            >
              <td className="px-4 py-3 font-semibold text-ink">{cat.nom}</td>
              <td className="px-4 py-3 text-ink-soft">
                {cat.capacite_personnes
                  ? t("capacity_persons", { count: cat.capacite_personnes })
                  : "—"}
              </td>
              <td className="px-4 py-3 font-medium text-green-700">
                {formatUsd(cat.tarifs["1_3_jours"])}
              </td>
              <td className="px-4 py-3 font-medium text-blue-700">
                {formatUsd(cat.tarifs["4_plus_jours"])}
              </td>
              <td className="px-4 py-3 font-medium text-purple-700">
                {formatUsd(cat.tarifs["15_plus_jours"])}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
