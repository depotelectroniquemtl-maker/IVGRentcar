import { NextResponse } from "next/server";
import { Resend } from "resend";

// Notifie contact@ivjrentcar.com par e-mail à chaque demande envoyée depuis /reservar —
// remplace l'ancien flux WhatsApp (window.open côté client). La demande est déjà
// enregistrée dans demandes_reservation par ReservarForm avant cet appel : un échec ici
// (clé absente, envoi Resend en erreur) ne doit jamais empêcher le visiteur de voir l'écran
// de succès, la demande reste de toute façon visible dans le backoffice.
export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  const body = await request.json();
  const { nom, whatsapp, email, categoria, inicio, horaInicio, fin, horaFin, lugar, precio } =
    body as Record<string, string | null | undefined>;

  if (!nom || !whatsapp) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const lignes = [
    `Nom : ${nom}`,
    `WhatsApp : ${whatsapp}`,
    email ? `E-mail : ${email}` : null,
    categoria ? `Véhicule : ${categoria}` : null,
    inicio ? `Du : ${inicio}${horaInicio ? ` (${horaInicio})` : ""}` : null,
    fin ? `Au : ${fin}${horaFin ? ` (${horaFin})` : ""}` : null,
    lugar ? `Lieu de prise en charge : ${lugar}` : null,
    precio ? `Prix estimé : ${precio}` : null,
    "",
    "Voir et convertir cette demande : https://ivjrentcar.com/admin/demandes",
  ].filter((ligne): ligne is string => ligne !== null);

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "IVJ Polanco Rent a Car <reservas@ivjrentcar.com>",
      to: "contact@ivjrentcar.com",
      replyTo: email || undefined,
      subject: `Nouvelle demande de réservation — ${nom}`,
      text: lignes.join("\n"),
    });

    if (error) {
      console.error("Erreur d'envoi Resend:", error);
      return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erreur d'envoi Resend:", error);
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  }
}
