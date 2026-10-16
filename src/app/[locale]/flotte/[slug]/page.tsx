import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ButtonLink, ExternalButtonLink } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { Link } from "@/i18n/navigation";
import { Breadcrumb } from "@/components/site/Breadcrumb";
import { BreadcrumbJsonLd, ProductJsonLd } from "@/components/site/FleetPageJsonLd";
import { FaqJsonLd } from "@/components/site/FaqJsonLd";
import { FleetPageCard } from "@/components/site/FleetPageCard";
import { TierPrices } from "@/components/site/TierPrices";
import { SITE_URL, whatsappUrl } from "@/lib/constants";
import { getCatalogue } from "@/lib/data/catalogue";
import {
  FLEET_PAGES,
  FLEET_PAGE_SLUGS,
  categoryForSlug,
  isFleetPageSlug,
} from "@/lib/fleet-pages";
import { routing, type AppLocale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";

// Seuls les slugs connus existent ; tout autre chemin répond 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    FLEET_PAGE_SLUGS.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isFleetPageSlug(slug)) return {};
  const t = await getTranslations({ locale, namespace: "fleetPages" });
  const photo = FLEET_PAGES[slug].photos[0];
  const catalogue = await getCatalogue();
  const metadata = pageMetadata({
    locale: locale as AppLocale,
    path: `/flotte/${slug}`,
    title: t(`pages.${slug}.seo_title`),
    description: t(`pages.${slug}.seo_description`),
    image: { url: `${SITE_URL}${photo.src}`, width: photo.width, height: photo.height },
  });
  // Véhicule retiré ou inactif : la page répond 404, et par prudence n'est jamais indexable.
  return categoryForSlug(slug, catalogue) ? metadata : { ...metadata, robots: { index: false } };
}

export default async function FleetVehiclePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  if (!isFleetPageSlug(slug)) notFound();

  const [t, tFlotte, catalogue] = await Promise.all([
    getTranslations("fleetPages"),
    getTranslations("flotte"),
    getCatalogue(),
  ]);

  const categorie = categoryForSlug(slug, catalogue);
  if (!categorie) notFound();

  const page = FLEET_PAGES[slug];
  const count = categorie.capacite_personnes;
  const photo = page.photos[0];
  const extraPhotos = page.photos.slice(1);
  const hubLabel = t(page.hub === "quads" ? "ui.hub_quads" : "ui.hub_voitures");
  const hubPath = `/flotte/${page.hub}`;
  const path = `/flotte/${slug}`;

  const intro = t.raw(`pages.${slug}.intro`) as string[];
  const specs = t.raw(`pages.${slug}.specs`) as string[];
  const alts = t.raw(`pages.${slug}.alts`) as string[];
  // Les réponses mentionnant la capacité n'existent que si la base la fournit.
  const faq = (t.raw(`pages.${slug}.faq`) as { question: string; answer: string }[])
    .filter((item) => count !== null || !item.answer.includes("{count}"))
    .map((item) => ({
      question: item.question,
      answer: item.answer.replace("{count}", String(count)),
    }));

  const tiers = [
    { key: "1_3_jours", label: tFlotte("table.tier_1_3") },
    { key: "4_plus_jours", label: tFlotte("table.tier_4_plus") },
    { key: "15_plus_jours", label: tFlotte("table.tier_15_plus") },
  ] as const;
  const offers = tiers.flatMap((tier) => {
    const price = categorie.tarifs[tier.key];
    return price !== null ? [{ name: tier.label, price }] : [];
  });

  const related = page.related.flatMap((relatedSlug) => {
    const cat = categoryForSlug(relatedSlug, catalogue);
    return cat ? [{ slug: relatedSlug, categorie: cat }] : [];
  });

  const crumbs = [
    { name: t("ui.home"), path: "" },
    { name: t("ui.fleet"), path: "/flotte" },
    { name: hubLabel, path: hubPath },
    { name: page.label, path },
  ];

  const portrait = photo.height > photo.width;

  return (
    <Container className="flex flex-col gap-10 py-10 sm:py-14">
      <BreadcrumbJsonLd locale={locale} crumbs={crumbs} />
      <ProductJsonLd
        locale={locale}
        path={path}
        name={page.label}
        description={t(`pages.${slug}.seo_description`)}
        images={page.photos.map((p) => p.src)}
        offers={offers}
      />
      <FaqJsonLd items={faq} />

      <Breadcrumb
        crumbs={[
          { name: crumbs[0].name, href: "/" },
          { name: crumbs[1].name, href: "/flotte" },
          { name: crumbs[2].name, href: hubPath },
          { name: crumbs[3].name },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-12">
        <div
          className="relative mx-auto w-full overflow-hidden rounded-lg bg-black/5"
          style={{
            aspectRatio: `${photo.width} / ${photo.height}`,
            maxWidth: portrait ? "420px" : "100%",
          }}
        >
          <Image
            src={photo.src}
            alt={alts[0]}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-brand">
              {t(`pages.${slug}.eyebrow`)}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
              {t(`pages.${slug}.h1`)}
            </h1>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">
              {t("ui.specs_title")}
            </h2>
            <ul className="mt-2 flex flex-col gap-1.5 text-ink">
              {count !== null && (
                <li className="flex gap-2">
                  <span aria-hidden="true" className="text-brand">
                    ✓
                  </span>
                  {t("ui.capacity", { count })}
                </li>
              )}
              {specs.map((spec) => (
                <li key={spec} className="flex gap-2">
                  <span aria-hidden="true" className="text-brand">
                    ✓
                  </span>
                  {spec}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">
              {t("ui.prices_title")}
            </h2>
            <div className="mt-2">
              <TierPrices tarifs={categorie.tarifs} />
            </div>
            <p className="mt-2 text-xs text-ink-soft">{t("ui.price_note")}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/reservar" className="min-h-[44px] flex-1">
              {t("ui.reserve")} →
            </ButtonLink>
            <ExternalButtonLink
              href={whatsappUrl(t("ui.whatsapp_message", { vehicule: page.label }))}
              variant="whatsapp"
              className="min-h-[44px] flex-1"
              data-wa-location="vehicule"
            >
              <WhatsAppIcon className="h-5 w-5" />
              {t("ui.whatsapp")}
            </ExternalButtonLink>
          </div>
        </div>
      </div>

      <div className="flex max-w-3xl flex-col gap-4 text-lg leading-relaxed text-ink-soft">
        {intro.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      {extraPhotos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {extraPhotos.map((p, i) => (
            <div
              key={p.src}
              className="relative overflow-hidden rounded-lg bg-black/5"
              style={{ aspectRatio: `${p.width} / ${p.height}` }}
            >
              <Image
                src={p.src}
                alt={alts[i + 1] ?? alts[0]}
                fill
                loading="lazy"
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <section className="flex max-w-3xl flex-col gap-3">
        <h2 className="text-2xl font-extrabold tracking-tight text-ink">{t("ui.faq_title")}</h2>
        <div className="flex flex-col divide-y divide-black/10 rounded-lg bg-white shadow-sm">
          {faq.map((item) => (
            <details key={item.question} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
                {item.question}
                <span className="shrink-0 text-xl text-brand transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-2 text-ink-soft">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-extrabold tracking-tight text-ink">
            {t("ui.others_title")}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <FleetPageCard key={r.slug} slug={r.slug} categorie={r.categorie} />
            ))}
          </div>
        </section>
      )}

      <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-brand">
        <Link href={hubPath} className="hover:underline">
          {t("ui.from_hub", { hub: hubLabel })} →
        </Link>
        <Link href="/conditions" className="hover:underline">
          {t("ui.see_conditions")} →
        </Link>
        <Link href="/faq" className="hover:underline">
          {t("ui.see_faq")} →
        </Link>
        <Link href="/flotte" className="hover:underline">
          {t("ui.see_fleet")} →
        </Link>
      </nav>
    </Container>
  );
}
