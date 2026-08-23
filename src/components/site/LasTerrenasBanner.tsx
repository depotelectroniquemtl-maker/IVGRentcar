import Image from "next/image";
import { getTranslations } from "next-intl/server";

// Reproduit le bandeau immersif de l'ancien site (classe .discover, dernière révision de
// globals.css) : photo pleine largeur en fond + superposition sombre en dégradé, texte
// blanc à gauche, et une des photos de la galerie sert de fond tandis que les deux autres
// apparaissent en médaillons qui débordent en bas du bandeau (transform: translateY négatif
// sur la photo principale + bordure blanche + ombre portée).
export async function LasTerrenasBanner() {
  const t = await getTranslations("lasTerrenas");
  const gallery = t.raw("gallery") as { caption: string }[];
  const places = t.raw("places") as string[];

  return (
    <section className="relative isolate overflow-hidden">
      <Image
        src="/gallery/las-terrenas-ocean-watermarked.webp"
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/60 to-black/10" />

      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-[0.82fr_1.18fr] md:py-28 lg:px-8">
        <div className="relative z-10 flex flex-col justify-center text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.5)]">
          <p className="mb-6 text-xs font-black uppercase tracking-[0.2em]">{t("kicker")}</p>
          <h2 className="text-4xl font-extrabold leading-[0.98] tracking-tight sm:text-5xl lg:text-6xl">
            {t("title")
              .split("\n")
              .map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/90">{t("intro")}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {places.map((place) => (
              <span
                key={place}
                className="rounded-full border border-white/50 bg-[#001c2866] px-3.5 py-2 text-xs text-white backdrop-blur-sm"
              >
                ↗ {place}
              </span>
            ))}
          </div>
          <p className="mt-8 text-xs text-white/70">{t("photo_credit")}</p>
        </div>

        <div className="relative z-10 grid grid-cols-[1.08fr_0.92fr] items-end gap-4 md:pt-[160px]">
          <figure className="relative overflow-hidden rounded-lg border-4 border-white shadow-2xl min-h-[280px] sm:min-h-[330px]">
            <Image
              src="/gallery/las-terrenas-village-watermarked.webp"
              alt={gallery[0]?.caption ?? ""}
              fill
              sizes="(min-width: 768px) 30vw, 55vw"
              className="object-cover"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-4 text-sm font-bold text-white">
              {gallery[0]?.caption}
            </figcaption>
          </figure>
          <figure className="relative min-h-[220px] overflow-hidden rounded-lg border-4 border-white shadow-2xl sm:min-h-[265px]">
            <Image
              src="/gallery/las-terrenas-beach-watermarked.webp"
              alt={gallery[2]?.caption ?? ""}
              fill
              sizes="(min-width: 768px) 25vw, 45vw"
              className="object-cover"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-4 text-sm font-bold text-white">
              {gallery[2]?.caption}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
