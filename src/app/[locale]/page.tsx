import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ButtonLink, ExternalButtonLink } from "@/components/ui/Button";
import { FleetGrid } from "@/components/site/FleetGrid";
import { WhySection } from "@/components/site/WhySection";
import { LasTerrenasBanner } from "@/components/site/LasTerrenasBanner";
import { VideoSection } from "@/components/site/VideoSection";
import { whatsappUrl } from "@/lib/constants";
import { getCatalogue } from "@/lib/data/catalogue";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tPreview, tLasTerrenasTeaser, tVideo, tCta, catalogue] = await Promise.all([
    getTranslations("home.hero"),
    getTranslations("home.flotte_preview"),
    getTranslations("home.lasTerrenasTeaser"),
    getTranslations("home.video"),
    getTranslations("home.cta"),
    getCatalogue(),
  ]);

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <Image
          src="/hero/hero-tropical-fleet.webp"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <Container className="relative z-10 flex flex-col items-start gap-6 py-28 md:py-36">
          <h1 className="max-w-3xl text-5xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
            {t("title")}
          </h1>
          <p className="max-w-xl text-lg text-white/90 sm:text-xl">{t("subtitle")}</p>
          <div className="flex flex-wrap gap-3">
            <ExternalButtonLink href={whatsappUrl()} variant="whatsapp">
              {t("cta_whatsapp")}
            </ExternalButtonLink>
            <ButtonLink
              href="/flotte"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-ink"
            >
              {t("cta_flotte")}
            </ButtonLink>
          </div>
        </Container>
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
