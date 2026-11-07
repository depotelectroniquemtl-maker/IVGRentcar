import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ExternalButtonLink } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { BUSINESS_ADDRESS, BUSINESS_EMAIL, PHONE_DISPLAY, whatsappUrl } from "@/lib/constants";
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

      <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-sm font-semibold text-ink-soft">{t("whatsapp")}</dt>
          <dd className="mt-1 text-ink">{PHONE_DISPLAY}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-soft">{t("email")}</dt>
          <dd className="mt-1 break-words text-ink">
            <a
              href={`mailto:${BUSINESS_EMAIL}`}
              data-wa-location="contact"
              className="underline underline-offset-2 hover:text-brand"
            >
              {BUSINESS_EMAIL}
            </a>
          </dd>
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
        <ExternalButtonLink href={whatsappUrl()} variant="whatsapp" data-wa-location="contact">
          <WhatsAppIcon className="h-5 w-5" />
          {t("whatsapp")}
        </ExternalButtonLink>
      </div>
    </Container>
  );
}
