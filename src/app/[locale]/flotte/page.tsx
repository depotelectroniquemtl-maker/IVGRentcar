import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ExternalButtonLink } from "@/components/ui/Button";
import { FleetGrid } from "@/components/site/FleetGrid";
import { PriceTable } from "@/components/site/PriceTable";
import { whatsappUrl } from "@/lib/constants";
import { getCatalogue } from "@/lib/data/catalogue";
import type { AppLocale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.flotte" });
  return pageMetadata({
    locale: locale as AppLocale,
    path: "/flotte",
    title: t("title"),
    description: t("description"),
  });
}

export default async function FlottePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, catalogue] = await Promise.all([
    getTranslations("flotte"),
    getCatalogue(),
  ]);

  return (
    <Container className="flex flex-col gap-6 py-16">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-lg text-ink-soft">{t("subtitle")}</p>
      </div>

      <FleetGrid categories={catalogue} />

      <PriceTable categories={catalogue} />

      <p className="text-sm text-ink-soft">{t("payment_note")}</p>

      <div>
        <ExternalButtonLink href={whatsappUrl()} variant="whatsapp">
          {t("reserve")}
        </ExternalButtonLink>
      </div>
    </Container>
  );
}
