import { defineRouting } from "next-intl/routing";

// Espagnol par défaut (marché dominicain), anglais et français pour la clientèle
// touristique de Las Terrenas.
export const routing = defineRouting({
  locales: ["es", "en", "fr"],
  defaultLocale: "es",
  // Les liens hreflang sont déjà déclarés dans le HTML de chaque page (pageMetadata) : l'en-tête
  // HTTP « Link » automatique de next-intl donnait en plus un x-default = « / » (redirection)
  // qui contredisait la balise HTML.
  alternateLinks: false,
});

export type AppLocale = (typeof routing.locales)[number];

// next-intl n'exporte `hasLocale` publiquement qu'à partir de la v4 ; réimplémenté ici
// pour rester sur la v3 (pin du package.json).
export function hasLocale<T extends string>(
  locales: readonly T[],
  input: unknown,
): input is T {
  return locales.includes(input as T);
}
