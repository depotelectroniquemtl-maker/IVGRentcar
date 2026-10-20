import { BUSINESS_ADDRESS, BUSINESS_EMAIL, PHONE_DISPLAY } from "@/lib/constants";

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

// Les coordonnées viennent de constants.ts (source unique) : les textes traduits n'ont que
// des jetons {address}, {email}, {phone} remplacés ici — aucune coordonnée recopiée en dur.
export function fillLegalTokens(text: string): string {
  return text
    .replaceAll("{address}", BUSINESS_ADDRESS)
    .replaceAll("{email}", BUSINESS_EMAIL)
    .replaceAll("{phone}", PHONE_DISPLAY);
}
