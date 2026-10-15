import { BUSINESS_ADDRESS, BUSINESS_EMAIL, WHATSAPP_NUMBER } from "@/lib/constants";

// Structure d'une section des pages « Conditions de location », « Mentions légales » et
// « Confidentialité et cookies » (contenu dans messages/*.json, namespace « legal »).
export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  after?: string[];
  link?: { label: string; href: string };
};

export type LegalContent = {
  title: string;
  intro: string;
  cta?: string;
  sections: LegalSection[];
};

// +1 849 205 2571 à partir de la constante sans espaces ni « + ».
function formatPhone(raw: string) {
  return `+${raw.slice(0, 1)} ${raw.slice(1, 4)} ${raw.slice(4, 7)} ${raw.slice(7)}`;
}

// Les coordonnées viennent de constants.ts (source unique) : les textes traduits n'ont que
// des jetons {address}, {email}, {phone} remplacés ici — aucune coordonnée recopiée en dur.
export function fillLegalTokens(text: string): string {
  return text
    .replaceAll("{address}", BUSINESS_ADDRESS)
    .replaceAll("{email}", BUSINESS_EMAIL)
    .replaceAll("{phone}", formatPhone(WHATSAPP_NUMBER));
}
