// Séparation métier : le propriétaire des voitures n'est copropriétaire qu'à 50 % des quads,
// donc entretien et rentabilité ne doivent jamais les mélanger. Le scooter (Pasola) suit les
// voitures. Aucune colonne dédiée : on dérive le groupe de categories_vehicules.type.
export type GroupeVehicule = "voitures" | "quads";

export function groupeDeType(type: string | null | undefined): GroupeVehicule {
  return type === "quad" ? "quads" : "voitures";
}

export function estGroupeValide(valeur: string | undefined): valeur is GroupeVehicule {
  return valeur === "voitures" || valeur === "quads";
}
