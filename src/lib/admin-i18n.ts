import { cookies } from "next/headers";
import { createTranslator } from "next-intl";
import esMessages from "@/messages/es.json";
import enMessages from "@/messages/en.json";
import frMessages from "@/messages/fr.json";
import {
  ADMIN_LOCALE_COOKIE,
  ADMIN_LOCALE_DEFAULT,
  isAdminLocale,
  type AdminLocale,
} from "@/lib/admin-locale";

// Le panneau admin est en dehors du routage par URL de next-intl (voir middleware.ts —
// /admin est exclu du intlMiddleware) : sa langue est résolue via un cookie séparé
// (admin_locale), indépendant du cookie NEXT_LOCALE de la vitrine publique. Le personnel
// ne voit jamais la vitrine dans une autre langue que celle qu'il choisit lui-même, donc
// on ne veut surtout pas que changer de langue sur le site public change aussi le panneau,
// ni l'inverse — d'où deux mécanismes de résolution complètement indépendants.
const MESSAGES: Record<AdminLocale, typeof esMessages> = {
  es: esMessages,
  en: enMessages,
  fr: frMessages,
};

export async function getAdminLocale(): Promise<AdminLocale> {
  const store = cookies();
  const value = store.get(ADMIN_LOCALE_COOKIE)?.value;
  return isAdminLocale(value) ? value : ADMIN_LOCALE_DEFAULT;
}

export async function getAdminMessages(locale?: AdminLocale) {
  return MESSAGES[locale ?? (await getAdminLocale())];
}

export async function getAdminTranslator<NestedKey extends string = never>(
  namespace?: NestedKey,
) {
  const locale = await getAdminLocale();
  return createTranslator({ locale, messages: MESSAGES[locale], namespace });
}
