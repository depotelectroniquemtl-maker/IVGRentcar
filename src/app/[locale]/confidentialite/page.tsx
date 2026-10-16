import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/site/LegalPage";
import type { LegalContent } from "@/lib/legal";
import type { AppLocale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.confidentialite" });
  return pageMetadata({
    locale: locale as AppLocale,
    path: "/confidentialite",
    title: t("title"),
    description: t("description"),
  });
}

export default async function ConfidentialitePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("legal");
  const content = t.raw("privacy") as LegalContent;

  return <LegalPage content={content} updated={t("updated")} />;
}
