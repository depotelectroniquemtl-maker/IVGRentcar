import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/queries/profile";
import { getAdminLocale, getAdminTranslator } from "@/lib/admin-i18n";
import { groupeDeType, type GroupeVehicule } from "@/lib/vehicule-groupe";
import { StatCard, tableCardClass, thClass, thNumClass, theadClass, trClass } from "@/components/admin/admin-ui";
import { RentabiliteClientsListe, type LocationLigne } from "@/components/admin/RentabiliteClientsListe";
import { calcularFase } from "@/lib/reservation-fase";
import { aujourdhui, diffDays, formatDate, isIsoDate } from "@/lib/calendrier-dates";

type Categorie = "reel" | "avenir" | "attente";
const CATEGORIES: Categorie[] = ["reel", "avenir", "attente"];

// Écran réservé aux admins — données financières, même logique de garde que /utilisateurs.
export async function RentabiliteVue({
  groupe,
  searchParams,
}: {
  groupe: GroupeVehicule;
  searchParams: Promise<{ debut?: string; fin?: string; statuts?: string | string[] }>;
}) {
  const { debut, fin, statuts: statutsParam } = await searchParams;
  // Statuts affichés dans la liste (n'influencent pas les chiffres du rapport). Par défaut :
  // « en cours / terminées », soit exactement la règle du rapport.
  const demandes = (Array.isArray(statutsParam) ? statutsParam : [statutsParam ?? ""])
    .flatMap((v) => v.split(","))
    .map((v) => v.trim());
  const choisis = CATEGORIES.filter((c) => demandes.includes(c));
  const statutsActifs: Categorie[] = choisis.length > 0 ? choisis : ["reel"];
  const statutsEstDefaut = statutsActifs.length === 1 && statutsActifs[0] === "reel";
  const profile = await getCurrentProfile();
  const tCommon = await getAdminTranslator("admin.common");

  if (profile?.role !== "admin") {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <p className="text-ink">{tCommon("access_restricted")}</p>
      </div>
    );
  }

  const locale = await getAdminLocale();
  const t = await getAdminTranslator("admin.rentabilite");
  const tReservations = await getAdminTranslator("admin.reservations");
  const supabase = createClient();

  const [{ data: vehicules }, { data: reservations }, { data: contrats }, { data: entretiens }] =
    await Promise.all([
      supabase
        .from("vehicules")
        .select("id, plaque, actif, solde_achat_usd, categories_vehicules(nom, type)"),
      supabase
        .from("reservations")
        // Colonnes ajoutées (lecture seule) pour la liste des clients ; le calcul du rapport
        // ci-dessous n'utilise que vehicule_id, prix_total_usd et date_debut, comme avant.
        .select(
          "id, numero, vehicule_id, client_id, date_debut, date_fin, date_retour_reelle, prix_total_usd, statut, clients(nom)",
        )
        .neq("statut", "annulee"),
      supabase
        .from("contrats_location")
        .select(
          "solde_usd, reservations(vehicule_id, date_debut, date_fin, date_retour_reelle, statut)",
        ),
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

  // Seules les locations réellement en cours ou terminées comptent : sont exclues du rapport
  // comme de la liste des clients les réservations en attente (pas confirmées), à venir (pas
  // encore commencées) et en retard (date de fin dépassée, retour non confirmé). La phase est
  // celle de la liste des réservations ; « aujourd'hui » = jour civil de Las Terrenas.
  const aujourdhuiLocal = aujourdhui();
  const compte = (statut: string, debut: string, fin: string, retour: string | null) => {
    if (statut === "en_attente") return false;
    const fase = calcularFase(debut, fin, statut, retour, aujourdhuiLocal);
    return fase === "en_cours" || fase === "terminee";
  };

  // Classement exclusif d'une réservation non annulée : « en attente » (statut stocké) d'abord,
  // puis la phase calculée. Une réservation future en attente (ex. #45, #46) n'est donc comptée
  // qu'une fois, en « attente ». Les réservations en retard n'ont aucune catégorie.
  const categorieDe = (
    statut: string,
    debut: string,
    fin: string,
    retour: string | null,
  ): Categorie | null => {
    if (statut === "en_attente") return "attente";
    const fase = calcularFase(debut, fin, statut, retour, aujourdhuiLocal);
    if (fase === "en_cours" || fase === "terminee") return "reel";
    return fase === "a_venir" ? "avenir" : null;
  };

  const revenuParVehicule = new Map<string, number>();
  const reservationsParVehicule = new Map<string, number>();
  for (const r of reservations ?? []) {
    if (!dansLaPeriode(r.date_debut) ||
      !compte(r.statut, r.date_debut, r.date_fin, r.date_retour_reelle)
    )
      continue;
    revenuParVehicule.set(r.vehicule_id, (revenuParVehicule.get(r.vehicule_id) ?? 0) + (r.prix_total_usd ?? 0));
    reservationsParVehicule.set(r.vehicule_id, (reservationsParVehicule.get(r.vehicule_id) ?? 0) + 1);
  }

  const resteParVehicule = new Map<string, number>();
  for (const c of contrats ?? []) {
    const resa = c.reservations;
    if (!resa || resa.statut === "annulee" || !dansLaPeriode(resa.date_debut)) continue;
    if (!compte(resa.statut, resa.date_debut, resa.date_fin, resa.date_retour_reelle)) continue;
    if (!c.solde_usd || c.solde_usd <= 0) continue;
    resteParVehicule.set(resa.vehicule_id, (resteParVehicule.get(resa.vehicule_id) ?? 0) + c.solde_usd);
  }

  const coutParVehicule = new Map<string, number>();
  for (const e of entretiens ?? []) {
    if (!dansLaPeriode(e.date_entretien)) continue;
    coutParVehicule.set(e.vehicule_id, (coutParVehicule.get(e.vehicule_id) ?? 0) + (e.cout_usd ?? 0));
  }

  // Revenu à venir (confirmées à venir + en attente), par véhicule, sur la même période et la
  // même source de montant (prix_total_usd). Jamais ajouté au revenu, au net ni au net remboursé.
  const avenirParVehicule = new Map<string, number>();
  const nbAvenirParVehicule = new Map<string, number>();
  let nbAvenir = 0;
  let nbAttente = 0;
  const idsDuGroupe = new Set(
    (vehicules ?? [])
      .filter((v) => groupeDeType(v.categories_vehicules?.type) === groupe)
      .map((v) => v.id),
  );
  for (const r of reservations ?? []) {
    if (!idsDuGroupe.has(r.vehicule_id) || !dansLaPeriode(r.date_debut)) continue;
    const cat = categorieDe(r.statut, r.date_debut, r.date_fin, r.date_retour_reelle);
    if (cat !== "avenir" && cat !== "attente") continue;
    avenirParVehicule.set(r.vehicule_id, (avenirParVehicule.get(r.vehicule_id) ?? 0) + (r.prix_total_usd ?? 0));
    nbAvenirParVehicule.set(r.vehicule_id, (nbAvenirParVehicule.get(r.vehicule_id) ?? 0) + 1);
    nbAvenir += 1;
    if (cat === "attente") nbAttente += 1;
  }

  // Le filtrage par groupe porte sur la liste des véhicules : les lignes (et donc les totaux,
  // qui en sont la somme) ne peuvent jamais mélanger voitures et quads.
  const lignes = (vehicules ?? [])
    .filter((v) => groupeDeType(v.categories_vehicules?.type) === groupe)
    .map((v) => {
      const revenu = revenuParVehicule.get(v.id) ?? 0;
      const reste = resteParVehicule.get(v.id) ?? 0;
      const cout = coutParVehicule.get(v.id) ?? 0;
      const net = revenu - cout;
      const soldeAchat = v.solde_achat_usd ?? 0;
      return {
        id: v.id,
        nom: `${v.categories_vehicules?.nom ?? tCommon("dash")} (${v.plaque ?? tCommon("dash")})`,
        actif: v.actif,
        reservations: reservationsParVehicule.get(v.id) ?? 0,
        revenu,
        reste,
        cout,
        net,
        soldeAchat,
        // Sans solde d'achat renseigné (0 par défaut), retombe exactement sur "net" —
        // pas de cas particulier à gérer pour l'affichage.
        netApresRemboursement: net - soldeAchat,
        avenir: avenirParVehicule.get(v.id) ?? 0,
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
      netApresRemboursement: acc.netApresRemboursement + l.netApresRemboursement,
    }),
    { revenu: 0, reste: 0, cout: 0, net: 0, soldeAchat: 0, netApresRemboursement: 0 },
  );

  const totalAvenir = (vehicules ?? []).reduce((s, v) => s + (avenirParVehicule.get(v.id) ?? 0), 0);
  // Véhicules n'ayant que du revenu à venir : lignes ajoutées après les lignes du rapport,
  // sans chiffres réels (« — ») et hors des totaux ci-dessus.
  const lignesAvenirSeul = (vehicules ?? [])
    .filter(
      (v) =>
        groupeDeType(v.categories_vehicules?.type) === groupe &&
        (nbAvenirParVehicule.get(v.id) ?? 0) > 0 &&
        !lignes.some((l) => l.id === v.id),
    )
    .map((v) => ({
      id: v.id,
      nom: `${v.categories_vehicules?.nom ?? tCommon("dash")} (${v.plaque ?? tCommon("dash")})`,
      actif: v.actif,
      avenir: avenirParVehicule.get(v.id) ?? 0,
    }))
    .sort((a, b) => b.avenir - a.avenir);

  // Liste des clients : mêmes réservations que le rapport (non annulées, date de début dans la
  // période) et mêmes véhicules (groupe affiché). Une ligne par réservation, plus récente d'abord.
  const vehiculesDuGroupe = new Map(
    (vehicules ?? [])
      .filter((v) => groupeDeType(v.categories_vehicules?.type) === groupe)
      .map((v) => [v.id, `${v.categories_vehicules?.nom ?? tCommon("dash")} (${v.plaque ?? tCommon("dash")})`]),
  );
  const faseLabels: Record<string, string> = {
    a_venir: tReservations("fase_a_venir"),
    en_cours: tReservations("fase_en_cours"),
    terminee: tReservations("fase_terminee"),
    en_retraso: tReservations("fase_en_retraso"),
    annulee: tReservations("fase_annulee"),
  };
  const fmtMontant = (n: number) => `US$ ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  // Toutes les locations non annulées du groupe et de la période, par catégorie ; la liste
  // affichée n'en retient que les statuts cochés.
  const toutes: LocationLigne[] = [];
  for (const r of (reservations ?? [])
    .filter((r) => vehiculesDuGroupe.has(r.vehicule_id) && dansLaPeriode(r.date_debut))
    .sort((a, b) => b.date_debut.localeCompare(a.date_debut) || b.numero - a.numero)) {
    const categorie = categorieDe(r.statut, r.date_debut, r.date_fin, r.date_retour_reelle);
    if (!categorie) continue;
    const fase = calcularFase(r.date_debut, r.date_fin, r.statut, r.date_retour_reelle);
    const montant = r.prix_total_usd ?? 0;
    toutes.push({
      id: r.id,
      numero: r.numero,
      clientId: r.client_id,
      client: r.clients?.nom ?? tCommon("dash"),
      vehicule: vehiculesDuGroupe.get(r.vehicule_id) ?? tCommon("dash"),
      debut: r.date_debut,
      fin: r.date_fin,
      // Même règle que le prix et le contrat : fin − début, minimum 1 jour.
      jours: Math.max(diffDays(r.date_debut, r.date_fin), 1),
      montant,
      montantFmt: fmtMontant(montant),
      fase,
      enAttente: r.statut === "en_attente",
      faseLabel: faseLabels[fase],
      categorie,
    });
  }
  const locations = toutes.filter((l) => statutsActifs.includes(l.categorie));
  // Garde-fou : les locations « réelles » doivent correspondre exactement au rapport
  // (revenu et nombre de réservations), que la catégorie soit cochée ou non.
  const reelles = toutes.filter((l) => l.categorie === "reel");
  const totalReel = reelles.reduce((s, l) => s + l.montant, 0);
  const nbRapport = lignes.reduce((s, l) => s + l.reservations, 0);
  const ecart =
    totalReel !== totaux.revenu || reelles.length !== nbRapport
      ? {
          liste: `${reelles.length} / ${fmtMontant(totalReel)}`,
          rapport: `${nbRapport} / ${fmtMontant(totaux.revenu)}`,
        }
      : null;

  const fmt = (n: number) => `US$ ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  const dateLongue = (iso: string) =>
    isIsoDate(iso) ? formatDate(iso, locale, { day: "numeric", month: "long", year: "numeric" }) : iso;
  const regle = t(
    debut && fin
      ? "rule_period"
      : debut
        ? "rule_from"
        : fin
          ? "rule_until"
          : "rule_all",
    { debut: dateLongue(debut ?? ""), fin: dateLongue(fin ?? "") },
  );
  const lienReset = `/admin/rentabilite/${groupe}${
    statutsEstDefaut ? "" : `?${statutsActifs.map((c) => `statuts=${c}`).join("&")}`
  }`;
  const caseClass =
    "inline-flex min-h-[36px] cursor-pointer items-center gap-2 rounded-md border border-black/15 px-3 py-1.5 text-sm text-ink hover:bg-black/5";
  const selecteur = (
    <form className="flex flex-wrap items-center gap-2">
      {debut && <input type="hidden" name="debut" value={debut} />}
      {fin && <input type="hidden" name="fin" value={fin} />}
      <fieldset className="contents">
        <legend className="sr-only">{t("sel_legend")}</legend>
        <span className="text-sm font-medium text-ink">{t("sel_legend")}</span>
        {CATEGORIES.map((c) => (
          <label key={c} className={caseClass}>
            <input
              type="checkbox"
              name="statuts"
              value={c}
              defaultChecked={statutsActifs.includes(c)}
              className="h-4 w-4"
            />
            {t(`sel_${c}`)}
          </label>
        ))}
      </fieldset>
      <button
        type="submit"
        className="inline-flex min-h-[36px] items-center rounded-md border border-black/15 px-3 py-1.5 text-sm font-semibold text-ink hover:bg-black/5"
      >
        {t("sel_apply")}
      </button>
    </form>
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-ink">{t(groupe === "quads" ? "title_quads" : "title_voitures")}</h1>
        <p className="mt-1 text-sm text-ink-soft">{t("subtitle")}</p>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border border-black/10 bg-white p-4">
        {!statutsEstDefaut &&
          statutsActifs.map((c) => <input key={c} type="hidden" name="statuts" value={c} />)}
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
          <a href={lienReset} className="text-sm font-medium text-ink-soft hover:text-brand hover:underline">
            {t("filter_reset")}
          </a>
        )}
      </form>
      <p className="-mt-3 max-w-[80ch] text-sm text-ink-soft">
        {regle} {t("rule_base")} {t("rule_late")}
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label={t("stat_revenu")} value={fmt(totaux.revenu)} tone="neutral" />
        <StatCard label={t("stat_reste")} value={fmt(totaux.reste)} tone="warn" />
        <StatCard label={t("stat_couts")} value={fmt(totaux.cout)} tone="crit" />
        <StatCard label={t("stat_net")} value={fmt(totaux.net)} tone="neutral" />
        <StatCard label={t("stat_solde_achat")} value={fmt(totaux.soldeAchat)} tone="muted" />
        <StatCard label={t("stat_net_rembourse")} value={fmt(totaux.netApresRemboursement)} tone="neutral" />
      </div>

      <div className="grid grid-cols-1 sm:max-w-sm">
        <StatCard
          label={t("stat_avenir")}
          value={fmt(totalAvenir)}
          tone="info"
          sub={t("stat_avenir_sub", { total: nbAvenir, attente: nbAttente })}
        />
      </div>

      <div className={tableCardClass}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className={theadClass}>
              <tr>
                <th className={`${thClass} sticky left-0 z-10 bg-[#f7f7f7]`}>{t("col_vehiculo")}</th>
                <th className={thNumClass}>{t("col_reservas")}</th>
                <th className={thNumClass}>{t("col_revenu")}</th>
                <th className={thNumClass}>{t("col_reste")}</th>
                <th className={thNumClass}>{t("col_entretien")}</th>
                <th className={thNumClass}>{t("col_net")}</th>
                <th className={thNumClass}>{t("col_solde_achat")}</th>
                <th className={thNumClass}>{t("col_net_rembourse")}</th>
                <th className={`${thNumClass} border-l border-black/10 text-sky-700`}>{t("col_avenir")}</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((l) => (
                <tr key={l.id} className={trClass}>
                  <td className="sticky left-0 z-10 bg-white px-4 py-3 font-medium text-ink">
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
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-ink">
                    {fmt(l.netApresRemboursement)}
                  </td>
                  <td className="border-l border-black/10 px-4 py-3 text-right tabular-nums text-sky-700">
                    {l.avenir > 0 ? fmt(l.avenir) : tCommon("dash")}
                  </td>
                </tr>
              ))}
              {lignesAvenirSeul.map((l) => (
                <tr key={l.id} className={trClass}>
                  <td className="sticky left-0 z-10 bg-white px-4 py-3 font-medium text-ink">
                    {l.nom}
                    {!l.actif && (
                      <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-ink-soft">
                        {tCommon("no")}
                      </span>
                    )}
                  </td>
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <td key={i} className="px-4 py-3 text-right tabular-nums text-ink-soft">
                      {tCommon("dash")}
                    </td>
                  ))}
                  <td className="border-l border-black/10 px-4 py-3 text-right tabular-nums text-sky-700">
                    {fmt(l.avenir)}
                  </td>
                </tr>
              ))}
              {lignes.length === 0 && lignesAvenirSeul.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-ink-soft">
                    {t("empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RentabiliteClientsListe
        lignes={locations}
        groupe={groupe}
        periode={`${debut || "debut"}_${fin || "fin"}`}
        avecPeriode={Boolean(debut || fin)}
        statuts={statutsActifs}
        selecteur={selecteur}
        ecart={ecart}
      />

      <p className="max-w-[70ch] text-xs text-ink-soft">{t("footnote")}</p>
    </div>
  );
}
