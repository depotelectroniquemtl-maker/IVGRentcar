"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { FLEET_IMAGES } from "@/lib/fleet-images";
import type { CategorieAvecTarifs } from "@/lib/types";

function formatUsd(value: number | null) {
  if (value === null) return null;
  return value.toFixed(0);
}

// Photos réelles quand disponibles (mini-carrousel auto si plusieurs angles, ex: Kia
// Seltos) ; visuel générique sinon (ex: Pasola 175cc, pas de photo fournie).
export function FleetCard({ categorie }: { categorie: CategorieAvecTarifs }) {
  const t = useTranslations("flotte");
  const images = FLEET_IMAGES[categorie.nom];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), 3000);
    return () => clearInterval(id);
  }, [images]);

  const startingPrice = formatUsd(categorie.tarifs["1_3_jours"]);

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
      <div className="relative aspect-[4/3] w-full bg-black/5">
        {images ? (
          images.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt={categorie.nom}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className={`object-cover transition-opacity duration-700 ${
                i === index ? "opacity-100" : "opacity-0"
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
      </div>

      <div className="flex flex-col gap-1 p-4">
        <h3 className="font-semibold text-ink">{categorie.nom}</h3>
        {categorie.capacite_personnes && (
          <p className="text-sm text-ink-soft">
            {t("capacity_persons", { count: categorie.capacite_personnes })}
          </p>
        )}
        {startingPrice && (
          <p className="mt-2 text-sm">
            <span className="text-ink-soft">{t("from")} </span>
            <span className="font-bold text-brand">US$ {startingPrice}</span>
            <span className="text-ink-soft">{t("per_day")}</span>
          </p>
        )}
      </div>
    </div>
  );
}
