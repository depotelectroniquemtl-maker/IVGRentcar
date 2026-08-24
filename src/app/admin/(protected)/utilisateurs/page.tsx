import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/supabase/queries/profile";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { EditRowLink, Pill, tableCardClass, thClass, theadClass, trClass } from "@/components/admin/admin-ui";
import { SearchInput } from "@/components/admin/SearchInput";

// Écran réservé aux admins — la vérification se fait ici, côté serveur (pas seulement en
// cachant le lien dans la Sidebar). Un employé qui arriverait quand même sur cette URL
// voit un message de refus, et de toute façon la policy RLS "profiles_select_own_or_admin"
// l'empêcherait de voir les autres comptes.
export default async function UtilisateursPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: qRaw } = await searchParams;
  const q = qRaw?.trim().toLowerCase() ?? "";
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
  const supabase = createClient();
  const [{ data: usuarios, error }, { data: authData }] = await Promise.all([
    supabase.from("profiles").select("id, nom, role").order("nom"),
    createAdminClient().auth.admin.listUsers(),
  ]);

  const ahora = new Date();
  const baneados = new Set(
    authData?.users
      .filter((u) => u.banned_until && new Date(u.banned_until) > ahora)
      .map((u) => u.id) ?? [],
  );

  const usuariosFiltrados = q ? usuarios?.filter((u) => u.nom.toLowerCase().includes(q)) : usuarios;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
        <Link
          href="/admin/utilisateurs/nuevo"
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          {t("new")}
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <SearchInput placeholder={t("search_placeholder")} />

      <div className={tableCardClass}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className={theadClass}>
              <tr>
                <th className={thClass}>{t("col_nombre")}</th>
                <th className={thClass}>{t("col_rol")}</th>
                <th className={`${thClass} text-right`}>{t("col_acciones")}</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados?.map((u) => (
                <tr key={u.id} className={trClass}>
                  <td className="px-4 py-3 font-medium text-ink">
                    {u.nom}
                    {baneados.has(u.id) && (
                      <span className="ml-2 text-xs font-medium text-red-600">
                        · {t("estado_desactivado")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.role === "admin" ? (
                      <Pill className="bg-brand/10 text-brand-dark">{tCommon("role_admin")}</Pill>
                    ) : (
                      <Pill className="bg-black/5 text-ink-soft">{tCommon("role_employe")}</Pill>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <EditRowLink href={`/admin/utilisateurs/${u.id}`} title={tCommon("edit")} />
                    </div>
                  </td>
                </tr>
              ))}
              {usuariosFiltrados?.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-ink-soft">
                    {tCommon("no_results")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
