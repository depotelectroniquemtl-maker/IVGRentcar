import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/min";

// Pays proposés en tête de liste (clientèle d'IVJ Rentcar), dans l'ordre demandé.
export const TOP_COUNTRIES: CountryCode[] = ["FR", "CA", "US", "DO", "ES", "IT", "DE", "CH", "BE"];

// Pays présélectionné selon la langue du site (modifiable par le visiteur).
export function defaultCountryForLocale(locale: string): CountryCode {
  if (locale === "fr") return "FR";
  if (locale === "es") return "ES";
  return "US";
}

export function isCountryCode(value: unknown): value is CountryCode {
  return typeof value === "string" && getCountries().includes(value as CountryCode);
}

export function callingCode(country: CountryCode): string {
  return `+${getCountryCallingCode(country)}`;
}

export function allCountries(): CountryCode[] {
  return getCountries();
}

// Texte comparable pour la recherche : sans accents, en minuscules, ponctuation remplacée
// par des espaces (« République  dominicaine » et « republique dominicaine » deviennent identiques).
export function foldText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, " ")
    .trim();
}

export type PhoneError = "required" | "invalid" | "wrong_country";

export type PhoneResult = { ok: true; e164: string } | { ok: false; error: PhoneError };

// Normalise un numéro saisi vers le format E.164 (+33665439979). Le pays choisi sert de
// contexte pour un numéro national ; un numéro saisi avec "+" garde son propre indicatif.
// L'indicatif +1 est partagé (Canada, États-Unis, Rép. dominicaine…) : on ne s'y fie pas
// seul, le pays choisi doit correspondre à l'indicatif régional du numéro.
export function normalizePhone(raw: string, country: CountryCode): PhoneResult {
  const input = raw.trim();
  if (!input) return { ok: false, error: "required" };

  const parsed = parsePhoneNumberFromString(input, country);
  if (!parsed || !parsed.isValid()) return { ok: false, error: "invalid" };

  const international = input.startsWith("+") || input.startsWith("00");
  if (!international && getCountryCallingCode(country) === "1" && parsed.country !== country) {
    return { ok: false, error: "wrong_country" };
  }

  return { ok: true, e164: parsed.number };
}

// E.164 strict : "+" puis 7 à 15 chiffres, premier chiffre non nul.
export function isE164(value: string): boolean {
  return /^\+[1-9][0-9]{6,14}$/.test(value);
}
