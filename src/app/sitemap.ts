import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/constants";
import { getCatalogue } from "@/lib/data/catalogue";
import { FLEET_HUBS, FLEET_PAGE_SLUGS, categoryForSlug } from "@/lib/fleet-pages";

// Segment SANS préfixe de langue — chaque page publique du site, préfixée ensuite par
// chacune des 3 locales (y compris "es", la langue par défaut, qui garde son préfixe
// puisque le routing next-intl est en localePrefix "always").
const STATIC_PATHS = [
  "",
  "/flotte",
  ...FLEET_HUBS.map((hub) => `/flotte/${hub}`),
  "/las-terrenas",
  "/faq",
  "/contact",
  "/reservar",
  "/conditions",
  "/mentions-legales",
  "/confidentialite",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Pages véhicule : seulement celles dont la catégorie est active (les autres répondent 404).
  const catalogue = await getCatalogue();
  const vehiclePaths = FLEET_PAGE_SLUGS.filter((slug) => categoryForSlug(slug, catalogue)).map(
    (slug) => `/flotte/${slug}`,
  );

  return [...STATIC_PATHS, ...vehiclePaths].flatMap((path) =>
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
