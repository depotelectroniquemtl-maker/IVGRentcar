import { createClient } from "@/lib/supabase/server";
import type { CategorieAvecTarifs, PalierTarif, TypeVehicule } from "@/lib/types";

/**
 * Catalogue public (catégories + grille tarifaire) — lecture ouverte à tous via RLS
 * (voir supabase/migrations/0005_catalogue_public.sql), utilisée par la vitrine.
 */
export async function getCatalogue(): Promise<CategorieAvecTarifs[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("categories_vehicules")
    .select("id, nom, type, capacite_personnes, actif, tarifs(palier, prix_usd)")
    .eq("actif", true)
    .order("nom");

  if (error) {
    console.error("Erreur de chargement du catalogue:", error.message);
    return [];
  }

  return (data ?? []).map((categorie) => {
    const tarifs: Record<PalierTarif, number | null> = {
      "1_3_jours": null,
      "4_plus_jours": null,
      "15_plus_jours": null,
    };

    for (const t of categorie.tarifs ?? []) {
      tarifs[t.palier as PalierTarif] = t.prix_usd;
    }

    return {
      id: categorie.id,
      nom: categorie.nom,
      type: categorie.type as TypeVehicule,
      capacite_personnes: categorie.capacite_personnes,
      actif: categorie.actif,
      tarifs,
    };
  });
}
