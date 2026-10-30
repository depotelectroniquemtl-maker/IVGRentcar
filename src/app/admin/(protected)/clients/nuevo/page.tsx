import { getAdminTranslator } from "@/lib/admin-i18n";
import { ClienteForm } from "@/components/admin/ClienteForm";

// Paramètres facultatifs : fiche créée depuis le panneau d'une demande (/admin/demandes),
// préremplie avec ses coordonnées et sa langue ; la demande est liée à la fiche créée, puis
// on revient sur la demande.
export default async function NuevoClientePage({
  searchParams,
}: {
  searchParams: Promise<{ nom?: string; telephone?: string; email?: string; langue?: string; demande?: string }>;
}) {
  const { nom, telephone, email, langue, demande } = await searchParams;
  const t = await getAdminTranslator("admin.clients");
  const demandeId = demande && /^[0-9a-f-]{36}$/i.test(demande) ? demande : null;

  return (
    <ClienteForm
      title={t("new")}
      prefill={{ nom, telephone, email, langue }}
      retour={demandeId ? `/admin/demandes?d=${demandeId}` : undefined}
      demandeId={demandeId ?? undefined}
    />
  );
}
