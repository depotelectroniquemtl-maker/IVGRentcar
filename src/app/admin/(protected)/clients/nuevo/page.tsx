import { getAdminTranslator } from "@/lib/admin-i18n";
import { ClienteForm } from "@/components/admin/ClienteForm";

// Paramètres facultatifs : fiche créée depuis le panneau d'une demande (/admin/demandes),
// préremplie avec ses coordonnées, avec retour sur la demande après l'enregistrement.
export default async function NuevoClientePage({
  searchParams,
}: {
  searchParams: Promise<{ nom?: string; telephone?: string; email?: string; demande?: string }>;
}) {
  const { nom, telephone, email, demande } = await searchParams;
  const t = await getAdminTranslator("admin.clients");
  const demandeId = demande && /^[0-9a-f-]{36}$/i.test(demande) ? demande : null;

  return (
    <ClienteForm
      title={t("new")}
      prefill={{ nom, telephone, email }}
      retour={demandeId ? `/admin/demandes?d=${demandeId}` : undefined}
    />
  );
}
