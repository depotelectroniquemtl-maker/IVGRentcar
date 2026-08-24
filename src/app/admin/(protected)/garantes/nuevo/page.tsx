import { getAdminTranslator } from "@/lib/admin-i18n";
import { GaranteForm } from "@/components/admin/GaranteForm";

export default async function NuevoGarantePage() {
  const t = await getAdminTranslator("admin.garantes");

  return <GaranteForm title={t("new")} />;
}
