import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/constants";

// Segment SANS préfixe de langue — chaque page publique du site, préfixée ensuite par
// chacune des 3 locales (y compris "es", la langue par défaut, qui garde son préfixe
// puisque le routing next-intl est en localePrefix "always").
const PATHS = ["", "/flotte", "/las-terrenas", "/faq", "/contact", "/reservar"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`]),
        ),
      },
    })),
  );
}
