import type { Metadata } from "next";
import { routing, type AppLocale } from "@/i18n/routing";
import { BUSINESS_NAME, SITE_URL } from "@/lib/constants";

// Photo du hero (flotte sur la plage) réutilisée comme image sociale par défaut pour
// toutes les pages — évite de dépendre d'une image dédiée par page qui n'existe pas encore.
// Exportée : le layout racine (fallback statique, avant que la page ne résolve son propre
// generateMetadata) réutilise la même image plutôt que de la dupliquer.
export const OG_IMAGE = {
  url: `${SITE_URL}/hero/hero-tropical-fleet.webp`,
  width: 1774,
  height: 887,
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
