import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/queries/profile";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { StatCard, tableCardClass, thClass, thNumClass, theadClass, trClass } from "@/components/admin/admin-ui";

// Écran réservé aux admins — données financières, même logique de garde que /utilisateurs.
export default async function RentabilitePage({
  searchParams,
}: {
  searchParams: Promise<{ debut?: string; fin?: string }>;
}) {
  const { debut, fin } = await searchParams;
  const profile = await getCurrentProfile();
  const tCommon = await getAdminTranslator("admin.common");

  if (profile?.role !== "admin") {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <p className="text-ink">{tCommon("access_restricted")}</p>
      </div>
    );
  }

  const t = await getAdminTranslator("admin.rentabilite");
  const tReservations = await getAdminTranslator("admin.reservations");
  const supabase = createClient();

  const [{ data: vehicules }, { data: reservations }, { data: contrats }, { data: entretiens }] =
    await Promise.all([
      supabase
        .from("vehicules")
        .select("id, plaque, actif, solde_achat_usd, categories_vehicules(nom)"),
      supabase
        .from("reservations")
        .select("vehicule_id, prix_total_usd, statut, date_debut")
        .neq("statut", "annulee"),
      supabase
        .from("contrats_location")
        .select("solde_usd, reservations(vehicule_id, date_debut, statut)"),
      supabase.from("entretiens").select("vehicule_id, cout_usd, date_entretien"),
    ]);

  // Filtrage de période côté JS plutôt qu'en base — même choix que le reste de l'admin
  // (recherche, pagination) : volumes de données réels assez petits pour que ce soit
  // largement suffisant, et ça évite trois requêtes distinctes avec des filtres imbriqués
  // différents sur la table jointe reservations.
  const dansLaPeriode = (date: string | null) => {
    if (!date) return false;
    if (debut && date < debut) return false;
    if (fin && date > fin) return false;
    return true;
  };

  const revenuParVehicule = new Map<string, number>();
  const reservationsParVehicule = new Map<string, number>();
  for (const r of reservations ?? []) {
    if (!dansLaPeriode(r.date_debut)) continue;
    revenuParVehicule.set(r.vehicule_id, (revenuParVehicule.get(r.vehicule_id) ?? 0) + (r.prix_total_usd ?? 0));
    reservationsParVehicule.set(r.vehicule_id, (reservationsParVehicule.get(r.vehicule_id) ?? 0) + 1);
  }

  const resteParVehicule = new Map<string, number>();
  for (const c of contrats ?? []) {
    const resa = c.reservations;
    if (!resa || resa.statut === "annulee" || !dansLaPeriode(resa.date_debut)) continue;
    if (!c.solde_usd || c.solde_usd <= 0) continue;
    resteParVehicule.set(resa.vehicule_id, (resteParVehicule.get(resa.vehicule_id) ?? 0) + c.solde_usd);
  }

  const coutParVehicule = new Map<string, number>();
  for (const e of entretiens ?? []) {
    if (!dansLaPeriode(e.date_entretien)) continue;
    coutParVehicule.set(e.vehicule_id, (coutParVehicule.get(e.vehicule_id) ?? 0) + (e.cout_usd ?? 0));
  }

  const lignes = (vehicules ?? [])
    .map((v) => {
      const revenu = revenuParVehicule.get(v.id) ?? 0;
      const reste = resteParVehicule.get(v.id) ?? 0;
      const cout = coutParVehicule.get(v.id) ?? 0;
      return {
        id: v.id,
        nom: `${v.categories_vehicules?.nom ?? tCommon("dash")} (${v.plaque ?? tCommon("dash")})`,
        actif: v.actif,
        reservations: reservationsParVehicule.get(v.id) ?? 0,
        revenu,
        reste,
        cout,
        net: revenu - cout,
        soldeAchat: v.solde_achat_usd ?? 0,
      };
    })
    .filter((l) => l.reservations > 0 || l.cout > 0 || l.soldeAchat > 0)
    .sort((a, b) => b.revenu - a.revenu);

  const totaux = lignes.reduce(
    (acc, l) => ({
      revenu: acc.revenu + l.revenu,
      reste: acc.reste + l.reste,
      cout: acc.cout + l.cout,
      net: acc.net + l.net,
      soldeAchat: acc.soldeAchat + l.soldeAchat,
    }),
    { revenu: 0, reste: 0, cout: 0, net: 0, soldeAchat: 0 },
  );

  const fmt = (n: number) => `US$ ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
        <p className="mt-1 text-sm text-ink-soft">{t("subtitle")}</p>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border border-black/10 bg-white p-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">{tReservations("field_fecha_inicio")}</span>
          <input
            type="date"
            name="debut"
            defaultValue={debut ?? ""}
            className="rounded-md border border-black/20 px-3 py-2 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">{tReservations("field_fecha_fin")}</span>
          <input
            type="date"
            name="fin"
            defaultValue={fin ?? ""}
            className="rounded-md border border-black/20 px-3 py-2 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          {t("filter_submit")}
        </button>
        {(debut || fin) && (
          <a href="/admin/rentabilite" className="text-sm font-medium text-ink-soft hover:text-brand hover:underline">
            {t("filter_reset")}
          </a>
        )}
        {!debut && !fin && <span className="text-xs text-ink-soft">{t("filter_hint_all_time")}</span>}
      </form>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label={t("stat_revenu")} value={fmt(totaux.revenu)} tone="neutral" />
        <StatCard label={t("stat_reste")} value={fmt(totaux.reste)} tone="warn" />
        <StatCard label={t("stat_couts")} value={fmt(totaux.cout)} tone="crit" />
        <StatCard label={t("stat_net")} value={fmt(totaux.net)} tone="neutral" />
        <StatCard label={t("stat_solde_achat")} value={fmt(totaux.soldeAchat)} tone="muted" />
      </div>

      <div className={tableCardClass}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className={theadClass}>
              <tr>
                <th className={thClass}>{t("col_vehiculo")}</th>
                <th className={thNumClass}>{t("col_reservas")}</th>
                <th className={thNumClass}>{t("col_revenu")}</th>
                <th className={thNumClass}>{t("col_reste")}</th>
                <th className={thNumClass}>{t("col_entretien")}</th>
                <th className={thNumClass}>{t("col_net")}</th>
                <th className={thNumClass}>{t("col_solde_achat")}</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((l) => (
                <tr key={l.id} className={trClass}>
                  <td className="px-4 py-3 font-medium text-ink">
                    {l.nom}
                    {!l.actif && (
                      <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-ink-soft">
                        {tCommon("no")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{l.reservations}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmt(l.revenu)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-amber-700">
                    {l.reste > 0 ? fmt(l.reste) : tCommon("dash")}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-red-700">
                    {l.cout > 0 ? fmt(l.cout) : tCommon("dash")}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-ink">{fmt(l.net)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink-soft">
                    {l.soldeAchat > 0 ? fmt(l.soldeAchat) : tCommon("dash")}
                  </td>
                </tr>
              ))}
              {lignes.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-ink-soft">
                    {t("empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="max-w-[70ch] text-xs text-ink-soft">{t("footnote")}</p>
    </div>
  );
}
