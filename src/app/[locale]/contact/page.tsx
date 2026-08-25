import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ExternalButtonLink } from "@/components/ui/Button";
import { BUSINESS_ADDRESS, WHATSAPP_NUMBER, whatsappUrl } from "@/lib/constants";
import type { AppLocale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.contact" });
  return pageMetadata({
    locale: locale as AppLocale,
    path: "/contact",
    title: t("title"),
    description: t("description"),
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("contact");

  return (
    <Container className="flex flex-col gap-8 py-16">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-lg text-ink-soft">{t("subtitle")}</p>
      </div>

      <dl className="grid gap-6 sm:grid-cols-3">
        <div>
          <dt className="text-sm font-semibold text-ink-soft">{t("whatsapp")}</dt>
          <dd className="mt-1 text-ink">+{WHATSAPP_NUMBER}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-soft">{t("address")}</dt>
          <dd className="mt-1 text-ink">{BUSINESS_ADDRESS}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-soft">{t("hours")}</dt>
          <dd className="mt-1 text-ink">{t("hours_value")}</dd>
        </div>
      </dl>

      <div>
        <ExternalButtonLink href={whatsappUrl()} variant="whatsapp">
          {t("whatsapp")}
        </ExternalButtonLink>
      </div>
    </Container>
  );
}
