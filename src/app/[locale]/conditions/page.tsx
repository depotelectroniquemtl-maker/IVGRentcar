import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/site/LegalPage";
import { ExternalButtonLink } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { whatsappUrl } from "@/lib/constants";
import type { LegalContent } from "@/lib/legal";
import type { AppLocale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.conditions" });
  return pageMetadata({
    locale: locale as AppLocale,
    path: "/conditions",
    title: t("title"),
    description: t("description"),
  });
}

export default async function ConditionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("legal");
  const content = t.raw("conditions") as LegalContent;

  return (
    <LegalPage content={content} updated={t("updated")}>
      {content.cta && (
        <div className="flex flex-col items-start gap-3">
          <p className="text-ink-soft">{content.cta}</p>
          <ExternalButtonLink
            href={whatsappUrl()}
            variant="whatsapp"
            data-wa-location="conditions"
          >
            <WhatsAppIcon className="h-5 w-5" />
            WhatsApp
          </ExternalButtonLink>
        </div>
      )}
    </LegalPage>
  );
}
