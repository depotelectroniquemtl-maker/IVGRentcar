import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";

export default async function ClientsPage() {
  const supabase = createClient();
  const t = await getAdminTranslator("admin.clients");
  const tCommon = await getAdminTranslator("admin.common");

  const { data: clients, error } = await supabase
    .from("clients")
    .select("id, nom, telephone, email, numero_permis")
    .order("nom");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
        <Link
          href="/admin/clients/nuevo"
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          {t("new")}
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-black/5 text-ink-soft">
            <tr>
              <th className="px-4 py-3">{t("col_nombre")}</th>
              <th className="px-4 py-3">{t("col_telefono")}</th>
              <th className="px-4 py-3">{t("col_correo")}</th>
              <th className="px-4 py-3">{t("col_licencia")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {clients?.map((c) => (
              <tr key={c.id} className="border-t border-black/5">
                <td className="px-4 py-3 font-medium text-ink">{c.nom}</td>
                <td className="px-4 py-3">{c.telephone ?? tCommon("dash")}</td>
                <td className="px-4 py-3">{c.email ?? tCommon("dash")}</td>
                <td className="px-4 py-3">{c.numero_permis ?? tCommon("dash")}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/clients/${c.id}`} className="text-brand hover:underline">
                    {tCommon("edit")}
                  </Link>
                </td>
              </tr>
            ))}
            {clients?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-soft">
                  {t("empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
