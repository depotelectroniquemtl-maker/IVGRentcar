import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ExternalButtonLink } from "@/components/ui/Button";
import { BUSINESS_ADDRESS, WHATSAPP_NUMBER, whatsappUrl } from "@/lib/constants";

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
        <h1 className="text-3xl font-bold text-ink">{t("title")}</h1>
        <p className="mt-2 text-ink-soft">{t("subtitle")}</p>
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
