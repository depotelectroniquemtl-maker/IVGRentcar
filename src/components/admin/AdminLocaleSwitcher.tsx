"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ADMIN_LOCALES,
  ADMIN_LOCALE_COOKIE,
  ADMIN_LOCALE_DEFAULT,
  isAdminLocale,
  type AdminLocale,
} from "@/lib/admin-locale";

const LABELS: Record<AdminLocale, string> = { es: "ES", en: "EN", fr: "FR" };

// Langue du panneau admin — indépendante de la langue de la vitrine publique (cookie
// séparé, admin_locale). Le personnel n'y touche jamais et reste en espagnol par défaut ;
// ce sélecteur est surtout là pour que le développeur/chef de projet puisse basculer
// le panneau en français sans affecter ce que voit le personnel.
export function AdminLocaleSwitcher() {
  const router = useRouter();
  const [current, setCurrent] = useState<AdminLocale>(ADMIN_LOCALE_DEFAULT);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )admin_locale=([^;]+)/);
    const value = match?.[1];
    if (isAdminLocale(value)) setCurrent(value);
  }, []);

  function handleSelect(locale: AdminLocale) {
    document.cookie = `${ADMIN_LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
    setCurrent(locale);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 text-xs font-medium">
      {ADMIN_LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => handleSelect(locale)}
          className={`rounded px-2 py-1 transition-colors ${
            locale === current ? "bg-brand text-white" : "text-white/60 hover:bg-white/10"
          }`}
          aria-current={locale === current}
        >
          {LABELS[locale]}
        </button>
      ))}
    </div>
  );
}
