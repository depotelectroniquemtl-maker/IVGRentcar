import { getAdminTranslator } from "@/lib/admin-i18n";
import { ClienteForm } from "@/components/admin/ClienteForm";

export default async function NuevoClientePage() {
  const t = await getAdminTranslator("admin.clients");

  return <ClienteForm title={t("new")} />;
}
