// Suivi par étapes des demandes de /admin/demandes : classement par onglet, alertes et
// formats d'affichage. Fonctions pures (aucun accès base) pour être calculées côté serveur
// avec une seule horloge — les textes relatifs (« il y a 2 jours ») sont donc identiques au
// rendu serveur et à l'hydratation.
import type { AdminLocale } from "@/lib/admin-locale";

export type StatutDemande = "nouvelle" | "contactee" | "convertie" | "rejetee";
export type Onglet = "a_traiter" | "en_discussion" | "converties" | "sans_suite";
export type Alerte = "retard" | "relancer" | null;
export type Barre = "rouge" | "orange" | "bleu" | "vert" | null;

export const ONGLETS: Onglet[] = ["a_traiter", "en_discussion", "converties", "sans_suite"];

const HEURE_MS = 3600_000;
const JOUR_MS = 24 * HEURE_MS;
// « Réponse en retard » : nouvelle depuis plus de 24 h. « À relancer » : contactée depuis
// 3 jours ou plus (date du dernier contact = updated_at, faute de colonne dédiée).
export const DELAI_RETARD_MS = JOUR_MS;
export const DELAI_RELANCE_MS = 3 * JOUR_MS;

const FUSEAU = "America/Santo_Domingo";
const INTL_LOCALE: Record<AdminLocale, string> = { fr: "fr-CA", en: "en-US", es: "es-DO" };

export function estStatut(v: string): v is StatutDemande {
  return v === "nouvelle" || v === "contactee" || v === "convertie" || v === "rejetee";
}

export function alerteDe(statut: StatutDemande, createdAt: Date, updatedAt: Date, maintenant: Date): Alerte {
  if (statut === "nouvelle" && maintenant.getTime() - createdAt.getTime() > DELAI_RETARD_MS) return "retard";
  if (statut === "contactee" && maintenant.getTime() - updatedAt.getTime() >= DELAI_RELANCE_MS) return "relancer";
  return null;
}

export function ongletDe(statut: StatutDemande, alerte: Alerte): Onglet {
  if (statut === "nouvelle") return "a_traiter";
  if (statut === "contactee") return alerte === "relancer" ? "a_traiter" : "en_discussion";
  return statut === "convertie" ? "converties" : "sans_suite";
}

export function barreDe(statut: StatutDemande, alerte: Alerte): Barre {
  if (alerte === "retard") return "rouge";
  if (alerte === "relancer") return "orange";
  if (statut === "nouvelle") return "bleu";
  if (statut === "convertie") return "vert";
  return null;
}

// Rattachement demande ↔ fiche client : téléphone EXACT uniquement (jamais le nom ni le
// courriel). Un numéro « proche » (mêmes 8 derniers chiffres, mais pas identique) est signalé
// avant de créer une fiche, pour éviter un doublon avec un numéro mal saisi.
export type ClientRef = { id: string; nom: string; telephone: string };
export type RattachementClient =
  | { type: "unique"; id: string }
  | { type: "plusieurs" }
  | { type: "aucun"; proches: ClientRef[] };

const chiffres = (tel: string) => tel.replace(/\D/g, "");

export function rattacherClient(whatsapp: string, clients: ClientRef[]): RattachementClient {
  const exacts = clients.filter((c) => c.telephone === whatsapp);
  if (exacts.length === 1) return { type: "unique", id: exacts[0].id };
  if (exacts.length > 1) return { type: "plusieurs" };
  const fin = chiffres(whatsapp).slice(-8);
  const proches =
    fin.length === 8 ? clients.filter((c) => chiffres(c.telephone).slice(-8) === fin) : [];
  return { type: "aucun", proches };
}

// --- Formats -------------------------------------------------------------------------------

const dateIso = (iso: string) => new Date(`${iso}T00:00:00Z`);

function partieDate(d: Date, locale: AdminLocale, avecMois: boolean, avecAnnee: boolean): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: "numeric",
    ...(avecMois ? { month: "short" } : {}),
    ...(avecAnnee ? { year: "numeric" } : {}),
    timeZone: "UTC",
  }).format(d);
}

// « 15 → 22 nov. », « 28 déc. → 6 janv. 2027 » : mois omis au début s'il est identique,
// année seulement si différente de l'année en cours. Espaces insécables dans chaque date :
// sur une colonne étroite, la seule coupure possible est après la flèche.
const insecable = (s: string) => s.replace(/ /g, "\u00a0");
export function datesCourtes(debut: string, fin: string, locale: AdminLocale, maintenant: Date): string {
  const d1 = dateIso(debut);
  const d2 = dateIso(fin);
  const anneeCourante = Number(new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone: FUSEAU }).format(maintenant));
  const memeAnnee = d1.getUTCFullYear() === d2.getUTCFullYear();
  const memeMois = memeAnnee && d1.getUTCMonth() === d2.getUTCMonth();
  const anneeFin = d2.getUTCFullYear() !== anneeCourante;
  const anneeDebut = !memeAnnee && d1.getUTCFullYear() !== anneeCourante;
  const gauche = partieDate(d1, locale, !memeMois, anneeDebut);
  const droite = partieDate(d2, locale, true, anneeFin);
  return `${insecable(gauche)}\u00a0→ ${insecable(droite)}`;
}

// « 10 h » / « 10 h 30 » en français, « 10:00 » en anglais et espagnol ; jamais de secondes.
export function heureCourte(heure: string | null, locale: AdminLocale): string | null {
  const m = heure ? /^(\d{1,2}):(\d{2})/.exec(heure) : null;
  if (!m) return null;
  const h = Number(m[1]);
  if (locale === "fr") return m[2] === "00" ? `${h}\u00a0h` : `${h}\u00a0h\u00a0${m[2]}`;
  return `${String(h).padStart(2, "0")}:${m[2]}`;
}

// « 12 oct. 2026 » et « 14 h 30 » (fuseau de Las Terrenas) pour « reçue le … à … ».
export function dateHeureComplete(instant: Date, locale: AdminLocale): { date: string; heure: string } {
  const date = new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: FUSEAU,
  }).format(instant);
  const hm = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: FUSEAU,
  }).format(instant);
  return { date, heure: heureCourte(hm, locale) ?? hm };
}

// « il y a 2 jours », « il y a 1 jour », « il y a 3 heures » — arrondi à l'unité la plus parlante.
export function ilYA(instant: Date, maintenant: Date, locale: AdminLocale): string {
  const ecart = Math.max(0, maintenant.getTime() - instant.getTime());
  const rtf = new Intl.RelativeTimeFormat(INTL_LOCALE[locale], { numeric: "always" });
  if (ecart < HEURE_MS) return rtf.format(-Math.max(1, Math.floor(ecart / 60_000)), "minute");
  if (ecart < JOUR_MS) return rtf.format(-Math.floor(ecart / HEURE_MS), "hour");
  return rtf.format(-Math.floor(ecart / JOUR_MS), "day");
}

export function prixCourt(prix: number | null): string | null {
  return prix === null ? null : `US$\u00a0${Number(prix).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}
