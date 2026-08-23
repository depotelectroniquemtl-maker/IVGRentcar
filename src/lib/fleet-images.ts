// Mapping catégorie (nom exact en base) → photos réelles fournies par le client.
// gm-car.jpg et honda-fit.jpg ne correspondent à aucune catégorie officielle de la
// fiche tarifaire — volontairement absents.
export const FLEET_IMAGES: Record<string, string[]> = {
  Hyundai: ["/fleet/hyundai-i20.jpg"],
  Changan: ["/fleet/changan.jpg"],
  "Tucson 4x4": ["/fleet/hyundai-tucson-4x4.jpg"],
  "Chevrolet 4x4": ["/fleet/chevrolet-4x4.jpg"],
  "Suzuki XL 7 Personas": ["/fleet/suzuki-black.jpg"],
  "Quad 4 Roues 300cc": ["/fleet/quads-beach.JPG"],
  "Kia Seltos 2026": ["/fleet/kia-angle.jpeg"],
  "Pasola 175cc": ["/fleet/BWS-175-Lateral-derecho.png"],
};
