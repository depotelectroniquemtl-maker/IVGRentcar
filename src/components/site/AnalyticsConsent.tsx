"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  OPEN_SETTINGS_EVENT,
  deleteAnalyticsCookies,
  disableTracking,
  ensureGtag,
  isWhatsAppLink,
  readConsent,
  saveConsent,
  sendPageView,
  setAnalyticsActive,
  setDefaultConsent,
  trackEvent,
  updateConsent,
  whatsappLocation,
  type ConsentChoice,
} from "@/lib/analytics";

const BUTTON_CLASS =
  "flex-1 rounded-md border-2 border-ink px-5 py-2 text-sm font-bold text-ink transition-colors hover:bg-ink hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:w-32 sm:flex-none";

// Google Analytics 4 + bandeau de consentement. Monté uniquement dans le layout de la
// vitrine publique (jamais dans /admin) et seulement si NEXT_PUBLIC_GA_ID est défini.
//
// Mode « basique » du Consent Mode v2 : les 4 signaux sont refusés par défaut, et le script
// gtag.js n'est même PAS chargé tant que le visiteur n'a pas accepté — donc aucune requête
// vers Google avant le choix, ni après un refus. Les pages vues sont envoyées à la main à
// chaque changement de route (la navigation côté client de l'App Router ne recharge pas
// la page), uniquement avec le consentement.
export function AnalyticsConsent({ gaId }: { gaId: string }) {
  const t = useTranslations("cookies");
  const locale = useLocale();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [consent, setConsent] = useState<ConsentChoice | null>(null);
  const [open, setOpen] = useState(false);
  const configured = useRef(false);

  // Lecture du choix mémorisé (côté client seulement, pour éviter un écart d'hydratation).
  useEffect(() => {
    setDefaultConsent();
    const stored = readConsent();
    setConsent(stored);
    setOpen(stored === null);
    setReady(true);
  }, []);

  // Le lien « Gérer les cookies » du pied de page rouvre le bandeau.
  useEffect(() => {
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, reopen);
  }, []);

  // Application du choix à GA4. Déclaré avant l'effet des pages vues : à l'acceptation,
  // la configuration part avant le premier page_view.
  useEffect(() => {
    setAnalyticsActive(consent === "granted");
    if (consent === "granted") {
      disableTracking(gaId, false);
      updateConsent("granted");
      if (!configured.current) {
        configured.current = true;
        const gtag = ensureGtag();
        gtag("js", new Date());
        gtag("config", gaId, { send_page_view: false });
      }
    } else if (consent === "denied") {
      updateConsent("denied");
      disableTracking(gaId, true);
      deleteAnalyticsCookies();
    }
  }, [consent, gaId]);

  useEffect(() => {
    if (consent === "granted") sendPageView(pathname);
  }, [consent, pathname]);

  // Événement « whatsapp_click » : clic (ou clic du milieu) sur TOUT lien vers wa.me, où qu'il
  // soit sur la vitrine. Écouteur global en phase de capture : couvre aussi les futurs
  // boutons. Sans consentement, trackEvent ne fait rien. Paramètres : emplacement + langue.
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest?.("a");
      if (!link || !isWhatsAppLink(link as HTMLAnchorElement)) return;
      trackEvent("whatsapp_click", {
        button_location: whatsappLocation(link as HTMLAnchorElement),
        // « language » est un champ réservé de gtag (langue du navigateur) : GA4 l'absorbe au
        // lieu d'en faire un paramètre d'événement. D'où « site_language ».
        site_language: locale,
      });
    }
    document.addEventListener("click", onClick, true);
    document.addEventListener("auxclick", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("auxclick", onClick, true);
    };
  }, [locale]);

  function choose(choice: ConsentChoice) {
    saveConsent(choice);
    setConsent(choice);
    setOpen(false);
  }

  return (
    <>
      {consent === "granted" && (
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
          strategy="afterInteractive"
        />
      )}

      {ready && open && (
        <div
          role="dialog"
          aria-label={t("title")}
          className="fixed inset-x-0 bottom-0 z-[60] border-t border-black/10 bg-white px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] sm:px-6"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <p className="text-xs leading-snug text-ink-soft sm:text-sm">{t("text")}</p>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => choose("granted")} className={BUTTON_CLASS}>
                {t("accept")}
              </button>
              <button type="button" onClick={() => choose("denied")} className={BUTTON_CLASS}>
                {t("refuse")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
