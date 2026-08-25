import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { SealBadge } from "@/components/site/SealBadge";
import { splitLines } from "@/lib/splitLines";

// Reproduit la mise en page éditoriale de l'ancien site (classe .why) : photo pleine
// hauteur d'un côté avec badge qui déborde, gros titre + liste numérotée de l'autre —
// pas une grille de cartes égales.
export async function WhySection() {
  const t = await getTranslations("home.why");

  return (
    <section id="why" className="bg-black/[0.03]">
      <div className="grid md:grid-cols-2 md:min-h-[650px]">
        <div className="relative min-h-[360px] md:min-h-0">
          <Image
            src="/fleet/quad-rider.JPG"
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
          <SealBadge className="absolute right-6 -bottom-10 md:-right-12 md:bottom-auto md:top-16" />
        </div>

        <div className="flex flex-col justify-center px-6 py-16 sm:px-10 md:px-16 md:py-24 lg:pl-24">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-brand">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-4xl font-extrabold leading-[0.98] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            {splitLines(t("title"))}
          </h2>

          <div className="mt-10 flex flex-col">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="grid grid-cols-[42px_1fr] gap-4 border-t border-black/10 py-6"
              >
                <span className="text-sm font-black text-brand">0{i}</span>
                <div>
                  <p className="font-bold text-ink">
                    {t(`item${i}_title` as "item1_title")}
                  </p>
                  <p className="mt-1.5 leading-relaxed text-ink-soft">
                    {t(`item${i}_text` as "item1_text")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
