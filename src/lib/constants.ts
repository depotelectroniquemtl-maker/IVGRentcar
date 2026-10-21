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
