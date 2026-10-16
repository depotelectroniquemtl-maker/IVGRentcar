import type { CategorieAvecTarifs } from "@/lib/types";

// Pages publiques « véhicule » et « hub » (SEO local). La catégorie d'une page est retrouvée
// par categories_vehicules.slug (stable, voir migration 0033) et non par son nom : renommer
// une catégorie ne change donc pas l'URL. Catégorie inactive ou sans slug → 404, jamais de
// page pour un véhicule que la base ne confirme pas.
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
  hub: FleetHub;
  // Nom affiché (identique dans les 3 langues : nom de modèle).
  label: string;
  photos: FleetPhoto[];
  related: FleetPageSlug[];
};

export const FLEET_PAGES: Record<FleetPageSlug, FleetPageConfig> = {
  "quad-300cc": {
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
    hub: "voitures",
    label: "Kia Seltos",
    photos: [{ src: "/fleet/kia-angle.jpeg", width: 960, height: 1280 }],
    related: ["suzuki-xl7", "hyundai-tucson-4x4"],
  },
  "suzuki-xl7": {
    hub: "voitures",
    label: "Suzuki XL7",
    photos: [{ src: "/fleet/suzuki-black.jpg", width: 1024, height: 1536 }],
    related: ["kia-seltos", "hyundai-tucson-4x4"],
  },
  "hyundai-tucson-4x4": {
    hub: "voitures",
    label: "Hyundai Tucson 4x4",
    photos: [{ src: "/fleet/hyundai-tucson-4x4.jpg", width: 1200, height: 800 }],
    related: ["kia-seltos", "suzuki-xl7"],
  },
};

export function isFleetPageSlug(value: string): value is FleetPageSlug {
  return (FLEET_PAGE_SLUGS as readonly string[]).includes(value);
}

// Slug de page d'une catégorie (undefined = pas de page publique pour elle).
export function slugForCategory(categorie: { slug: string | null }): FleetPageSlug | undefined {
  return categorie.slug && isFleetPageSlug(categorie.slug) ? categorie.slug : undefined;
}

// Catégorie active correspondant à un slug (undefined = page indisponible → 404).
export function categoryForSlug(
  slug: FleetPageSlug,
  catalogue: CategorieAvecTarifs[],
): CategorieAvecTarifs | undefined {
  return catalogue.find((c) => c.slug === slug);
}

export function slugsForHub(hub: FleetHub): FleetPageSlug[] {
  return FLEET_PAGE_SLUGS.filter((slug) => FLEET_PAGES[slug].hub === hub);
}
