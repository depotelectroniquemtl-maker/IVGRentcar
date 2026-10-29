import { Resend } from "resend";
import { BUSINESS_EMAIL } from "@/lib/constants";

// Courriel envoyé à contact@ivjrentcar.com après l'enregistrement d'une demande /reservar.
// Construit côté serveur à partir des données validées et du prix recalculé par la base —
// jamais à partir de ce que le navigateur prétend avoir envoyé. Tout champ saisi par le
// visiteur est échappé en HTML ; le sujet et le replyTo sont débarrassés de tout retour à la
// ligne / caractère de contrôle (injection d'en-tête) ; le destinataire est une constante.

export type DemandePourNotification = {
  nom: string;
  whatsapp: string;
  email: string | null;
  categorie: string | null;
  dateDebut: string;
  heureDebut: string | null;
  dateFin: string;
  heureFin: string | null;
  lieu: string | null;
  notes: string | null;
  prixUsd: number | null;
};

const DESTINATAIRE = BUSINESS_EMAIL;
const EXPEDITEUR = "IVJ Rentcar <reservas@ivjrentcar.com>";
const LIEN_ADMIN = "https://ivjrentcar.com/admin/demandes";
const DELAI_ENVOI_MS = 5000;

const HTML_ECHAPPE: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function echapperHtml(valeur: string): string {
  return valeur.replace(/[&<>"']/g, (c) => HTML_ECHAPPE[c]);
}

// Valeur sûre pour un en-tête : une seule ligne, sans caractère de contrôle.
export function valeurEnTete(valeur: string, max: number): string {
  return valeur
    .replace(/[\u0000-\u001f\u007f\u0085\u2028\u2029]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

// Adresse de réponse : une seule adresse simple, sinon aucune (jamais de liste, de nom affiché
// ni de caractère qui pourrait ajouter un destinataire ou un en-tête).
export function adresseReponse(email: string | null): string | undefined {
  if (!email || email.length > 254) return undefined;
  return /^[^\s@<>()\[\],;:"\\]+@[^\s@<>()\[\],;:"\\]+\.[^\s@<>()\[\],;:"\\]+$/.test(email)
    ? email
    : undefined;
}

export function construireCourriel(d: DemandePourNotification) {
  const lignes: [string, string][] = [
    ["Nom", d.nom],
    ["WhatsApp", d.whatsapp],
    ...(d.email ? ([["E-mail", d.email]] as [string, string][]) : []),
    ...(d.categorie ? ([["Véhicule", d.categorie]] as [string, string][]) : []),
    ["Du", `${d.dateDebut}${d.heureDebut ? ` (${d.heureDebut})` : ""}`],
    ["Au", `${d.dateFin}${d.heureFin ? ` (${d.heureFin})` : ""}`],
    ...(d.lieu ? ([["Lieu de prise en charge", d.lieu]] as [string, string][]) : []),
    ...(d.prixUsd !== null ? ([["Prix estimé", `US$ ${d.prixUsd}`]] as [string, string][]) : []),
  ];

  const text = [
    ...lignes.map(([label, valeur]) => `${label} : ${valeur}`),
    ...(d.notes ? ["", "Notes du visiteur :", d.notes] : []),
    "",
    `Voir et convertir cette demande : ${LIEN_ADMIN}`,
  ].join("\n");

  const html = [
    ...lignes.map(
      ([label, valeur]) => `<p style="margin:0 0 4px"><strong>${label} :</strong> ${echapperHtml(valeur)}</p>`,
    ),
    ...(d.notes
      ? [
          `<p style="margin:12px 0 4px"><strong>Notes du visiteur :</strong></p>`,
          `<p style="margin:0;white-space:pre-wrap">${echapperHtml(d.notes)}</p>`,
        ]
      : []),
    `<p style="margin:16px 0 0"><a href="${LIEN_ADMIN}">Voir et convertir cette demande</a></p>`,
  ].join("\n");

  return {
    from: EXPEDITEUR,
    to: DESTINATAIRE,
    replyTo: adresseReponse(d.email),
    subject: valeurEnTete(`Nouvelle demande de réservation — ${d.nom}`, 200),
    text,
    html,
  };
}

// Ne lève jamais : la demande est déjà enregistrée, un échec d'envoi (clé absente, Resend en
// panne ou trop lent) est seulement journalisé — la demande reste visible dans /admin/demandes.
export async function envoyerNotificationDemande(d: DemandePourNotification): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Notification de demande non envoyée : RESEND_API_KEY absente");
    return false;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await Promise.race([
      resend.emails.send(construireCourriel(d)),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("délai dépassé")), DELAI_ENVOI_MS),
      ),
    ]);
    if (error) {
      console.error("Erreur d'envoi Resend:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Erreur d'envoi Resend:", error);
    return false;
  }
}
