"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FLEET_IMAGES } from "@/lib/fleet-images";
import type { CategorieAvecTarifs } from "@/lib/types";

function formatUsd(value: number | null) {
  if (value === null) return null;
  return value.toFixed(0);
}

// Reprend la structure de carte véhicule de l'ancien site (classe .vehicle) : badge
// numéroté sur la photo, étiquette de catégorie en majuscules accent rouge, titre
// accrocheur, description, puces de caractéristiques, ligne d'action à deux éléments.
// Photos réelles quand disponibles (mini-carrousel auto si plusieurs angles, ex: Kia
// Seltos) ; visuel générique sinon (ex: Pasola 175cc, pas de photo fournie).
export function FleetCard({
  categorie,
  index,
}: {
  categorie: CategorieAvecTarifs;
  index: number;
}) {
  const t = useTranslations("flotte");
  const images = FLEET_IMAGES[categorie.nom];
  const vehicleCopy = t.raw("vehicle_copy") as Record<
    string,
    { title: string; description: string }
  >;
  const copy = vehicleCopy[categorie.nom];
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length < 2) return;
    const id = setInterval(
      () => setCarouselIndex((i) => (i + 1) % images.length),
      3000,
    );
    return () => clearInterval(id);
  }, [images]);

  const isCar = categorie.type === "voiture";

  const PALIERS = [
    { key: "1_3_jours", labelKey: "tier_1_3" },
    { key: "4_plus_jours", labelKey: "tier_4_plus" },
    { key: "15_plus_jours", labelKey: "tier_15_plus" },
  ] as const;

  return (
    <div className="overflow-hidden rounded-lg border border-black/5 bg-white shadow-sm">
      <div className="relative aspect-[6/5] w-full bg-black/5">
        {images ? (
          images.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt={categorie.nom}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className={`object-cover transition-opacity duration-700 ${
                i === carouselIndex ? "opacity-100" : "opacity-0"
              }`}
            />
          ))
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-brand-light text-brand">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-10 w-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 17h14M6 17l1.5-5h9L18 17M8 9h8l1 3H7l1-3ZM7 20a1 1 0 100-2 1 1 0 000 2ZM17 20a1 1 0 100-2 1 1 0 000 2Z"
              />
            </svg>
            <span className="px-4 text-center text-xs font-medium">{t("no_photo")}</span>
          </div>
        )}
        <span className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-xs font-black text-white backdrop-blur-sm">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="flex flex-col gap-2 p-5">
        <p className="text-[11px] font-black uppercase tracking-wider text-brand">
          {categorie.nom}
        </p>
        {copy && <h3 className="text-xl font-bold leading-tight text-ink">{copy.title}</h3>}
        {copy && <p className="text-sm leading-relaxed text-ink-soft">{copy.description}</p>}

        <div className="mt-1 flex flex-wrap gap-2">
          {categorie.capacite_personnes && (
            <span className="rounded bg-black/[0.04] px-2 py-1 text-[11px] text-ink-soft">
              {t("capacity_persons", { count: categorie.capacite_personnes })}
            </span>
          )}
          <span className="rounded bg-black/[0.04] px-2 py-1 text-[11px] text-ink-soft">
            {isCar ? t("amenity_ac") : t("amenity_on_request")}
          </span>
        </div>

        <div className="mt-3 border-t border-black/10 pt-3">
          <div className="grid grid-cols-3 gap-1.5">
            {PALIERS.map(({ key, labelKey }, i) => {
              const prix = formatUsd(categorie.tarifs[key]);
              return (
                <div
                  key={key}
                  className={`flex flex-col items-center rounded-md px-1 py-2 text-center ${
                    i === 0 ? "bg-brand text-white" : "bg-black/[0.04] text-ink"
                  }`}
                >
                  <span
                    className={`text-[9px] font-semibold uppercase leading-tight tracking-wide ${
                      i === 0 ? "text-white/85" : "text-ink-soft"
                    }`}
                  >
                    {t(`table.${labelKey}`)}
                  </span>
                  <span className="mt-0.5 text-sm font-extrabold tabular-nums">
                    {prix ? `US$${prix}` : "—"}
                  </span>
                </div>
              );
            })}
          </div>
          {isCar && (
            <p className="mt-2 text-center text-[11px] font-medium text-ink-soft">
              {t("insurance_note")}
            </p>
          )}

          <Link
            href="/reservar"
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md bg-ink px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-brand"
          >
            {t("card_cta")} →
          </Link>
        </div>
      </div>
    </div>
  );
}
