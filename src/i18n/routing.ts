import { defineRouting } from "next-intl/routing";

// Espagnol par défaut (marché dominicain), anglais et français pour la clientèle
// touristique de Las Terrenas.
export const routing = defineRouting({
  locales: ["es", "en", "fr"],
  defaultLocale: "es",
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
