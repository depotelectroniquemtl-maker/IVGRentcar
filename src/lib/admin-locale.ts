// Constantes partagées serveur/client pour la langue du panneau admin. Ce fichier ne doit
// importer que des éléments sûrs côté navigateur (pas de "next/headers" ici) — c'est ce qui
// permet à AdminLocaleSwitcher ("use client") de l'importer directement.
export const ADMIN_LOCALES = ["es", "en", "fr"] as const;
export type AdminLocale = (typeof ADMIN_LOCALES)[number];

export const ADMIN_LOCALE_COOKIE = "admin_locale";
export const ADMIN_LOCALE_DEFAULT: AdminLocale = "es";

export function isAdminLocale(value: string | undefined | null): value is AdminLocale {
  return !!value && (ADMIN_LOCALES as readonly string[]).includes(value);
}
