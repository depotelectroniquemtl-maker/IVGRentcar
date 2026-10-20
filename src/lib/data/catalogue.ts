import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
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
 *
 * ERREUR ≠ ABSENCE : une lecture qui échoue (réseau, délai dépassé, erreur Supabase) lève
 * CatalogueIndisponibleError ; elle n'est JAMAIS convertie en liste vide, sinon une panne
 * ferait répondre 404/noindex sur des fiches valides, vider le sitemap, et — pire — un
 * résultat vide serait mis en cache. Seule une lecture réussie dont le slug est absent
 * signifie « cette page n'existe pas (ou plus) ».
 */
export class CatalogueIndisponibleError extends Error {
  constructor(detail: string) {
    super(`Catalogue indisponible : ${detail}`);
    this.name = "CatalogueIndisponibleError";
  }
}

// Délai maximal d'une requête : sans lui, une base qui ne répond pas laisse la page suspendue
// jusqu'à l'expiration de la fonction serveur. Les nouvelles tentatives automatiques de
// postgrest-js (jusqu'à 3, avec attente croissante) sont désactivées : mesurées à ~7 s sur un
// 503 et ~19 s sur une base muette, elles dépasseraient le temps d'une fonction serveur. Le
// cache (ou, pour la réservation, le message d'indisponibilité) tient lieu de nouvelle tentative.
const DELAI_LECTURE_MS = 3000;

// Durée de validité du cache (secondes). Valeur INFORMATIVE : elle sert à l'affichage des
// pages publiques ; la réservation et l'enregistrement d'une demande lisent toujours la base
// en direct (RPC appelées par le navigateur, voir ReservarForm).
const CATALOGUE_REVALIDATE_S = 300;

// Client sans cookies ni session : le catalogue est public, et lire cookies() rendrait chaque
// page dynamique (donc sans cache ni secours en cas de panne).
//
// `sansCache` : lecture strictement fraîche (réservation). Next.js 14 met sinon en cache les
// requêtes GET de fetch même sur une page « force-dynamic » (constaté : /reservar servait les
// catégories d'une lecture précédente alors que la base répondait 503). `cache: "no-store"`
// n'est utilisé que hors génération statique, où il est autorisé ; le chemin mis en cache
// passe par unstable_cache, qui désactive déjà le cache de fetch en interne.
function clientPublic(sansCache: boolean) {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            signal: AbortSignal.timeout(DELAI_LECTURE_MS),
            ...(sansCache ? { cache: "no-store" as const } : {}),
          }),
      },
    },
  );
}

async function lireCatalogue(sansCache: boolean): Promise<CategorieAvecTarifs[]> {
  const debut = Date.now();
  const supabase = clientPublic(sansCache);

  const [{ data, error }, { data: flotteActive, error: flotteError }] = await Promise.all([
    supabase
      .from("categories_vehicules")
      .select("id, nom, slug, type, capacite_personnes, actif, tarifs(palier, prix_usd)")
      .eq("actif", true)
      .order("ordre_affichage")
      .order("nom")
      .retry(false),
    supabase.rpc("categories_avec_flotte_active").retry(false),
  ]);

  const echec = error ?? flotteError;
  if (echec) {
    console.error("[catalogue] lecture échouée", {
      source: error ? "categories_vehicules" : "categories_avec_flotte_active",
      message: echec.message,
      code: echec.code,
      ms: Date.now() - debut,
    });
    throw new CatalogueIndisponibleError(echec.message);
  }

  const categorieIdsAvecFlotte = new Set((flotteActive ?? []).map((r) => r.categorie_id));

  const catalogue = (data ?? [])
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
        slug: categorie.slug,
        type: categorie.type as TypeVehicule,
        capacite_personnes: categorie.capacite_personnes,
        actif: categorie.actif,
        tarifs,
      };
    });

  // Un catalogue entièrement vide n'est pas un état normal de l'entreprise : on le traite
  // comme une anomalie de lecture (RLS, projet en pause…) pour ne ni le mettre en cache ni
  // en déduire que toutes les pages ont disparu.
  if (catalogue.length === 0) {
    console.error("[catalogue] lecture réussie mais catalogue vide : traité comme une anomalie");
    throw new CatalogueIndisponibleError("catalogue vide");
  }

  return catalogue;
}

/**
 * Catalogue pour l'affichage public (pages SEO, accueil, flotte, sitemap), mis en cache
 * CATALOGUE_REVALIDATE_S secondes. Si la relecture échoue, la dernière valeur valide est
 * conservée (Next.js 14) ; si aucune valeur n'existe encore, l'erreur remonte.
 * Toute valeur issue de ce cache est INFORMATIVE.
 */
export const getCatalogue = unstable_cache(() => lireCatalogue(false), ["catalogue-public-v1"], {
  revalidate: CATALOGUE_REVALIDATE_S,
  tags: ["catalogue"],
});

/**
 * Lecture directe, sans cache : pour la page de réservation, qui ne doit jamais s'appuyer sur
 * une valeur périmée. Lève CatalogueIndisponibleError en cas d'échec.
 */
export const getCatalogueFrais = () => lireCatalogue(true);
