import type { CategorieAvecTarifs } from "@/lib/types";

// Pages publiques « véhicule » et « hub » (SEO local). La base n'a pas de colonne slug :
// la correspondance slug → catégorie se fait ici, sur le nom EXACT de la catégorie en base
// (comme FLEET_IMAGES). Si une catégorie est renommée ou désactivée dans l'admin, sa page
// répond 404 jusqu'à mise à jour de cette table — aucune page pour un véhicule non confirmé.
export type FleetHub = "quads" | "voitures";

export const FLEET_HUBS: FleetHub[] = ["quads", "voitures"];

export function isFleetHub(value: string): value is FleetHub {
  return value === "quads" || value === "voitures";
}

export const FLEET_PAGE_SLUGS = [
  "quad-300cc",
  "kia-seltos",
  "suzuki-xl7",
  "hyundai-tucson-4x4",
] as const;

export type FleetPageSlug = (typeof FLEET_PAGE_SLUGS)[number];

export type FleetPhoto = { src: string; width: number; height: number };

type FleetPageConfig = {
  // Nom exact de la catégorie dans categories_vehicules.
  categorie: string;
  hub: FleetHub;
  // Nom affiché (identique dans les 3 langues : nom de modèle).
  label: string;
  photos: FleetPhoto[];
  related: FleetPageSlug[];
};

export const FLEET_PAGES: Record<FleetPageSlug, FleetPageConfig> = {
  "quad-300cc": {
    categorie: "Quad 4 Roues 300cc",
    hub: "quads",
    label: "Quad 300cc",
    photos: [
      { src: "/fleet/quads-beach.JPG", width: 1800, height: 1013 },
      { src: "/fleet/quad-group.JPG", width: 1800, height: 1013 },
      { src: "/fleet/quad-road.JPG", width: 1800, height: 1013 },
    ],
    related: [],
  },
  "kia-seltos": {
    categorie: "Kia Seltos 2026",
    hub: "voitures",
    label: "Kia Seltos",
    photos: [{ src: "/fleet/kia-angle.jpeg", width: 960, height: 1280 }],
    related: ["suzuki-xl7", "hyundai-tucson-4x4"],
  },
  "suzuki-xl7": {
    categorie: "Suzuki XL 7 Personas",
    hub: "voitures",
    label: "Suzuki XL7",
    photos: [{ src: "/fleet/suzuki-black.jpg", width: 1024, height: 1536 }],
    related: ["kia-seltos", "hyundai-tucson-4x4"],
  },
  "hyundai-tucson-4x4": {
    categorie: "Tucson 4x4",
    hub: "voitures",
    label: "Hyundai Tucson 4x4",
    photos: [{ src: "/fleet/hyundai-tucson-4x4.jpg", width: 1200, height: 800 }],
    related: ["kia-seltos", "suzuki-xl7"],
  },
};

export function isFleetPageSlug(value: string): value is FleetPageSlug {
  return (FLEET_PAGE_SLUGS as readonly string[]).includes(value);
}

export function slugForCategory(nom: string): FleetPageSlug | undefined {
  return FLEET_PAGE_SLUGS.find((slug) => FLEET_PAGES[slug].categorie === nom);
}

// Catégorie active correspondant à un slug (undefined = page indisponible → 404).
export function categoryForSlug(
  slug: FleetPageSlug,
  catalogue: CategorieAvecTarifs[],
): CategorieAvecTarifs | undefined {
  return catalogue.find((c) => c.nom === FLEET_PAGES[slug].categorie);
}

export function slugsForHub(hub: FleetHub): FleetPageSlug[] {
  return FLEET_PAGE_SLUGS.filter((slug) => FLEET_PAGES[slug].hub === hub);
}
