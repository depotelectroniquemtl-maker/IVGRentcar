import { NextResponse } from "next/server";

// Ancienne route de notification, ouverte à tous et dont le contenu venait du navigateur.
// La notification part désormais de /api/demandes, après l'enregistrement et à partir des
// données enregistrées (voir src/lib/demandes/notification.ts). Conservée sans aucun effet
// pour qu'une page /reservar ouverte avant le déploiement, qui l'appelle encore sans attendre
// de réponse, ne provoque ni erreur visible ni courriel en double.
export async function POST() {
  return NextResponse.json({ ok: false, error: "gone" }, { status: 410 });
}
