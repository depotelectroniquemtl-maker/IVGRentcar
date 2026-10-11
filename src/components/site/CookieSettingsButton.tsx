"use client";

import { useTranslations } from "next-intl";
import { openCookieSettings } from "@/lib/analytics";

// Lien « Gérer les cookies » du pied de page : rouvre le bandeau de consentement.
export function CookieSettingsButton({ className }: { className?: string }) {
  const t = useTranslations("cookies");

  return (
    <button type="button" onClick={openCookieSettings} className={className}>
      {t("manage")}
    </button>
  );
}
