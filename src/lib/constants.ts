// Coordonnées réelles du client, reprises de la fiche tarifaire fournie.
export const WHATSAPP_NUMBER = "18492052571"; // +1 849 205 25 71, sans espaces ni "+"
export const BUSINESS_ADDRESS =
  "Plaza Italia #35, Avenida Juan Pablo Duarte, Las Terrenas, R.D.";
export const BUSINESS_NAME = "I.V.J Polanco Rent a Car";
export const BUSINESS_EMAIL = "contact@ivjrentcar.com";

// Domaine canonique du site public — utilisé par les metadata (canonical/hreflang/OG),
// robots.txt, sitemap.xml et le balisage JSON-LD, tous regroupés sur cette seule source.
export const SITE_URL = "https://ivjrentcar.com";

export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
