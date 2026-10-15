// Google Analytics 4 avec Consent Mode v2 — helpers partagés entre le bandeau de
// consentement (AnalyticsConsent) et le lien « Gérer les cookies » du pied de page.
// Aucun appel réseau ici : le script gtag.js n'est chargé qu'après un « Accepter ».

export type ConsentChoice = "granted" | "denied";

export const CONSENT_STORAGE_KEY = "ivj_cookie_consent";
export const OPEN_SETTINGS_EVENT = "ivj:open-cookie-settings";

// localStorage peut lever (navigation privée, données bloquées, miniature de partage...) :
// le site doit continuer à fonctionner sans, le choix sera simplement redemandé.
export function readConsent(): ConsentChoice | null {
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function saveConsent(choice: ConsentChoice) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // Choix non mémorisé : sans conséquence, le bandeau réapparaîtra.
  }
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}

type Gtag = (...args: unknown[]) => void;
type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: Gtag;
  __ivjConsentDefaultSet?: boolean;
  __ivjAnalyticsActive?: boolean;
};

// Même définition que le snippet officiel : gtag doit empiler l'objet `arguments`
// (et non un tableau) dans dataLayer pour être compris par gtag.js.
export function ensureGtag(): Gtag {
  const w = window as AnalyticsWindow;
  w.dataLayer = w.dataLayer || [];
  if (!w.gtag) {
    w.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments);
    };
  }
  return w.gtag;
}

// Consent Mode v2 : tout est refusé tant que le visiteur n'a pas répondu (et pour
// toujours pour la publicité : on n'en fait pas).
export function setDefaultConsent() {
  const w = window as AnalyticsWindow;
  if (w.__ivjConsentDefaultSet) return;
  w.__ivjConsentDefaultSet = true;
  ensureGtag()("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

export function updateConsent(choice: ConsentChoice) {
  ensureGtag()("consent", "update", {
    analytics_storage: choice,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

// Coupe tout envoi futur de GA4 pour cet identifiant (pris en charge par gtag.js).
export function disableTracking(gaId: string, disabled: boolean) {
  (window as unknown as Record<string, unknown>)[`ga-disable-${gaId}`] = disabled;
}

// Si le visiteur change d'avis après avoir accepté, on retire les cookies Analytics déjà
// posés (_ga, _ga_<ID>, _gid...) sur le domaine courant et ses variantes.
export function deleteAnalyticsCookies() {
  const names = document.cookie
    .split(";")
    .map((c) => c.split("=")[0].trim())
    .filter((n) => n === "_ga" || n.startsWith("_ga_") || n === "_gid" || n === "_gat");
  const host = window.location.hostname;
  const parts = host.split(".");
  const domains = [undefined, host, `.${host}`, `.${parts.slice(-2).join(".")}`];
  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${
        domain ? `; domain=${domain}` : ""
      }`;
    }
  }
}

export function sendPageView(pathname: string) {
  // Chemin seul, sans paramètres d'URL : jamais de donnée personnelle dans les événements.
  ensureGtag()("event", "page_view", {
    page_location: `${window.location.origin}${pathname}`,
    page_path: pathname,
  });
}

// Le suivi n'est « actif » que lorsque le visiteur a accepté ET que GA4 est configuré
// (posé par AnalyticsConsent). Tant que ce n'est pas le cas, trackEvent ne fait rien : un
// événement ne doit jamais être mis en file d'attente pendant un refus ou avant le choix,
// car gtag.js le renverrait ensuite après un « Accepter » tardif.
export function setAnalyticsActive(active: boolean) {
  (window as AnalyticsWindow).__ivjAnalyticsActive = active;
}

type EventParams = Record<string, string | number | boolean | undefined>;

// Envoie un événement personnalisé à GA4, uniquement avec le consentement. Les paramètres
// ne doivent contenir AUCUNE donnée personnelle (nom, téléphone, WhatsApp, courriel).
export function trackEvent(name: string, params: EventParams = {}) {
  if (typeof window === "undefined") return;
  if (!(window as AnalyticsWindow).__ivjAnalyticsActive) return;
  ensureGtag()("event", name, params);
}

// Lien vers WhatsApp (wa.me) ? Compare le nom d'hôte, pas une simple sous-chaîne.
export function isWhatsAppLink(link: HTMLAnchorElement): boolean {
  try {
    return new URL(link.href).hostname === "wa.me";
  } catch {
    return false;
  }
}

// Emplacement du bouton : data-wa-location posé sur le lien (header, hero, flotte, contact,
// ...) ; à défaut, déduit de l'endroit de la page (en-tête, pied de page, page de réservation)
// pour que tout futur lien wa.me soit suivi sans rien oublier.
export function whatsappLocation(link: HTMLAnchorElement): string {
  const declared = link.dataset.waLocation;
  if (declared) return declared;
  if (link.closest("header")) return "header";
  if (link.closest("footer")) return "footer";
  if (window.location.pathname.includes("/reservar")) return "reservation";
  return "other";
}
