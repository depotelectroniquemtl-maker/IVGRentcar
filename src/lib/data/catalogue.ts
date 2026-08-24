import { createClient } from "@/lib/supabase/server";
import type { CategorieAvecTarifs, PalierTarif, TypeVehicule } from "@/lib/types";

/**
 * Catalogue public (catégories + grille tarifaire) — lecture ouverte à tous via RLS
 * (voir supabase/migrations/0005_catalogue_public.sql), utilisée par la vitrine.
 *
 * Une catégorie n'apparaît que si le parc réel en contient au moins une unité active
 * (vehicules.actif = true) : le "Notre flotte" public doit refléter le parc, pas juste
 * le catalogue tarifaire. La table vehicules restant réservée au staff, ce filtre passe
 * par la fonction security definer categories_avec_flotte_active() (voir
 * supabase/migrations/0011_categories_avec_flotte_active.sql) plutôt que par une requête
 * directe sur vehicules, qui échouerait sous RLS pour un visiteur anonyme.
 */
export async function getCatalogue(): Promise<CategorieAvecTarifs[]> {
  const supabase = createClient();

  const [{ data, error }, { data: flotteActive, error: flotteError }] = await Promise.all([
    supabase
      .from("categories_vehicules")
      .select("id, nom, type, capacite_personnes, actif, tarifs(palier, prix_usd)")
      .eq("actif", true)
      .order("ordre_affichage")
      .order("nom"),
    supabase.rpc("categories_avec_flotte_active"),
  ]);

  if (error) {
    console.error("Erreur de chargement du catalogue:", error.message);
    return [];
  }
  if (flotteError) {
    console.error("Erreur de chargement du parc actif:", flotteError.message);
    return [];
  }

  const categorieIdsAvecFlotte = new Set((flotteActive ?? []).map((r) => r.categorie_id));

  return (data ?? [])
    .filter((categorie) => categorieIdsAvecFlotte.has(categorie.id))
    .map((categorie) => {
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
