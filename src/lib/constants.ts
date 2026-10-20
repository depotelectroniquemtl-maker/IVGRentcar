// Coordonnées réelles du client, reprises de la fiche tarifaire fournie.
export const WHATSAPP_NUMBER = "18492052571"; // +1 849 205 25 71, sans espaces ni "+"
export const BUSINESS_ADDRESS =
  "Plaza Italia #22, Avenida Juan Pablo Duarte, Las Terrenas, R.D.";
// Affichage lisible du même numéro (« +1 849 205 2571 ») ; les liens wa.me / tel: gardent le
// format international sans espaces (WHATSAPP_NUMBER).
export const PHONE_DISPLAY = `+${WHATSAPP_NUMBER.slice(0, 1)} ${WHATSAPP_NUMBER.slice(1, 4)} ${WHATSAPP_NUMBER.slice(4, 7)} ${WHATSAPP_NUMBER.slice(7)}`;
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
