import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { ContratPrintable } from "@/components/admin/ContratPrintable";
import { PrintButton } from "@/components/admin/PrintButton";
import { secondaryLinkClass } from "@/components/admin/form-ui";

function joursEntre(dateDebut: string, dateFin: string) {
  const debut = new Date(dateDebut + "T00:00:00");
  const fin = new Date(dateFin + "T00:00:00");
  const jours = Math.round((fin.getTime() - debut.getTime()) / 86400000);
  return Math.max(jours, 1);
}

// Titre de document dédié pour cette page : sert de fallback si l'utilisateur imprime
// avec les en-têtes/pieds de page du navigateur activés, et surtout Chrome s'en sert
// comme nom de fichier suggéré pour "Enregistrer en PDF" — d'où le format
// "Contrato IVJ #142 - Nom Client" plutôt que le titre générique du layout admin.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = createClient();
  const { data: reservation } = await supabase
    .from("reservations")
    .select("numero, clients(nom)")
    .eq("id", id)
    .single();

  if (!reservation) return {};

  return {
    title: `Contrato IVJ #${reservation.numero} - ${reservation.clients?.nom ?? ""}`,
  };
}

export default async function ContratImprimablePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient();
  const t = await getAdminTranslator("admin.contrats");

  const { data: reservation } = await supabase
    .from("reservations")
    .select(
      "id, numero, date_debut, date_fin, prix_total_usd, clients(nom, adresse, telephone, nationalite, cedula, residencia, passeport, passeport_expiration, numero_permis, permis_expiration), vehicules(plaque, couleur, categories_vehicules(nom))",
    )
    .eq("id", id)
    .single();

  if (!reservation || !reservation.clients || !reservation.vehicules) notFound();

  const { data: contrat } = await supabase
    .from("contrats_location")
    .select(
      "heure_remise, couleur_vehicule, deducible_usd, abono_usd, solde_usd, niveau_essence, accessoires, garant_nom, garant_adresse, garant_cedula, garant_telephone",
    )
    .eq("reservation_id", id)
    .maybeSingle();

  const dias = joursEntre(reservation.date_debut, reservation.date_fin);
  const precioPorDia =
    reservation.prix_total_usd != null ? Math.round((reservation.prix_total_usd / dias) * 100) / 100 : null;

  const donnees = {
    cliente: {
      nom: reservation.clients.nom,
      adresse: reservation.clients.adresse,
      telephone: reservation.clients.telephone,
      nationalite: reservation.clients.nationalite,
      cedula: reservation.clients.cedula,
      residencia: reservation.clients.residencia,
      passeport: reservation.clients.passeport,
      passeportExpiration: reservation.clients.passeport_expiration,
      numeroPermis: reservation.clients.numero_permis,
      permisExpiration: reservation.clients.permis_expiration,
    },
    vehicule: {
      categorieNom: reservation.vehicules.categories_vehicules?.nom ?? "",
      plaque: reservation.vehicules.plaque,
      couleur: reservation.vehicules.couleur,
    },
    reservation: {
      dateDebut: reservation.date_debut,
      dateFin: reservation.date_fin,
      diasRentado: dias,
      precioPorDia,
    },
    contrat: contrat
      ? {
          heureRemise: contrat.heure_remise,
          couleurVehicule: contrat.couleur_vehicule,
          deducibleUsd: contrat.deducible_usd,
          abonoUsd: contrat.abono_usd,
          soldeUsd: contrat.solde_usd,
          niveauEssence: contrat.niveau_essence,
          accessoires: (contrat.accessoires as Record<string, boolean>) ?? {},
          garantNom: contrat.garant_nom,
          garantAdresse: contrat.garant_adresse,
          garantCedula: contrat.garant_cedula,
          garantTelephone: contrat.garant_telephone,
        }
      : null,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link href={`/admin/reservations/${id}`} className={secondaryLinkClass}>
          {t("back_to_reservation")}
        </Link>
        <div className="flex gap-3">
          <Link href={`/admin/reservations/${id}/contrat/editar`} className={secondaryLinkClass}>
            {t("edit_link")}
          </Link>
          <PrintButton>{t("print_button")}</PrintButton>
        </div>
      </div>

      <div className="flex flex-col gap-8 print:gap-0">
        <div className="print:break-after-page">
          <ContratPrintable data={{ ...donnees, copyLabel: "Copia Cliente" }} />
        </div>
        <ContratPrintable data={{ ...donnees, copyLabel: "Copia Compañía" }} />
      </div>
    </div>
  );
}
