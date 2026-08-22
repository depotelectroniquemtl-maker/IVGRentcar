import { getCurrentProfile } from "@/lib/supabase/queries/profile";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { UsuarioForm } from "@/components/admin/UsuarioForm";

export default async function NuevoUsuarioPage() {
  const profile = await getCurrentProfile();
  const tCommon = await getAdminTranslator("admin.common");

  if (profile?.role !== "admin") {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <p className="text-ink">{tCommon("access_restricted")}</p>
      </div>
    );
  }

  const t = await getAdminTranslator("admin.utilisateurs");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">{t("new")}</h1>
      <UsuarioForm />
    </div>
  );
}
