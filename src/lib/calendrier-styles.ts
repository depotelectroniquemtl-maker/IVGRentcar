// Styles des barres du calendrier selon le statut de la réservation (légende comprise).
// Le statut ne repose jamais sur la couleur seule : une icône (⚠ en retard, ✓ terminée) et le
// texte alternatif de chaque barre l'indiquent aussi.
export type CalFase = "a_venir" | "en_cours" | "en_attente" | "en_retraso" | "terminee";

export const FASE_BARRE: Record<CalFase, string> = {
  a_venir: "bg-yellow-300 text-yellow-950 border-yellow-500 hover:bg-yellow-200",
  en_cours: "bg-blue-600 text-white border-blue-700 hover:bg-blue-700",
  en_attente: "bg-white text-ink-soft border-dashed border-gray-400 hover:bg-gray-50",
  en_retraso: "bg-red-100 text-red-800 border-red-500 hover:bg-red-200",
  terminee: "bg-green-100 text-green-800 border-green-500 hover:bg-green-200",
};

export const BLOCAGE_BARRE = "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200";

export const FASE_ICONE: Partial<Record<CalFase, string>> = {
  en_retraso: "⚠",
  terminee: "✓",
};

// Ordre d'affichage de la légende.
export const FASES_LEGENDE: CalFase[] = ["a_venir", "en_cours", "en_attente", "en_retraso", "terminee"];
