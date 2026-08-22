import { getTranslations } from "next-intl/server";

// Lecture façon Instagram : autoplay + muet + boucle + playsInline, sans contrôles ni
// son (les navigateurs bloquent l'autoplay avec son de toute façon).
export async function VideoSection() {
  const t = await getTranslations("home.video");

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <figure className="overflow-hidden rounded-lg bg-black">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/fleet/quad-road.JPG"
          className="aspect-[9/16] w-full object-cover sm:aspect-video"
        >
          <source src="/video/quad-tour.mp4" type="video/mp4" />
        </video>
        <figcaption className="bg-ink px-3 py-2 text-sm text-white/80">
          {t("quad_caption")}
        </figcaption>
      </figure>

      <figure className="overflow-hidden rounded-lg bg-black">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/video/ivj-logo.jpg"
          className="aspect-[9/16] w-full object-cover sm:aspect-video"
        >
          <source src="/video/ivj-shop.mp4" type="video/mp4" />
        </video>
        <figcaption className="bg-ink px-3 py-2 text-sm text-white/80">
          {t("shop_caption")}
        </figcaption>
      </figure>
    </div>
  );
}
