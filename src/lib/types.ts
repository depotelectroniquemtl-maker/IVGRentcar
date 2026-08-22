// Types manuels reflétant le schéma Supabase (supabase/migrations/0001_init.sql).
// À remplacer plus tard par les types générés (`supabase gen types typescript`) une fois
// le CLI Supabase branché au projet en local.

export type PalierTarif = "1_3_jours" | "4_plus_jours" | "15_plus_jours";

export type TypeVehicule = "voiture" | "quad" | "scooter";

export type RoleStaff = "admin" | "employe";

export type EtatOperationnel = "disponible" | "maintenance" | "hors_service";

export type StatutReservation = "en_attente" | "confirmee" | "annulee";

export interface CategorieVehicule {
  id: string;
  nom: string;
  type: TypeVehicule;
  capacite_personnes: number | null;
  actif: boolean;
}

export interface Tarif {
  id: string;
  categorie_id: string;
  palier: PalierTarif;
  prix_usd: number;
}

export interface CategorieAvecTarifs extends CategorieVehicule {
  tarifs: Record<PalierTarif, number | null>;
}

export interface Vehicule {
  id: string;
  categorie_id: string;
  plaque: string;
  annee: number | null;
  photo_url: string | null;
  etat_operationnel: EtatOperationnel;
  notes: string | null;
  actif: boolean;
}

export interface Profile {
  id: string;
  nom: string;
  role: RoleStaff;
}
