"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { whatsappUrl } from "@/lib/constants";

// Bouton WhatsApp rond fixe en bas à droite, mobile seulement (< 768 px). Monté dans le layout
// de la vitrine (jamais dans /admin), masqué sur /reservar et tant que le bandeau de
// consentement est ouvert (AnalyticsConsent pose data-cookie-banner sur <html>). Le clic est
// compté par l'écouteur global de AnalyticsConsent (whatsapp_click, button_location =
// floating_button). Pas d'animation. Fond vert foncé : l'icône blanche y dépasse 3:1.
export function FloatingWhatsApp() {
  const t = useTranslations("site.floating_whatsapp");
  const pathname = usePathname();

  if (pathname.startsWith("/reservar")) return null;

  return (
    <a
      href={whatsappUrl(t("message"))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("label")}
      data-wa-location="floating_button"
      className="fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#0B7A3E] text-white shadow-lg hover:bg-[#096333] focus:outline-none focus-visible:ring-4 focus-visible:ring-ink focus-visible:ring-offset-2 md:hidden [html[data-cookie-banner=open]_&]:hidden"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
