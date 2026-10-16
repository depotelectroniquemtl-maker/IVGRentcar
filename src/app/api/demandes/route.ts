import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { isCountryCode, normalizePhone } from "@/lib/phone";

const LANGUES = ["fr", "en", "es"] as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const HEURE = /^\d{2}:\d{2}$/;

const texte = (v: unknown, max: number): string | null =>
  typeof v === "string" && v.trim() && v.length <= max ? v.trim() : null;

// Enregistre une demande de réservation du site public. Le numéro WhatsApp est revalidé ici
// (le navigateur n'est pas digne de confiance) puis stocké uniquement en E.164. L'insertion
// reste faite avec la clé publique : la policy "demandes_insert_public" s'applique comme avant.
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const pays = body.whatsapp_country;
  if (!isCountryCode(pays) || typeof body.whatsapp !== "string") {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }
  const phone = normalizePhone(body.whatsapp, pays);
  if (!phone.ok) {
    return NextResponse.json({ ok: false, error: `phone_${phone.error}` }, { status: 422 });
  }

  const nom = texte(body.nom, 200);
  const email = body.email == null || body.email === "" ? null : texte(body.email, 254);
  const vehiculeId = typeof body.vehicule_id === "string" ? body.vehicule_id : "";
  const dateDebut = typeof body.date_debut === "string" ? body.date_debut : "";
  const dateFin = typeof body.date_fin === "string" ? body.date_fin : "";
  const langue = LANGUES.find((l) => l === body.langue) ?? null;
  const prix = typeof body.prix_estime_usd === "number" ? body.prix_estime_usd : null;
  const heureDebut = typeof body.heure_debut === "string" ? body.heure_debut : null;
  const heureFin = typeof body.heure_fin === "string" ? body.heure_fin : null;

  if (
    !nom ||
    (body.email && !email) ||
    !UUID.test(vehiculeId) ||
    !DATE.test(dateDebut) ||
    !DATE.test(dateFin) ||
    dateFin < dateDebut ||
    (heureDebut && !HEURE.test(heureDebut)) ||
    (heureFin && !HEURE.test(heureFin))
  ) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { error } = await supabase.from("demandes_reservation").insert({
    nom,
    whatsapp: phone.e164,
    email,
    vehicule_id: vehiculeId,
    date_debut: dateDebut,
    date_fin: dateFin,
    heure_debut: heureDebut,
    heure_fin: heureFin,
    lieu_prise_en_charge: texte(body.lieu_prise_en_charge, 500),
    notes: texte(body.notes, 2000),
    prix_estime_usd: prix,
    langue,
  });

  if (error) {
    console.error("Erreur d'enregistrement de la demande:", error.message);
    return NextResponse.json({ ok: false, error: "save_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, whatsapp: phone.e164 });
}
