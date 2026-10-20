import { getTranslations } from "next-intl/server";
import { LazyVideo } from "@/components/site/LazyVideo";

// Deux vidéos d'ambiance muettes en boucle (façon Instagram). Elles ne sont plus chargées avec
// la page : voir LazyVideo (aperçu via next/image, lecture à l'approche de l'écran ou au clic,
// jamais en lecture automatique avec « moins d'animation » ou « économie de données »).
export async function VideoSection() {
  const t = await getTranslations("home.video");

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <figure className="overflow-hidden rounded-lg bg-black">
        <LazyVideo
          src="/video/quad-tour.mp4"
          poster="/fleet/quad-road.JPG"
          posterAlt=""
          playLabel={t("play")}
        />
        <figcaption className="bg-ink px-3 py-2 text-sm text-white/80">
          {t("quad_caption")}
        </figcaption>
      </figure>

      <figure className="overflow-hidden rounded-lg bg-black">
        <LazyVideo
          src="/video/ivj-shop.mp4"
          poster="/video/ivj-logo.jpg"
          posterAlt=""
          playLabel={t("play")}
        />
        <figcaption className="bg-ink px-3 py-2 text-sm text-white/80">
          {t("shop_caption")}
        </figcaption>
      </figure>
    </div>
  );
}
