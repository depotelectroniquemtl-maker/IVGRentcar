import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { FleetGrid } from "@/components/site/FleetGrid";
import { WhySection } from "@/components/site/WhySection";
import { LasTerrenasBanner } from "@/components/site/LasTerrenasBanner";
import { VideoSection } from "@/components/site/VideoSection";
import { getCatalogue } from "@/lib/data/catalogue";
import { getCurrentTemperature } from "@/lib/data/weather";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tPreview, tLasTerrenasTeaser, tVideo, tCta, catalogue, temperature] =
    await Promise.all([
      getTranslations("home.hero"),
      getTranslations("home.flotte_preview"),
      getTranslations("home.lasTerrenasTeaser"),
      getTranslations("home.video"),
      getTranslations("home.cta"),
      getCatalogue(),
      getCurrentTemperature(),
    ]);

  return (
    <>
      <section className="relative min-h-[600px] overflow-hidden bg-ink text-white sm:min-h-[650px] lg:min-h-[720px]">
        <Image
          src="/hero/hero-tropical-fleet.webp"
          alt=""
          fill
          priority
          className="object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/5" />
        {/* Pas de <Container> ici volontairement : l'ancien site pousse le texte depuis le
            bord de l'écran (padding en vw, pas de colonne centrée), sinon le texte recule
            vers le centre sur les écrans larges au lieu de rester à gauche dans la zone
            sombre du dégradé. */}
        <div className="absolute inset-0 z-10 flex flex-col items-start justify-center gap-4 px-6 py-16 sm:px-10 md:px-[6vw]">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/80">
            {t("eyebrow")}
          </p>
          <h1 className="max-w-3xl text-5xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
            {t("title")}
          </h1>
          <p className="max-w-xl text-lg text-white/90 sm:text-xl">{t("subtitle")}</p>
          <div className="mt-2 flex flex-wrap items-center gap-6">
            <ButtonLink href="/reservar">{t("cta_primary")} →</ButtonLink>
            <Link
              href="/flotte"
              className="border-b border-white/50 pb-1 font-bold text-white transition-colors hover:border-white"
            >
              {t("cta_flotte")} ↓
            </Link>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-white/80">
            <span className="text-green-400">●</span> {t("reply")}
          </p>
        </div>
        {temperature !== null && (
          <div className="absolute bottom-6 right-6 z-10 hidden w-[150px] border border-white/40 bg-white/10 p-5 text-white backdrop-blur-md md:block">
            <span className="font-serif text-4xl">{temperature}°</span>
            <p className="mt-2 text-[11px] leading-relaxed tracking-wider">
              LAS TERRENAS
              <br />
              SAMANÁ · RD
            </p>
          </div>
        )}
      </section>

      <section className="py-16 sm:py-24">
        <Container className="flex flex-col gap-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              {tPreview("title")}
            </h2>
            <ButtonLink href="/flotte" variant="outline">
              {tPreview("see_all")}
            </ButtonLink>
          </div>
          <FleetGrid categories={catalogue} />
        </Container>
      </section>

      <WhySection />

      <LasTerrenasBanner />
      <Container className="flex justify-center py-8">
        <ButtonLink href="/las-terrenas">{tLasTerrenasTeaser("discover_more")}</ButtonLink>
      </Container>

      <section className="bg-black/[0.03] py-16 sm:py-24">
        <Container className="flex flex-col gap-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {tVideo("title")}
          </h2>
          <VideoSection />
        </Container>
      </section>

      <section className="bg-brand py-20 text-white sm:py-28">
        <Container className="flex flex-col items-center gap-5 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{tCta("title")}</h2>
          <p className="max-w-xl text-lg text-white/90">{tCta("subtitle")}</p>
          <ButtonLink
            href="/reservar"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-brand"
          >
            {tCta("button")}
          </ButtonLink>
        </Container>
      </section>
    </>
  );
}
