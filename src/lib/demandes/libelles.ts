// Valeurs autorisées par la base (migration 0036) : source d'une demande, motif « sans suite ».
export const SOURCES = ["site", "whatsapp", "courriel", "telephone", "comptoir", "autre"] as const;
export type Source = (typeof SOURCES)[number];
// Sources proposées à la saisie manuelle : « site » est réservé au formulaire public.
export const SOURCES_MANUELLES = SOURCES.filter((s): s is Exclude<Source, "site"> => s !== "site");

export const MOTIFS = ["prix", "indisponible", "pas_de_reponse", "client_annule", "autre"] as const;
export type Motif = (typeof MOTIFS)[number];

export const LANGUES = ["fr", "en", "es"] as const;
export type Langue = (typeof LANGUES)[number];

export const estSource = (v: string): v is Source => (SOURCES as readonly string[]).includes(v);
export const estMotif = (v: string): v is Motif => (MOTIFS as readonly string[]).includes(v);
export const estLangue = (v: string | null | undefined): v is Langue =>
  !!v && (LANGUES as readonly string[]).includes(v);
