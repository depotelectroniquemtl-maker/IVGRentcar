import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { Breadcrumb } from "@/components/site/Breadcrumb";
import { BreadcrumbJsonLd } from "@/components/site/FleetPageJsonLd";
import { FleetPageCard } from "@/components/site/FleetPageCard";
import { getCatalogue } from "@/lib/data/catalogue";
import { categoryForSlug, slugsForHub } from "@/lib/fleet-pages";
import type { AppLocale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";

const HUB = "quads";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "fleetPages.hubs.quads" });
  return pageMetadata({
    locale: locale as AppLocale,
    path: `/flotte/${HUB}`,
    title: t("seo_title"),
    description: t("seo_description"),
  });
}

export default async function FleetHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tUi, catalogue] = await Promise.all([
    getTranslations("fleetPages.hubs.quads"),
    getTranslations("fleetPages.ui"),
    getCatalogue(),
  ]);

  const intro = t.raw("intro") as string[];
  const cards = slugsForHub(HUB).flatMap((slug) => {
    const categorie = categoryForSlug(slug, catalogue);
    return categorie ? [{ slug, categorie }] : [];
  });
  const hubLabel = tUi("hub_quads");

  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-14">
      <BreadcrumbJsonLd
        locale={locale}
        crumbs={[
          { name: tUi("home"), path: "" },
          { name: tUi("fleet"), path: "/flotte" },
          { name: hubLabel, path: `/flotte/${HUB}` },
        ]}
      />
      <Breadcrumb
        crumbs={[
          { name: tUi("home"), href: "/" },
          { name: tUi("fleet"), href: "/flotte" },
          { name: hubLabel },
        ]}
      />

      <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">{t("h1")}</h1>

      <div className="flex max-w-3xl flex-col gap-4 text-lg leading-relaxed text-ink-soft">
        {intro.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <FleetPageCard key={c.slug} slug={c.slug} categorie={c.categorie} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <ButtonLink href="/reservar">{tUi("reserve")} →</ButtonLink>
        <Link href="/flotte/voitures" className="text-sm font-semibold text-brand hover:underline">
          {t("cars_link")} →
        </Link>
        <Link href="/flotte" className="text-sm font-semibold text-brand hover:underline">
          {tUi("see_fleet")} →
        </Link>
        <Link href="/conditions" className="text-sm font-semibold text-brand hover:underline">
          {tUi("see_conditions")} →
        </Link>
      </div>
    </Container>
  );
}
