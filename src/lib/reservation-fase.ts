import { aujourdhui } from "@/lib/calendrier-dates";

// Couleurs des badges de phase (liste des réservations, rentabilité) : alignées sur le
// calendrier — en cours = bleu plein, à venir = bleu clair, en attente = gris pointillé,
// en retard = rouge, terminée = vert (avec coche).
export const FASE_BADGE_CLASSES: Record<string, string> = {
  a_venir: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-300",
  en_cours: "bg-blue-600 text-white",
  en_attente: "border border-dashed border-black/40 bg-black/[0.03] text-ink-soft",
  terminee: "bg-green-100 text-green-700",
  en_retraso: "bg-red-100 text-red-700",
  annulee: "bg-red-100 text-red-700",
};

export type Fase = "annulee" | "a_venir" | "en_cours" | "en_retraso" | "terminee";

// Phase d'une réservation (calculée, jamais stockée : le statut stocké reste en_attente /
// confirmee / annulee). Reprend la règle historique de la liste des réservations :
//  - « en retard » = confirmée, date de fin dépassée et retour non confirmé (date_retour_reelle vide) ;
//  - « terminée » = date de fin dépassée avec retour confirmé (ou réservation non confirmée).
// Ajout : un retour confirmé (date_retour_reelle renseignée) rend la réservation « terminée »
// même avant la date de fin (retour anticipé). La disponibilité du véhicule, elle, ne change
// pas : elle suit les dates de la réservation.
// « Aujourd'hui » = jour civil de Las Terrenas (et non l'UTC du serveur).
export function calcularFase(
  dateDebut: string,
  dateFin: string,
  statut: string,
  dateRetourReelle: string | null,
  hoy: string = aujourdhui(),
): Fase {
  if (statut === "annulee") return "annulee";
  if (dateRetourReelle) return "terminee";
  if (hoy < dateDebut) return "a_venir";
  if (hoy > dateFin) return statut === "confirmee" ? "en_retraso" : "terminee";
  return "en_cours";
}
