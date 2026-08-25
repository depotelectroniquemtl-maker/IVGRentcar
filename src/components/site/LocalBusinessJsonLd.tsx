import { BUSINESS_EMAIL, BUSINESS_NAME, SITE_URL, WHATSAPP_NUMBER } from "@/lib/constants";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Rendu une seule fois dans le layout racine (pas par page) : décrit l'entreprise elle-même,
// pas un contenu éditorial. Les champs restent en dur (adresse, téléphone) plutôt que
// traduits — ce sont des données factuelles identiques dans les 3 langues, pas du texte
// marketing. Pas de `geo` : aucune coordonnée précise vérifiée n'existe dans le projet,
// mieux vaut l'omettre que d'en inventer une fausse.
export function LocalBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    name: BUSINESS_NAME,
    image: `${SITE_URL}/hero/hero-tropical-fleet.webp`,
    url: SITE_URL,
    telephone: `+${WHATSAPP_NUMBER}`,
    email: BUSINESS_EMAIL,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Plaza Italia #35, Avenida Juan Pablo Duarte",
      addressLocality: "Las Terrenas",
      addressRegion: "Samaná",
      addressCountry: "DO",
    },
    // "Tous les jours, sur réservation" (pas d'horaires fixes) — traduit ici par une
    // disponibilité 7j/7, cohérent avec le texte affiché sur /contact.
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAYS,
      opens: "00:00",
      closes: "23:59",
    },
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- JSON.stringify d'un objet interne fixe, aucune entrée utilisateur.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
