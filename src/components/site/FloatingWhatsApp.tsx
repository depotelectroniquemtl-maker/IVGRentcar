"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { whatsappContactUrl } from "@/lib/constants";

const WELCOME_DELAY_MS = 5000;
const WELCOME_STORAGE_KEY = "ivj_wa_welcome";

// Secours si sessionStorage est bloqué : le module reste chargé pendant la navigation interne,
// donc la fenêtre n'est présentée qu'une fois même sans stockage.
let welcomeShownInMemory = false;

function welcomeAlreadyShown(): boolean {
  if (welcomeShownInMemory) return true;
  try {
    return window.sessionStorage.getItem(WELCOME_STORAGE_KEY) === "shown";
  } catch {
    return false;
  }
}

function markWelcomeShown() {
  welcomeShownInMemory = true;
  try {
    window.sessionStorage.setItem(WELCOME_STORAGE_KEY, "shown");
  } catch {
    // Stockage bloqué : la mémoire du module suffit pour la navigation interne.
  }
}

// Bouton WhatsApp rond fixe en bas à droite, sur tous les écrans, et petite fenêtre de bienvenue
// présentée une seule fois par session, environ 5 s après l'arrivée sur une page autorisée.
// Monté dans le layout de la vitrine (jamais dans /admin), masqué sur /reservar et tant que le
// bandeau de consentement est ouvert (AnalyticsConsent pose data-cookie-banner sur <html>).
// WhatsApp ne s'ouvre qu'au clic. Les clics sont comptés par l'écouteur global de
// AnalyticsConsent (whatsapp_click ; button_location = floating_button ou floating_welcome) ;
// l'apparition de la fenêtre ne déclenche aucun événement.
export function FloatingWhatsApp() {
  const t = useTranslations("site.floating_whatsapp");
  const pathname = usePathname();
  const excluded = pathname.startsWith("/reservar");

  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  // Le délai court à partir de la première page autorisée et n'est pas remis à zéro par un
  // changement de page : sur une page exclue il est suspendu, puis reprend pour le temps restant.
  const elapsedMs = useRef(0);

  useEffect(() => {
    if (excluded || open || welcomeAlreadyShown()) return;
    const start = Date.now();
    const id = window.setTimeout(() => {
      markWelcomeShown();
      setOpen(true);
    }, Math.max(0, WELCOME_DELAY_MS - elapsedMs.current));
    return () => {
      window.clearTimeout(id);
      elapsedMs.current += Date.now() - start;
    };
  }, [excluded, open]);

  // Apparition douce (désactivée par motion-reduce) : la bulle passe visible à l'image suivante.
  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    const id = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  if (excluded) return null;

  const href = whatsappContactUrl(t("message"));
  const lines = t.raw("welcome_text") as string[];

  return (
    <div
      className="fixed right-4 z-40 flex flex-col items-end gap-3 md:right-6 [html[data-cookie-banner=open]_&]:hidden"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
    >
      {open && (
        <section
          aria-label={t("welcome_label")}
          className={`relative w-[280px] max-w-[calc(100vw-2rem)] rounded-xl border border-black/10 bg-white p-4 pr-10 text-ink shadow-lg md:w-[320px] motion-safe:transition motion-safe:duration-300 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t("welcome_close")}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-black/5 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="h-4 w-4">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <p className="text-sm font-bold">{t("welcome_title")}</p>
          <div className="mt-2 flex flex-col gap-1.5 text-sm leading-snug text-ink">
            {lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            data-wa-location="floating_welcome"
            onClick={() => setOpen(false)}
            className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md bg-[#0B7A3E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#096333] focus:outline-none focus-visible:ring-4 focus-visible:ring-ink focus-visible:ring-offset-2"
          >
            <WhatsAppIcon className="h-5 w-5" />
            {t("welcome_cta")}
          </a>
        </section>
      )}

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("label")}
        data-wa-location="floating_button"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0B7A3E] text-white shadow-lg hover:bg-[#096333] focus:outline-none focus-visible:ring-4 focus-visible:ring-ink focus-visible:ring-offset-2"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>
    </div>
  );
}
