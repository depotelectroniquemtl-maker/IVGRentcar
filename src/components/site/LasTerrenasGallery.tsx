import Image from "next/image";
import { getTranslations } from "next-intl/server";

const PHOTOS = [
  "/gallery/las-terrenas-village-watermarked.webp",
  "/gallery/las-terrenas-ocean-watermarked.webp",
  "/gallery/las-terrenas-beach-watermarked.webp",
];

export async function LasTerrenasGallery() {
  const t = await getTranslations("lasTerrenas");
  const gallery = t.raw("gallery") as { caption: string }[];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-4 sm:grid-cols-3">
        {PHOTOS.map((src, i) => (
          <figure key={src} className="overflow-hidden rounded-lg bg-black/5">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={src}
                alt={gallery[i]?.caption ?? ""}
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="bg-white px-3 py-2 text-sm text-ink-soft">
              {gallery[i]?.caption}
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="text-right text-xs text-ink-soft/70">{t("photo_credit")}</p>
    </div>
  );
}
