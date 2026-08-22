import { getAdminTranslator } from "@/lib/admin-i18n";
import { ClienteForm } from "@/components/admin/ClienteForm";

export default async function NuevoClientePage() {
  const t = await getAdminTranslator("admin.clients");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">{t("new")}</h1>
      <ClienteForm />
    </div>
  );
}
