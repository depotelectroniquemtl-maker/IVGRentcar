"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { chercherCandidats, type Candidat } from "@/lib/demandes/correspondance";
import { estLangue } from "@/lib/demandes/libelles";
import { ChoixFicheClient } from "@/components/admin/ChoixFicheClient";

export type DemandeAConvertir = {
  id: string;
  nom: string;
  whatsapp: string | null;
  whatsappAVerifier: boolean;
  email: string | null;
  langue: string | null;
  clientId: string | null;
  vehiculeId: string;
  dateDebut: string;
  dateFin: string;
  heureDebut?: string;
  heureFin?: string;
  lieu?: string;
  prix?: string;
};

// Convertir une demande en réservation suppose une fiche client. La fiche est trouvée avec la
// logique commune (lib/demandes/correspondance.ts) : client déjà lié à la demande, sinon fiches
// au même téléphone normalisé ou au même courriel. Une fiche existante n'est utilisée qu'après
// confirmation ; s'il y en a plusieurs, rien n'est choisi ni créé sans choix explicite. Sans
// aucune fiche, elle est créée (langue de la demande). Dans tous les cas, client_id de la
// demande est renseigné, puis le formulaire de réservation s'ouvre prérempli (demande_id).
export function ConvertirDemandeButton({
  label,
  className = "inline-flex items-center rounded-md bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand-dark transition-colors hover:bg-brand/20 disabled:opacity-50",
  demande,
  onChoixAffiche,
}: {
  label: string;
  className?: string;
  demande: DemandeAConvertir;
  // Prévient le panneau qu'un choix de fiche est affiché (pour ne pas le répéter ailleurs).
  onChoixAffiche?: (affiche: boolean) => void;
}) {
  const router = useRouter();
  const t = useTranslations("admin.demandes");
  const [loading, setLoading] = useState(false);
  const [candidats, setCandidats] = useState<Candidat[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  function ouvrirReservation(clientId: string) {
    const params = new URLSearchParams({
      client_id: clientId,
      vehicule_id: demande.vehiculeId,
      date_debut: demande.dateDebut,
      date_fin: demande.dateFin,
      demande_id: demande.id,
      demande_nom: demande.nom,
      demande_whatsapp: demande.whatsapp ?? demande.email ?? "",
    });
    if (demande.heureDebut) params.set("heure_debut", demande.heureDebut);
    if (demande.heureFin) params.set("heure_fin", demande.heureFin);
    if (demande.lieu) params.set("lieu", demande.lieu);
    if (demande.prix) params.set("prix", demande.prix);
    router.push(`/admin/reservations/nueva?${params.toString()}`);
  }

  async function lierPuisOuvrir(clientId: string) {
    setLoading(true);
    const { error } = await createClient()
      .from("demandes_reservation")
      .update({ client_id: clientId })
      .eq("id", demande.id);
    if (error) {
      setLoading(false);
      setErreur(t("erreur_lien_client"));
      return;
    }
    ouvrirReservation(clientId);
  }

  async function creerPuisOuvrir() {
    setLoading(true);
    const { data: nouveau, error } = await createClient()
      .from("clients")
      .insert({
        nom: demande.nom,
        telephone: demande.whatsapp,
        telephone_a_verifier: demande.whatsappAVerifier,
        email: demande.email,
        langue: estLangue(demande.langue) ? demande.langue : null,
      })
      .select("id")
      .single();
    if (error || !nouveau) {
      setLoading(false);
      setErreur(t("erreur_creation_client"));
      return;
    }
    await lierPuisOuvrir(nouveau.id);
  }

  async function handleClick() {
    setErreur(null);
    if (demande.clientId) {
      setLoading(true);
      ouvrirReservation(demande.clientId);
      return;
    }
    setLoading(true);
    const { candidats: trouves, error } = await chercherCandidats(createClient(), {
      telephone: demande.whatsapp,
      email: demande.email,
    });
    if (error || !trouves) {
      setLoading(false);
      setErreur(t("erreur_recherche_clients"));
      return;
    }
    if (trouves.length === 0) {
      await creerPuisOuvrir();
      return;
    }
    setLoading(false);
    setCandidats(trouves);
    onChoixAffiche?.(true);
  }

  return (
    <>
      <button type="button" onClick={handleClick} disabled={loading} className={className}>
        {loading ? "…" : label}
      </button>
      {candidats && (
        <div className="w-full" data-conversion>
          <ChoixFicheClient
            candidats={candidats}
            mode="action"
            enCours={loading}
            onUtiliser={(id) => lierPuisOuvrir(id)}
            onCreer={() => creerPuisOuvrir()}
          />
        </div>
      )}
      {erreur && (
        <p role="alert" className="w-full text-sm text-red-800">
          {erreur}
        </p>
      )}
    </>
  );
}
