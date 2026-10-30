// Correspondance demande ↔ fiches clients : UNE seule logique, utilisée par la saisie manuelle
// d'une demande, la conversion en réservation et « Créer la fiche client ».
//
// Une fiche est candidate si son téléphone NORMALISÉ est identique à celui de la demande, ou
// si son courriel est identique (casse et espaces ignorés). Le téléphone d'une fiche est
// normalisé avec normalizePhone uniquement s'il est écrit au format international (« + » ou
// « 00 ») : son indicatif est alors connu. Un numéro national (« 514 555 0101 ») ne permet pas
// de connaître le pays : il n'est jamais deviné, la fiche ne correspond alors que par courriel.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { isE164, normalizePhone } from "@/lib/phone";

export type FicheClient = { id: string; nom: string; telephone: string | null; email: string | null; langue: string | null };
export type Candidat = { id: string; nom: string; langue: string | null; parTelephone: boolean; parCourriel: boolean };
export type CritereContact = { telephone: string | null; email: string | null };

// E.164 si le numéro est déjà normalisé ou écrit au format international, sinon null.
export function telephoneNormalise(brut: string | null): string | null {
  const v = brut?.trim();
  if (!v) return null;
  if (isE164(v)) return v;
  if (!v.startsWith("+") && !v.startsWith("00")) return null;
  // « 00 » est le préfixe international : équivalent de « + ». Le pays passé ici n'est pas
  // utilisé, un numéro international porte son propre indicatif.
  const r = normalizePhone(v.startsWith("00") ? `+${v.slice(2)}` : v, "US");
  return r.ok ? r.e164 : null;
}

export function courrielNormalise(brut: string | null): string | null {
  const v = brut?.replace(/\s+/g, "").toLowerCase();
  return v ? v : null;
}

export function trouverCandidats(critere: CritereContact, fiches: FicheClient[]): Candidat[] {
  const tel = telephoneNormalise(critere.telephone);
  const mail = courrielNormalise(critere.email);
  if (!tel && !mail) return [];
  return fiches.flatMap((f) => {
    const parTelephone = !!tel && telephoneNormalise(f.telephone) === tel;
    const parCourriel = !!mail && courrielNormalise(f.email) === mail;
    return parTelephone || parCourriel
      ? [{ id: f.id, nom: f.nom, langue: f.langue, parTelephone, parCourriel }]
      : [];
  });
}

// Fiches dont le téléphone est renseigné mais ne peut pas être normalisé sans deviner le pays.
export function fichesNonNormalisables(fiches: FicheClient[]): FicheClient[] {
  return fiches.filter((f) => f.telephone?.trim() && !telephoneNormalise(f.telephone));
}

type Supabase = SupabaseClient<Database>;

// Toutes les fiches sont lues (quelques dizaines) : les téléphones enregistrés dans des formats
// variés ne peuvent pas être comparés par une simple requête.
export async function chercherCandidats(supabase: Supabase, critere: CritereContact) {
  const { data, error } = await supabase.from("clients").select("id, nom, telephone, email, langue");
  if (error) return { candidats: null, error };
  return { candidats: trouverCandidats(critere, data ?? []), error: null };
}

export type DemandeRecente = { id: string; nom: string; created_at: string };

// Demandes des 30 derniers jours avec le même téléphone normalisé ou le même courriel
// (avertissement à la saisie manuelle ; rien n'est fusionné).
export async function chercherDemandesRecentes(supabase: Supabase, critere: CritereContact, maintenant = new Date()) {
  const tel = telephoneNormalise(critere.telephone);
  const mail = courrielNormalise(critere.email);
  if (!tel && !mail) return { demandes: [] as DemandeRecente[], error: null };
  const depuis = new Date(maintenant.getTime() - 30 * 24 * 3600_000).toISOString();
  const { data, error } = await supabase
    .from("demandes_reservation")
    .select("id, nom, whatsapp, email, created_at")
    .gte("created_at", depuis)
    .order("created_at", { ascending: false });
  if (error) return { demandes: null, error };
  const demandes = (data ?? []).filter(
    (d) => (!!tel && telephoneNormalise(d.whatsapp) === tel) || (!!mail && courrielNormalise(d.email) === mail),
  );
  return { demandes: demandes.map(({ id, nom, created_at }) => ({ id, nom, created_at })), error: null };
}
