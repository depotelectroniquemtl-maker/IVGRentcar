// Checklist d'accessoires du contrat papier IVJ, reprise telle quelle (mêmes libellés,
// même ordre) — ce sont des termes du document légal espagnol original, pas du texte
// d'interface à traduire selon la langue de l'admin. Les clés stables (accessoires jsonb)
// sont dérivées une fois pour toutes ici, partagées entre le formulaire et l'impression.
// Ordre exact de la grille à 4 colonnes du document papier (23 items, dernière ligne
// incomplète à 3) — ne pas réordonner, le rendu grid-cols-4 de la page imprimable en
// dépend directement pour reproduire les mêmes lignes que l'original.
export const ACCESSOIRES_CONTRAT = [
  { key: "aire_acondicionado", label: "Aire Acondicionado" },
  { key: "documentos", label: "Documentos" },
  { key: "llaveros", label: "Llaveros" },
  { key: "alfombra", label: "Alfombra" },
  { key: "encendedor", label: "Encendedor" },
  { key: "micas", label: "Micas" },
  { key: "antena", label: "Antena" },
  { key: "espejos", label: "Espejos" },
  { key: "radios", label: "Radios" },
  { key: "asientos", label: "Asientos" },
  { key: "gato", label: "Gato" },
  { key: "tapa_bocinas", label: "Tapa Bocinas" },
  { key: "bateria", label: "Batería" },
  { key: "goma_repuesto", label: "Goma De Repuesto" },
  { key: "tapa_gasolina", label: "Tapa Gasolina" },
  { key: "bocinas", label: "Bocinas" },
  { key: "limpia_brisas", label: "Limpia Brisas" },
  { key: "placa", label: "Placa" },
  { key: "cinturones", label: "Cinturones" },
  { key: "logos", label: "Logos" },
  { key: "revistas", label: "Revistas" },
  { key: "vidrios", label: "Vidrios" },
  { key: "llaveros_rueda", label: "Llaveros De Rueda" },
] as const;

export const NIVEAUX_ESSENCE = ["E", "1/4", "1/2", "3/4", "F"] as const;
