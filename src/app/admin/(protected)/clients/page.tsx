import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { EditRowLink, tableCardClass, thClass, theadClass, trClass } from "@/components/admin/admin-ui";
import { SearchInput } from "@/components/admin/SearchInput";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: qRaw } = await searchParams;
  const q = qRaw?.trim().toLowerCase() ?? "";
  const supabase = createClient();
  const t = await getAdminTranslator("admin.clients");
  const tCommon = await getAdminTranslator("admin.common");

  const { data: clients, error } = await supabase
    .from("clients")
    .select("id, nom, telephone, email, numero_permis")
    .order("nom");

  const clientsFiltrados = q
    ? clients?.filter((c) =>
        [c.nom, c.telephone, c.email, c.numero_permis]
          .filter((v): v is string => Boolean(v))
          .some((v) => v.toLowerCase().includes(q)),
      )
    : clients;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
          <p className="mt-1 text-sm text-ink-soft">{t("subtitle", { count: clients?.length ?? 0 })}</p>
        </div>
        <Link
          href="/admin/clients/nuevo"
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          {t("new")}
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <SearchInput placeholder={t("search_placeholder")} />

      <div className={tableCardClass}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className={theadClass}>
              <tr>
                <th className={thClass}>{t("col_nombre")}</th>
                <th className={thClass}>{t("col_telefono")}</th>
                <th className={thClass}>{t("col_correo")}</th>
                <th className={thClass}>{t("col_licencia")}</th>
                <th className={`${thClass} text-right`}>{t("col_acciones")}</th>
              </tr>
            </thead>
            <tbody>
              {clientsFiltrados?.map((c) => (
                <tr key={c.id} className={trClass}>
                  <td className="px-4 py-3 font-medium text-ink">{c.nom}</td>
                  <td className="px-4 py-3">{c.telephone ?? tCommon("dash")}</td>
                  <td className="px-4 py-3">{c.email ?? tCommon("dash")}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">
                    {c.numero_permis ?? tCommon("dash")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <EditRowLink href={`/admin/clients/${c.id}`} title={tCommon("edit")} />
                    </div>
                  </td>
                </tr>
              ))}
              {clientsFiltrados?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-ink-soft">
                    {q ? tCommon("no_results") : t("empty")}
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
