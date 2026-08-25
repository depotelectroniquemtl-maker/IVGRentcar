"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Convertir une demande en réservation suppose un client déjà existant dans la table
// clients — or une demande du site public vient presque toujours d'un nouveau visiteur.
// Avant, le bouton renvoyait simplement vers /reservations/nueva avec une liste de clients
// où le sien n'apparaissait jamais : impossible de continuer. On crée (ou retrouve, par
// numéro WhatsApp, pour éviter les doublons d'un client déjà connu) le client ici, puis on
// arrive sur le formulaire avec le client déjà sélectionné.
export function ConvertirDemandeButton({
  label,
  nom,
  whatsapp,
  email,
  vehiculeId,
  dateDebut,
  dateFin,
  heureDebut,
  heureFin,
  lieu,
  prix,
}: {
  label: string;
  nom: string;
  whatsapp: string;
  email: string | null;
  vehiculeId: string;
  dateDebut: string;
  dateFin: string;
  heureDebut?: string;
  heureFin?: string;
  lieu?: string;
  prix?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const supabase = createClient();

    const { data: existant } = await supabase
      .from("clients")
      .select("id")
      .eq("telephone", whatsapp)
      .maybeSingle();

    let clientId = existant?.id as string | undefined;

    if (!clientId) {
      const { data: nouveau, error } = await supabase
        .from("clients")
        .insert({ nom, telephone: whatsapp, email: email || null })
        .select("id")
        .single();

      if (error || !nouveau) {
        setLoading(false);
        return;
      }
      clientId = nouveau.id;
    }

    const params = new URLSearchParams({
      client_id: clientId,
      vehicule_id: vehiculeId,
      date_debut: dateDebut,
      date_fin: dateFin,
      demande_nom: nom,
      demande_whatsapp: whatsapp,
    });
    if (heureDebut) params.set("heure_debut", heureDebut);
    if (heureFin) params.set("heure_fin", heureFin);
    if (lieu) params.set("lieu", lieu);
    if (prix) params.set("prix", prix);

    router.push(`/admin/reservations/nueva?${params.toString()}`);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center rounded-md bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand-dark transition-colors hover:bg-brand/20 disabled:opacity-50"
    >
      {loading ? "…" : label}
    </button>
  );
}
