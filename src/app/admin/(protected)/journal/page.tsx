import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/queries/profile";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { Pagination } from "@/components/admin/Pagination";
import { StatCard, tableCardClass, thClass, thNumClass, theadClass, trClass } from "@/components/admin/admin-ui";
import type { Json } from "@/lib/supabase/database.types";

const PAGE_SIZE = 50;

// Les 11 tables couvertes par le journal (voir supabase/migrations/0028_...).
// demandes_reservation n'a pas de trigger INSERT — soumis anonymement depuis le site
// public, ce n'est pas une action staff à journaliser.
const TABLES = [
  "profiles",
  "categories_vehicules",
  "tarifs",
  "vehicules",
  "clients",
  "reservations",
  "entretiens",
  "indisponibilites_vehicule",
  "contrats_location",
  "garants",
  "demandes_reservation",
] as const;

const OPERATIONS = ["INSERT", "UPDATE", "DELETE"] as const;

const OPERATION_TONE: Record<string, string> = {
  INSERT: "bg-green-100 text-green-800",
  UPDATE: "bg-blue-100 text-blue-800",
  DELETE: "bg-red-100 text-red-800",
};

// created_at/updated_at/id sont exclus du détail : bruit technique, jamais utile à un
// admin qui veut savoir "qu'est-ce qui a changé".
const CHAMPS_EXCLUS = new Set(["id", "created_at", "updated_at"]);

type LigneJournal = {
  id: string;
  created_at: string;
  nom_utilisateur: string | null;
  operation: string;
  table_cible: string;
  anciennes_valeurs: Json | null;
  nouvelles_valeurs: Json | null;
};

type Diff = { champ: string; avant: unknown; apres: unknown };

// Les triggers stockent des instantanés complets de la ligne (to_jsonb(OLD)/to_jsonb(NEW)),
// pas un diff pré-calculé — c'est ici qu'on ne garde que les champs réellement changés
// (UPDATE), ou tous les champs pour une création/suppression (rien à comparer).
function calculerDiff(avant: Json | null, apres: Json | null): Diff[] {
  const a = (avant ?? null) as Record<string, unknown> | null;
  const b = (apres ?? null) as Record<string, unknown> | null;

  if (a && b) {
    const champs = new Set([...Object.keys(a), ...Object.keys(b)]);
    const diffs: Diff[] = [];
    for (const champ of champs) {
      if (CHAMPS_EXCLUS.has(champ)) continue;
      if (JSON.stringify(a[champ]) !== JSON.stringify(b[champ])) {
        diffs.push({ champ, avant: a[champ], apres: b[champ] });
      }
    }
    return diffs;
  }

  const source = b ?? a ?? {};
  return Object.entries(source)
    .filter(([champ]) => !CHAMPS_EXCLUS.has(champ))
    .map(([champ, valeur]) => ({
      champ,
      avant: b ? undefined : valeur,
      apres: b ? valeur : undefined,
    }));
}

function formatDate(iso: string) {
  return iso.slice(0, 16).replace("T", " ");
}

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string; operation?: string; page?: string }>;
}) {
  const { table, operation, page: pageRaw } = await searchParams;
  const profile = await getCurrentProfile();
  const tCommon = await getAdminTranslator("admin.common");

  if (profile?.role !== "admin") {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <p className="text-ink">{tCommon("access_restricted")}</p>
      </div>
    );
  }

  const t = await getAdminTranslator("admin.journal");
  const supabase = createClient();

  const TABLE_LABELS: Record<string, string> = {
    profiles: t("table_profiles"),
    categories_vehicules: t("table_categories_vehicules"),
    tarifs: t("table_tarifs"),
    vehicules: t("table_vehicules"),
    clients: t("table_clients"),
    reservations: t("table_reservations"),
    entretiens: t("table_entretiens"),
    indisponibilites_vehicule: t("table_indisponibilites_vehicule"),
    contrats_location: t("table_contrats_location"),
    garants: t("table_garants"),
    demandes_reservation: t("table_demandes_reservation"),
  };
  const OPERATION_LABELS: Record<string, string> = {
    INSERT: t("operation_insert"),
    UPDATE: t("operation_update"),
    DELETE: t("operation_delete"),
  };

  const page = Math.max(1, Number(pageRaw) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let requete = supabase
    .from("journal_activite")
    .select(
      "id, created_at, nom_utilisateur, operation, table_cible, anciennes_valeurs, nouvelles_valeurs",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });
  if (table) requete = requete.eq("table_cible", table);
  if (operation) requete = requete.eq("operation", operation);

  const debutAujourdhui = new Date();
  debutAujourdhui.setUTCHours(0, 0, 0, 0);
  const finAujourdhui = new Date(debutAujourdhui);
  finAujourdhui.setUTCDate(finAujourdhui.getUTCDate() + 1);

  let requeteAujourdhui = supabase
    .from("journal_activite")
    .select("id", { count: "exact", head: true })
    .gte("created_at", debutAujourdhui.toISOString())
    .lt("created_at", finAujourdhui.toISOString());
  if (table) requeteAujourdhui = requeteAujourdhui.eq("table_cible", table);
  if (operation) requeteAujourdhui = requeteAujourdhui.eq("operation", operation);

  const [{ data: lignes, count: total, error }, { count: compteAujourdhui }] = await Promise.all([
    requete.range(from, to),
    requeteAujourdhui,
  ]);

  const totalPages = Math.max(1, Math.ceil((total ?? 0) / PAGE_SIZE));
  const pageActuelle = Math.min(page, totalPages);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={t("stat_total")} value={total ?? 0} tone="neutral" />
        <StatCard label={t("stat_hoy")} value={compteAujourdhui ?? 0} tone="neutral" />
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border border-black/10 bg-white p-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">{t("filtro_tabla")}</span>
          <select
            name="table"
            defaultValue={table ?? ""}
            className="rounded-md border border-black/20 px-3 py-2 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            <option value="">{t("filtro_todas")}</option>
            {TABLES.map((tbl) => (
              <option key={tbl} value={tbl}>
                {TABLE_LABELS[tbl]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">{t("filtro_operacion")}</span>
          <select
            name="operation"
            defaultValue={operation ?? ""}
            className="rounded-md border border-black/20 px-3 py-2 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            <option value="">{t("filtro_todas")}</option>
            {OPERATIONS.map((op) => (
              <option key={op} value={op}>
                {OPERATION_LABELS[op]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          {t("filtro_aplicar")}
        </button>
        {(table || operation) && (
          <a href="/admin/journal" className="text-sm font-medium text-ink-soft hover:text-brand hover:underline">
            {t("filtro_todas")}
          </a>
        )}
      </form>

      <div className={tableCardClass}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className={theadClass}>
              <tr>
                <th className={thClass}>{t("col_fecha")}</th>
                <th className={thClass}>{t("col_usuario")}</th>
                <th className={thClass}>{t("col_accion")}</th>
                <th className={thClass}>{t("col_tabla")}</th>
                <th className={thNumClass}>{t("col_detalles")}</th>
              </tr>
            </thead>
            <tbody>
              {(lignes as LigneJournal[] | null)?.map((l) => {
                const diff = calculerDiff(l.anciennes_valeurs, l.nouvelles_valeurs);
                return (
                  <tr key={l.id} className={trClass}>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-ink-soft">
                      {formatDate(l.created_at)}
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">
                      {l.nom_utilisateur ?? t("usuario_sistema")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${OPERATION_TONE[l.operation] ?? ""}`}
                      >
                        {OPERATION_LABELS[l.operation] ?? l.operation}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {TABLE_LABELS[l.table_cible] ?? l.table_cible}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <details className="group text-left">
                        <summary className="inline-block cursor-pointer text-sm font-semibold text-brand hover:underline">
                          {t("ver_detalles")}
                        </summary>
                        <div className="mt-2 flex flex-col gap-1.5 rounded-md bg-black/[0.02] p-3 text-xs">
                          {diff.length === 0 ? (
                            <p className="text-ink-soft">{t("sin_cambios")}</p>
                          ) : (
                            diff.map((d) => (
                              <div key={d.champ} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] items-baseline gap-2">
                                <code className="truncate text-[11px] text-ink-soft">{d.champ}</code>
                                <span className="truncate text-red-700 line-through">
                                  {formatValeur(d.avant, tCommon)}
                                </span>
                                <span className="truncate text-emerald-700">
                                  {formatValeur(d.apres, tCommon)}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </details>
                    </td>
                  </tr>
                );
              })}
              {(lignes?.length ?? 0) === 0 && (
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

      <Pagination
        page={pageActuelle}
        totalPages={totalPages}
        basePath="/admin/journal"
        searchParams={{ table, operation }}
        labelPrev={t("pagina_anterior")}
        labelNext={t("pagina_siguiente")}
      />
    </div>
  );
}

function formatValeur(v: unknown, tCommon: (key: string) => string): string {
  if (v === null || v === undefined) return tCommon("dash");
  if (typeof v === "boolean") return v ? tCommon("yes") : tCommon("no");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
