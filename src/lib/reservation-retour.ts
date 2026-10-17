import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

// Suivi du retour physique du véhicule (migration 0017) : une seule logique, partagée par
// la fiche de réservation (MarcarDevueltoButton) et le bouton « Retourner » de la liste.
// Le statut stocké ne change pas ; seule date_retour_reelle est renseignée (ou vidée pour
// annuler). Le trigger de journal enregistre l'opération avec l'utilisateur.
//
// La mise à jour est conditionnelle (colonne encore vide pour un retour, déjà remplie pour
// une annulation) : un double clic ou une réservation déjà clôturée entre-temps ne fait rien
// et renvoie `changed: false`.
export async function definirRetourReservation(
  supabase: SupabaseClient<Database>,
  id: string,
  retourne: boolean,
): Promise<{ changed: boolean; error: string | null }> {
  const base = supabase
    .from("reservations")
    .update({ date_retour_reelle: retourne ? new Date().toISOString() : null })
    .eq("id", id);

  const { data, error } = await (retourne
    ? base.is("date_retour_reelle", null)
    : base.not("date_retour_reelle", "is", null)
  ).select("id");

  if (error) return { changed: false, error: error.message };
  return { changed: (data?.length ?? 0) > 0, error: null };
}
