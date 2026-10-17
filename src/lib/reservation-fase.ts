import { aujourdhui } from "@/lib/calendrier-dates";

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
