import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { EditRowLink, tableCardClass, thClass, theadClass, trClass } from "@/components/admin/admin-ui";
import { SearchInput } from "@/components/admin/SearchInput";

export default async function GarantesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: qRaw } = await searchParams;
  const q = qRaw?.trim().toLowerCase() ?? "";
  const supabase = createClient();
  const t = await getAdminTranslator("admin.garantes");
  const tCommon = await getAdminTranslator("admin.common");

  const { data: garantes, error } = await supabase
    .from("garants")
    .select("id, nom, telephone, cedula")
    .order("nom");

  const garantesFiltrados = q
    ? garantes?.filter((g) =>
        [g.nom, g.telephone, g.cedula]
          .filter((v): v is string => Boolean(v))
          .some((v) => v.toLowerCase().includes(q)),
      )
    : garantes;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
          <p className="mt-1 text-sm text-ink-soft">{t("subtitle", { count: garantes?.length ?? 0 })}</p>
        </div>
        <Link
          href="/admin/garantes/nuevo"
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          {t("new")}
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <SearchInput placeholder={t("search_placeholder")} />

      <div className={tableCardClass}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className={theadClass}>
              <tr>
                <th className={thClass}>{t("col_nombre")}</th>
                <th className={thClass}>{t("col_telefono")}</th>
                <th className={thClass}>{t("col_cedula")}</th>
                <th className={`${thClass} text-right`}>{t("col_acciones")}</th>
              </tr>
            </thead>
            <tbody>
              {garantesFiltrados?.map((g) => (
                <tr key={g.id} className={trClass}>
                  <td className="px-4 py-3 font-medium text-ink">{g.nom}</td>
                  <td className="px-4 py-3">{g.telephone ?? tCommon("dash")}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">
                    {g.cedula ?? tCommon("dash")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <EditRowLink href={`/admin/garantes/${g.id}`} title={tCommon("edit")} />
                    </div>
                  </td>
                </tr>
              ))}
              {garantesFiltrados?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-ink-soft">
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
