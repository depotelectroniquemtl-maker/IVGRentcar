// Coordonnées réelles du client, reprises de la fiche tarifaire fournie.
export const WHATSAPP_NUMBER = "18492052571"; // +1 849 205 25 71, sans espaces ni "+"
export const BUSINESS_ADDRESS =
  "Plaza Italia #22, Avenida Juan Pablo Duarte, Las Terrenas, R.D.";
// Affichage lisible du même numéro (« +1 849 205 2571 ») ; les liens wa.me / tel: gardent le
// format international sans espaces (WHATSAPP_NUMBER).
const formatPhoneDisplay = (n: string) =>
  `+${n.slice(0, 1)} ${n.slice(1, 4)} ${n.slice(4, 7)} ${n.slice(7)}`;
export const PHONE_DISPLAY = formatPhoneDisplay(WHATSAPP_NUMBER);

// Deuxième numéro WhatsApp (+1 514 994 7652), affiché dans le pied de page sous le premier.
export const WHATSAPP_NUMBER_2 = "15149947652";
export const PHONE_2_DISPLAY = formatPhoneDisplay(WHATSAPP_NUMBER_2);
export const BUSINESS_NAME = "IVJ Rentcar";

// Fiche Google : valeurs statiques saisies à la main (note sur 5, nombre d'avis). À mettre à
// jour ici quand les avis changent. Affichées par GoogleReviews ; jamais dans le JSON-LD.
export const GOOGLE_RATING = 4.9;
export const GOOGLE_REVIEWS_COUNT = 20;
export const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=IVJ%20Rentcar%20Las%20Terrenas&query_place_id=ChIJU1vGf-77ro4RIzLeBzA-Ep4";
export const BUSINESS_EMAIL = "contact@ivjrentcar.com";

// Domaine canonique du site public — utilisé par les metadata (canonical/hreflang/OG),
// robots.txt, sitemap.xml et le balisage JSON-LD, tous regroupés sur cette seule source.
export const SITE_URL = "https://ivjrentcar.com";

// Identifiant JSON-LD de l'entreprise (LocalBusiness) : les pages produit s'y rattachent.
export const BUSINESS_ID = `${SITE_URL}/#business`;

export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

// Fiche Google Maps (identifiant 0x8eaefbee7fc65b53:0x9e123e3007de3223) : coordonnées lues sur
// la fiche elle-même, horaires identiques à ceux de la fiche (lundi à samedi, dimanche fermé).
export const BUSINESS_GEO = { latitude: 19.3119707, longitude: -69.5429003 };
export const BUSINESS_HOURS = {
  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  opens: "09:00",
  closes: "19:00",
};
export const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61574743263900";
