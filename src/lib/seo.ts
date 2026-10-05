import type { Metadata } from "next";
import { routing, type AppLocale } from "@/i18n/routing";
import { BUSINESS_NAME, SITE_URL } from "@/lib/constants";

// Recadrage 1200x630 (ratio 1.91:1 recommandé par Facebook) de la photo du hero, en JPEG :
// Facebook/WhatsApp gèrent mal le WebP pour og:image. Image sociale par défaut de toutes
// les pages. Exportée : le layout racine (fallback statique) réutilise la même image.
export const OG_IMAGE = {
  url: `${SITE_URL}/og/og-image.jpg`,
  width: 1200,
  height: 630,
  type: "image/jpeg",
};

const OG_LOCALE: Record<AppLocale, string> = {
  es: "es_DO",
  en: "en_US",
  fr: "fr_FR",
};

// `path` est le segment SANS préfixe de langue (ex: "", "/flotte") — chaque locale garde
// toujours son préfixe ("/es", "/en", "/fr"), y compris la langue par défaut, donc les URLs
// hreflang et canonical se construisent toutes de la même façon, sans cas particulier.
export function pageMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: AppLocale;
  path: string;
  title: string;
  description: string;
}): Metadata {
  const url = `${SITE_URL}/${locale}${path}`;
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`]),
  );

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { ...languages, "x-default": `${SITE_URL}/${routing.defaultLocale}${path}` },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: BUSINESS_NAME,
      locale: OG_LOCALE[locale],
      type: "website",
      images: [{ ...OG_IMAGE, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
