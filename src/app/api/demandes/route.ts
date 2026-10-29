import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCountryCode, normalizePhone } from "@/lib/phone";
import { origineAutorisee } from "@/lib/demandes/origine";
import { envoyerNotificationDemande } from "@/lib/demandes/notification";

const LANGUES = ["fr", "en", "es"] as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const HEURE = /^\d{2}:\d{2}$/;

// Un humain ne remplit pas nom, WhatsApp, catégorie, véhicule et dates en moins de 3 s.
const DELAI_MIN_REMPLISSAGE_MS = 3000;

// Codes levés par creer_demande_publique (supabase/migrations/0034_creer_demande_publique.sql).
const ERREURS_BASE: Record<string, { status: number; error: string }> = {
  demande_vehicule_indisponible: { status: 409, error: "unavailable" },
  demande_trop_de_demandes: { status: 429, error: "rate_limited" },
  demande_dates_invalides: { status: 400, error: "invalid_payload" },
  demande_champ_invalide: { status: 400, error: "invalid_payload" },
};

const invalide = () => NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });

// Texte facultatif : absent ou vide => null ; trop long => invalide (undefined).
const texteFacultatif = (v: unknown, max: number): string | null | undefined => {
  if (v == null || v === "") return null;
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  if (!t) return null;
  return t.length <= max ? t : undefined;
};

// Enregistre une demande de réservation du site public. Le navigateur n'est pas digne de
// confiance : le numéro est revalidé ici, puis la fonction creer_demande_publique (clé serveur
// uniquement) revalide tout, force le statut « nouvelle », revérifie la disponibilité, recalcule
// le prix et applique le seuil de 5 demandes par heure et par numéro. Le prix, le statut ou tout
// autre champ envoyé en plus par le navigateur est ignoré. La notification par courriel part
// d'ici, après l'enregistrement, à partir des données enregistrées.
export async function POST(request: Request) {
  if (!origineAutorisee(request)) {
    return NextResponse.json({ ok: false, error: "forbidden_origin" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return invalide();
  }
  if (!body || typeof body !== "object") return invalide();

  // Anti-robot : champ piège invisible rempli, ou formulaire envoyé trop vite. Les deux champs
  // sont facultatifs pour qu'une page /reservar ouverte avant ce déploiement reste utilisable.
  if (typeof body.champ_piege === "string" && body.champ_piege.trim() !== "") return invalide();
  if (
    typeof body.duree_remplissage_ms === "number" &&
    body.duree_remplissage_ms < DELAI_MIN_REMPLISSAGE_MS
  ) {
    return invalide();
  }

  const pays = body.whatsapp_country;
  if (!isCountryCode(pays) || typeof body.whatsapp !== "string") return invalide();
  const phone = normalizePhone(body.whatsapp, pays);
  if (!phone.ok) {
    return NextResponse.json({ ok: false, error: `phone_${phone.error}` }, { status: 422 });
  }

  const nom = texteFacultatif(body.nom, 200);
  const email = texteFacultatif(body.email, 254);
  const lieu = texteFacultatif(body.lieu_prise_en_charge, 500);
  const notes = texteFacultatif(body.notes, 2000);
  const vehiculeId = typeof body.vehicule_id === "string" ? body.vehicule_id : "";
  const dateDebut = typeof body.date_debut === "string" ? body.date_debut : "";
  const dateFin = typeof body.date_fin === "string" ? body.date_fin : "";
  const langue = LANGUES.find((l) => l === body.langue) ?? null;
  const heureDebut = typeof body.heure_debut === "string" ? body.heure_debut : null;
  const heureFin = typeof body.heure_fin === "string" ? body.heure_fin : null;

  if (
    !nom ||
    email === undefined ||
    lieu === undefined ||
    notes === undefined ||
    !UUID.test(vehiculeId) ||
    !DATE.test(dateDebut) ||
    !DATE.test(dateFin) ||
    dateFin < dateDebut ||
    (heureDebut && !HEURE.test(heureDebut)) ||
    (heureFin && !HEURE.test(heureFin))
  ) {
    return invalide();
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Enregistrement de la demande impossible : SUPABASE_SERVICE_ROLE_KEY absente");
    return NextResponse.json({ ok: false, error: "save_failed" }, { status: 500 });
  }

  const { data, error } = await createAdminClient().rpc("creer_demande_publique", {
    p_nom: nom,
    p_whatsapp: phone.e164,
    p_email: email,
    p_vehicule_id: vehiculeId,
    p_date_debut: dateDebut,
    p_date_fin: dateFin,
    p_heure_debut: heureDebut,
    p_heure_fin: heureFin,
    p_lieu_prise_en_charge: lieu,
    p_notes: notes,
    p_langue: langue,
  });

  const demande = data?.[0];
  if (error || !demande) {
    const connue = error ? ERREURS_BASE[error.message] : undefined;
    if (connue) {
      return NextResponse.json({ ok: false, error: connue.error }, { status: connue.status });
    }
    console.error("Erreur d'enregistrement de la demande:", error?.message ?? "aucune ligne");
    return NextResponse.json({ ok: false, error: "save_failed" }, { status: 500 });
  }

  await envoyerNotificationDemande({
    nom,
    whatsapp: phone.e164,
    email,
    categorie: demande.categorie_nom,
    dateDebut,
    heureDebut,
    dateFin,
    heureFin,
    lieu,
    notes,
    prixUsd: demande.prix_estime_usd,
  });

  return NextResponse.json({ ok: true, whatsapp: phone.e164 });
}
