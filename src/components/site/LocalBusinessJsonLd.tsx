import {
  BUSINESS_EMAIL,
  BUSINESS_GEO,
  BUSINESS_HOURS,
  BUSINESS_ID,
  BUSINESS_NAME,
  FACEBOOK_URL,
  GOOGLE_MAPS_URL,
  SITE_URL,
  WHATSAPP_NUMBER,
} from "@/lib/constants";

// Rendu une seule fois dans le layout racine (pas par page) : décrit l'entreprise elle-même,
// pas un contenu éditorial. Les champs restent en dur (adresse, téléphone) plutôt que
// traduits — ce sont des données factuelles identiques dans les 3 langues, pas du texte
// marketing. `geo`, horaires et `hasMap` reprennent la fiche Google (constants.ts) ; rien n'est
// inventé. Pas d'`aggregateRating` : la note affichée sur le site est une valeur saisie à la
// main, et Google n'accepte pas les avis qu'une entreprise publie sur elle-même.
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
    geo: { "@type": "GeoCoordinates", ...BUSINESS_GEO },
    hasMap: GOOGLE_MAPS_URL,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: BUSINESS_HOURS.days,
        opens: BUSINESS_HOURS.opens,
        closes: BUSINESS_HOURS.closes,
      },
    ],
    areaServed: [
      { "@type": "City", name: "Las Terrenas" },
      { "@type": "AdministrativeArea", name: "Samaná" },
    ],
    sameAs: [FACEBOOK_URL],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- JSON.stringify d'un objet interne fixe, aucune entrée utilisateur.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
