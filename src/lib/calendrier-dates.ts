// Aides de dates du calendrier admin. Les dates sont des chaînes ISO « AAAA-MM-JJ » (dates
// civiles, sans heure) : on calcule en UTC pour qu'aucun fuseau ni changement d'heure ne
// décale un jour, y compris à cheval sur deux mois ou deux années.

// Fuseau de l'entreprise (Las Terrenas) : c'est lui qui définit « aujourd'hui » dans le
// calendrier, et non le fuseau du serveur (UTC sur Vercel).
export const FUSEAU_ENTREPRISE = "America/Santo_Domingo";

export function aujourdhui(): string {
  // en-CA formate en AAAA-MM-JJ.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSEAU_ENTREPRISE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function toUtc(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

function fromUtc(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const d = toUtc(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return fromUtc(d);
}

export function diffDays(a: string, b: string): number {
  return Math.round((toUtc(b).getTime() - toUtc(a).getTime()) / 86_400_000);
}

export function addMonths(mois: string, n: number): string {
  const [y, m] = mois.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return fromUtc(d).slice(0, 7);
}

export function joursDuMois(mois: string): number {
  const [y, m] = mois.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function isIsoDate(v: string | undefined): v is string {
  return !!v && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(toUtc(v).getTime());
}

export function isIsoMonth(v: string | undefined): v is string {
  return !!v && /^\d{4}-(0[1-9]|1[0-2])$/.test(v);
}

// Numéro de semaine ISO 8601 (semaine du lundi, semaine 1 = celle du premier jeudi).
export function semaineIso(iso: string): number {
  const d = toUtc(iso);
  const jour = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - jour);
  const debutAnnee = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - debutAnnee.getTime()) / 86_400_000 + 1) / 7);
}

export function estWeekEnd(iso: string): boolean {
  const j = toUtc(iso).getUTCDay();
  return j === 0 || j === 6;
}

export function formatDate(iso: string, locale: string, options: Intl.DateTimeFormatOptions) {
  const texte = new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" }).format(toUtc(iso));
  // Usage français : « 1er octobre » (Intl écrit « 1 octobre »).
  if (locale.startsWith("fr") && options.day && iso.endsWith("-01")) {
    return texte.replace(/(^|\s)1(?=\s)/, (_, espace: string) => `${espace}1er`);
  }
  return texte;
}

// Initiales (2 lettres max, majuscules) : premières lettres des deux premiers mots ; un seul
// mot → ses deux premières lettres. Ex. « John Belair » → « JB », « Carlos LOC CANADU » → « CL ».
export function initiales(nom: string): string {
  const mots = nom
    .split(/\s+/)
    .map((m) => m.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean);
  if (mots.length === 0) return "";
  const brut = mots.length >= 2 ? mots[0][0] + mots[1][0] : mots[0].slice(0, 2);
  return brut.toLocaleUpperCase();
}
