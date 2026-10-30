import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminLocale, getAdminTranslator } from "@/lib/admin-i18n";
import {
  CalendrierGrid,
  type CalendrierGroupe,
  type CalendrierIntervalle,
  type CalendrierVue,
  type GroupeCle,
} from "@/components/admin/CalendrierGrid";
import { CalendrierMoisPicker } from "@/components/admin/CalendrierMoisPicker";
import { calcularFase } from "@/lib/reservation-fase";
import { BLOCAGE_BARRE, FASES_LEGENDE, FASE_BARRE, type CalFase } from "@/lib/calendrier-styles";
import {
  addDays,
  addMonths,
  aujourdhui,
  formatDate,
  isIsoDate,
  isIsoMonth,
  joursDuMois,
  semaineIso,
} from "@/lib/calendrier-dates";

type Filtre = "tous" | GroupeCle;
const FILTRES: Filtre[] = ["tous", "quads", "voitures", "scooter"];

// Statut affiché sur la barre : en attente (statut stocké) sinon phase calculée.
// Les réservations annulées ne sont pas lues (filtrées plus bas), comme avant.
function faseCalendrier(
  debut: string,
  fin: string,
  statut: string,
  retour: string | null,
  today: string,
): CalFase {
  if (statut === "en_attente") return "en_attente";
  const fase = calcularFase(debut, fin, statut, retour, today);
  return fase === "annulee" ? "terminee" : fase;
}

function groupeDuType(type: string | null | undefined): GroupeCle {
  if (type === "quad") return "quads";
  if (type === "scooter") return "scooter";
  return "voitures";
}

function majuscule(s: string) {
  return s.charAt(0).toLocaleUpperCase() + s.slice(1);
}

export default async function CalendrierPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; vue?: string; mois?: string; filtre?: string }>;
}) {
  const params = await searchParams;
  const supabase = createClient();
  const t = await getAdminTranslator("admin.calendrier");
  const tCommon = await getAdminTranslator("admin.common");
  const tRes = await getAdminTranslator("admin.reservations");
  const locale = await getAdminLocale();

  // Paramètres d'affichage (aucun n'influence les données, seulement la plage et le filtre).
  const today = aujourdhui();
  const vue: CalendrierVue = params.vue === "7" || params.vue === "mois" ? params.vue : "14";
  const filtre: Filtre = FILTRES.includes(params.filtre as Filtre) ? (params.filtre as Filtre) : "tous";

  let start: string;
  let nbJours: number;
  if (vue === "mois") {
    const mois = isIsoMonth(params.mois)
      ? params.mois
      : (isIsoDate(params.start) ? params.start : today).slice(0, 7);
    start = `${mois}-01`;
    nbJours = joursDuMois(mois);
  } else {
    start = isIsoDate(params.start) ? params.start : today;
    nbJours = vue === "7" ? 7 : 14;
  }
  const end = addDays(start, nbJours - 1);
  const jours = Array.from({ length: nbJours }, (_, i) => addDays(start, i));

  // Mêmes lectures qu'avant ; seules les bornes de la plage dépendent de la vue (jusqu'à
  // 31 jours en vue Mois), et le type de catégorie est lu pour regrouper et filtrer.
  const [{ data: vehicules }, { data: reservations }, { data: indisponibilites }] =
    await Promise.all([
      supabase
        .from("vehicules")
        .select("id, plaque, categories_vehicules(nom, type)")
        .eq("actif", true)
        .order("plaque"),
      supabase
        .from("reservations")
        .select("id, vehicule_id, date_debut, date_fin, statut, date_retour_reelle, clients(nom)")
        .neq("statut", "annulee")
        .lte("date_debut", end)
        .gte("date_fin", start),
      supabase
        .from("indisponibilites_vehicule")
        .select("id, vehicule_id, date_debut, date_fin, motif")
        .lte("date_debut", end)
        .gte("date_fin", start),
    ]);

  // Groupes dans l'ordre d'apparition des véhicules (ordre actuel par plaque, inchangé).
  const groupes: CalendrierGroupe[] = [];
  for (const v of vehicules ?? []) {
    const cle = groupeDuType(v.categories_vehicules?.type);
    if (filtre !== "tous" && filtre !== cle) continue;
    let groupe = groupes.find((g) => g.cle === cle);
    if (!groupe) {
      groupe = { cle, vehicules: [] };
      groupes.push(groupe);
    }
    const categorie = v.categories_vehicules?.nom ?? tCommon("dash");
    groupe.vehicules.push({
      id: v.id,
      // Libellé complet inchangé (infobulles, lecteurs d'écran, panneau de détails).
      nom: `${categorie} (${v.plaque ?? tCommon("dash")})`,
      // Affichage dans la colonne : la plaque d'abord (elle distingue les quads entre eux).
      titre: v.plaque ?? categorie,
      sousTitre: v.plaque ? categorie : null,
    });
  }
  const idsAffiches = new Set(groupes.flatMap((g) => g.vehicules.map((v) => v.id)));

  const intervalles: Record<string, CalendrierIntervalle[]> = {};
  function ajouter(vehiculeId: string, intervalle: CalendrierIntervalle) {
    if (!idsAffiches.has(vehiculeId)) return;
    (intervalles[vehiculeId] ??= []).push(intervalle);
  }
  for (const r of reservations ?? []) {
    ajouter(r.vehicule_id, {
      type: "reservation",
      id: r.id,
      label: r.clients?.nom ?? tCommon("dash"),
      debut: r.date_debut,
      fin: r.date_fin,
      fase: faseCalendrier(r.date_debut, r.date_fin, r.statut, r.date_retour_reelle, today),
    });
  }
  for (const i of indisponibilites ?? []) {
    ajouter(i.vehicule_id, {
      type: "indispo",
      id: i.id,
      label: i.motif || t("legend_indisponibilite"),
      debut: i.date_debut,
      fin: i.date_fin,
    });
  }
  const nbReservations = (reservations ?? []).filter((r) => idsAffiches.has(r.vehicule_id)).length;

  // En-tête : mois et année, plage de dates et numéros de semaine.
  const annee = (iso: string) => iso.slice(0, 4);
  const moisLong = (iso: string) => formatDate(iso, locale, { month: "long" });
  let titre: string;
  if (start.slice(0, 7) === end.slice(0, 7)) {
    titre = `${moisLong(start)} ${annee(start)}`;
  } else if (annee(start) === annee(end)) {
    titre = `${moisLong(start)} – ${moisLong(end)} ${annee(end)}`;
  } else {
    titre = `${moisLong(start)} ${annee(start)} – ${moisLong(end)} ${annee(end)}`;
  }
  titre = majuscule(titre);
  const memeAnnee = annee(start) === annee(end);
  const plage = t("range", {
    debut: formatDate(start, locale, {
      day: "numeric",
      month: "long",
      ...(memeAnnee ? {} : { year: "numeric" }),
    }),
    fin: formatDate(end, locale, { day: "numeric", month: "long", year: "numeric" }),
  });
  const semA = semaineIso(start);
  const semB = semaineIso(end);
  const semaines = semA === semB ? t("week_one", { n: semA }) : t("weeks", { a: semA, b: semB });

  // Navigation : liens d'URL (vue, début ou mois, filtre).
  const moisCourant = start.slice(0, 7);
  function href(p: { vue?: CalendrierVue; start?: string; mois?: string; filtre?: Filtre }) {
    const v = p.vue ?? vue;
    const q = new URLSearchParams();
    if (v !== "14") q.set("vue", v);
    if (v === "mois") q.set("mois", p.mois ?? moisCourant);
    else if (p.start) q.set("start", p.start);
    const f = p.filtre ?? filtre;
    if (f !== "tous") q.set("filtre", f);
    const s = q.toString();
    return `/admin/calendrier${s ? `?${s}` : ""}`;
  }
  const precedent =
    vue === "mois" ? href({ mois: addMonths(moisCourant, -1) }) : href({ start: addDays(start, -nbJours) });
  const suivant =
    vue === "mois" ? href({ mois: addMonths(moisCourant, 1) }) : href({ start: addDays(start, nbJours) });
  const versAujourdhui = vue === "mois" ? href({ mois: today.slice(0, 7) }) : href({ start: today });

  const boutonClass =
    "inline-flex min-h-[36px] items-center rounded border border-black/15 px-3 py-1.5 text-sm font-medium text-ink hover:bg-black/5";
  const segmentClass = (actif: boolean) =>
    `inline-flex min-h-[36px] items-center px-3 py-1.5 text-sm font-medium transition-colors ${
      actif ? "bg-ink text-white" : "text-ink hover:bg-black/5"
    }`;

  const VUES: { cle: CalendrierVue; label: string }[] = [
    { cle: "7", label: t("view_7") },
    { cle: "14", label: t("view_14") },
    { cle: "mois", label: t("view_month") },
  ];
  const FASE_LABELS: Record<CalFase, string> = {
    a_venir: tRes("fase_a_venir"),
    en_cours: tRes("fase_en_cours"),
    en_attente: tRes("stat_pendientes"),
    en_retraso: tRes("fase_en_retraso"),
    terminee: tRes("fase_terminee"),
  };
  const FILTRE_LABELS: Record<Filtre, string> = {
    tous: t("filter_all"),
    quads: t("filter_quads"),
    voitures: t("filter_voitures"),
    scooter: t("filter_scooter"),
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">{t("title")}</p>
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">{titre}</h1>
        <p className="text-sm text-ink-soft">
          {plage} · {semaines}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link href={versAujourdhui} className={boutonClass}>
          {t("today")}
        </Link>
        <div className="flex items-center gap-1">
          <Link href={precedent} aria-label={t("prev_aria")} title={t("prev_aria")} className={boutonClass}>
            ←
          </Link>
          <Link href={suivant} aria-label={t("next_aria")} title={t("next_aria")} className={boutonClass}>
            →
          </Link>
        </div>

        <nav
          aria-label={t("views_aria")}
          className="flex overflow-hidden rounded border border-black/15"
        >
          {VUES.map((v) => (
            <Link
              key={v.cle}
              href={href({ vue: v.cle, start: vue === "mois" ? today : start })}
              aria-current={vue === v.cle ? "true" : undefined}
              className={segmentClass(vue === v.cle)}
            >
              {v.label}
            </Link>
          ))}
        </nav>

        <CalendrierMoisPicker value={moisCourant} filtre={filtre} label={t("month_picker")} />

        <nav
          aria-label={t("filters_aria")}
          className="flex overflow-hidden rounded border border-black/15"
        >
          {FILTRES.map((f) => (
            <Link
              key={f}
              href={href({ filtre: f, start })}
              aria-current={filtre === f ? "true" : undefined}
              className={segmentClass(filtre === f)}
            >
              {FILTRE_LABELS[f]}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-ink-soft">
        <p className="text-sm font-medium text-ink">
          {t("summary", { vehicules: idsAffiches.size, reservations: nbReservations })}
        </p>
        <div className="flex items-center gap-4">
          {FASES_LEGENDE.map((f) => (
            <span key={f} className="flex items-center gap-1.5">
              <span className={`inline-block h-3 w-4 rounded-sm border ${FASE_BARRE[f]}`} />
              {FASE_LABELS[f]}
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span className={`inline-block h-3 w-4 rounded-sm border ${BLOCAGE_BARRE}`} />
            {t("legend_indisponibilite")}
          </span>
        </div>
      </div>

      {/* Clé = période et filtre affichés : changer de mois, de semaine, de vue ou de filtre
          remonte la grille, ce qui ferme le panneau de détail resté ouvert. */}
      <CalendrierGrid
        key={`${vue}:${jours[0]}:${filtre}`}
        groupes={groupes}
        jours={jours}
        intervalles={intervalles}
        today={today}
        vue={vue}
        emptyLabel={filtre === "tous" ? t("empty") : t("empty_filter")}
      />
    </div>
  );
}
