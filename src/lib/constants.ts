// Coordonnées réelles du client, reprises de la fiche tarifaire fournie.
export const WHATSAPP_NUMBER = "18492052571"; // +1 849 205 25 71, sans espaces ni "+"
export const BUSINESS_ADDRESS =
  "Plaza Italia #35, Avenida Juan Pablo Duarte, Las Terrenas, R.D.";

export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
