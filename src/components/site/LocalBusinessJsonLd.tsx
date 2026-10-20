import {
  BUSINESS_EMAIL,
  BUSINESS_ID,
  BUSINESS_NAME,
  SITE_URL,
  WHATSAPP_NUMBER,
} from "@/lib/constants";

// Rendu une seule fois dans le layout racine (pas par page) : décrit l'entreprise elle-même,
// pas un contenu éditorial. Les champs restent en dur (adresse, téléphone) plutôt que
// traduits — ce sont des données factuelles identiques dans les 3 langues, pas du texte
// marketing. Pas de `geo` ni de `sameAs` : aucune donnée vérifiée n'existe encore dans le
// projet, mieux vaut les omettre que d'en inventer.
export function LocalBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    "@id": BUSINESS_ID,
    name: BUSINESS_NAME,
    image: `${SITE_URL}/hero/hero-tropical-fleet.webp`,
    url: SITE_URL,
    telephone: `+${WHATSAPP_NUMBER}`,
    email: BUSINESS_EMAIL,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Plaza Italia #22, Avenida Juan Pablo Duarte",
      addressLocality: "Las Terrenas",
      addressRegion: "Samaná",
      addressCountry: "DO",
    },
    // Pas d'openingHoursSpecification : le site affiche « Tous les jours, sur réservation »
    // (/contact), sans horaires fixes ; en déclarer (ex. 00:00–23:59) serait inventer.
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- JSON.stringify d'un objet interne fixe, aucune entrée utilisateur.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
