"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  diffDays,
  estWeekEnd,
  formatDate,
  initiales,
  semaineIso,
} from "@/lib/calendrier-dates";
import { BLOCAGE_BARRE, FASE_BARRE, FASE_ICONE, type CalFase } from "@/lib/calendrier-styles";
// Tailwind n'analyse pas src/lib : les classes jaunes de FASE_BARRE.a_venir sont listées ici pour être générées.
// bg-yellow-300 text-yellow-950 border-yellow-500 hover:bg-yellow-200

export type CalendrierVue = "7" | "14" | "mois";
export type GroupeCle = "quads" | "scooter" | "voitures";
export type CalendrierIntervalle = {
  type: "reservation" | "indispo";
  id: string;
  label: string;
  debut: string;
  fin: string;
  // Statut affiché (réservations seulement) ; absent pour un blocage.
  fase?: CalFase;
};
export type CalendrierGroupe = {
  cle: GroupeCle;
  vehicules: { id: string; nom: string; titre: string; sousTitre: string | null }[];
};

type Selection = CalendrierIntervalle & { vehicule: string };

// Grille de la flotte : une ligne par véhicule, une colonne par jour, réservations et
// blocages dessinés en barres continues. Lecture seule, sauf le cliquer-glisser existant
// sur les cases libres (vers /admin/calendrier/elegir), conservé tel quel.
export function CalendrierGrid({
  groupes,
  jours,
  intervalles,
  today,
  vue,
  emptyLabel,
}: {
  groupes: CalendrierGroupe[];
  jours: string[];
  intervalles: Record<string, CalendrierIntervalle[]>;
  today: string;
  vue: CalendrierVue;
  emptyLabel: string;
}) {
  const t = useTranslations("admin.calendrier");
  const tRes = useTranslations("admin.reservations");
  const locale = useLocale();
  const router = useRouter();
  const [selection, setSelection] = useState<Selection | null>(null);

  // Cliquer-glisser sur les cases libres (comportement existant inchangé).
  const [dragVehiculeId, setDragVehiculeId] = useState<string | null>(null);
  const [anchorDate, setAnchorDate] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  useEffect(() => {
    if (!dragVehiculeId) return;

    function finish() {
      if (dragVehiculeId && anchorDate && hoverDate) {
        const [debut, fin] =
          anchorDate <= hoverDate ? [anchorDate, hoverDate] : [hoverDate, anchorDate];
        router.push(
          `/admin/calendrier/elegir?vehicule_id=${dragVehiculeId}&date_debut=${debut}&date_fin=${fin}`,
        );
      }
      setDragVehiculeId(null);
      setAnchorDate(null);
      setHoverDate(null);
    }

    window.addEventListener("mouseup", finish);
    return () => window.removeEventListener("mouseup", finish);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragVehiculeId, anchorDate, hoverDate]);

  const n = jours.length;
  const premier = jours[0];
  const dernier = jours[n - 1];
  const compact = vue === "mois";
  const minCol = compact ? 26 : 36;
  const rowStyle: CSSProperties = {
    gridTemplateColumns: `var(--cal-veh) repeat(${n}, minmax(${minCol}px, 1fr))`,
  };
  const rowHeight = compact ? "h-8" : "h-10";

  // Jour occupé (réservation ou blocage) par véhicule : sert aux cases libres et aux
  // lignes « libres » de chaque groupe. Calcul en lecture seule sur les données chargées.
  const occupe = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const [vehiculeId, liste] of Object.entries(intervalles)) {
      const jourSet = new Set<string>();
      for (const it of liste) {
        for (const jour of jours) if (jour >= it.debut && jour <= it.fin) jourSet.add(jour);
      }
      map[vehiculeId] = jourSet;
    }
    return map;
  }, [intervalles, jours]);

  // Semaines ISO : regroupement des colonnes consécutives de même numéro.
  const semaines = useMemo(() => {
    const res: { n: number; debut: number; longueur: number }[] = [];
    jours.forEach((jour, i) => {
      const s = semaineIso(jour);
      const last = res[res.length - 1];
      if (last && last.n === s) last.longueur += 1;
      else res.push({ n: s, debut: i, longueur: 1 });
    });
    return res;
  }, [jours]);

  const faseLabel = (f: CalFase) =>
    ({
      a_venir: tRes("fase_a_venir"),
      en_cours: tRes("fase_en_cours"),
      en_attente: tRes("stat_pendientes"),
      en_retraso: tRes("fase_en_retraso"),
      terminee: tRes("fase_terminee"),
    })[f];

  const fmtCourt = (iso: string) => formatDate(iso, locale, { day: "numeric", month: "short" });
  const fmtLong = (iso: string) =>
    formatDate(iso, locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  function fondJour(jour: string) {
    if (jour === today) return "bg-brand/[0.07]";
    if (estWeekEnd(jour)) return "bg-black/[0.035]";
    return "";
  }

  const isDragging = dragVehiculeId !== null;
  const totalVehicules = groupes.reduce((s, g) => s + g.vehicules.length, 0);
  const groupeLabel: Record<GroupeCle, string> = {
    quads: t("group_quads"),
    scooter: t("group_scooter"),
    voitures: t("group_voitures"),
  };

  const stickyCell = "sticky left-0 z-20 border-r border-black/10";

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`overflow-x-auto rounded-lg border border-black/10 bg-white shadow-sm ${
          compact ? "[--cal-veh:7.5rem] sm:[--cal-veh:9rem]" : "[--cal-veh:7.5rem] sm:[--cal-veh:11rem]"
        } ${isDragging ? "select-none" : ""}`}
      >
        <div className="min-w-fit text-xs">
          {/* Numéros de semaine */}
          <div className="grid border-b border-black/5 bg-black/[0.03]" style={rowStyle}>
            <div className={`${stickyCell} bg-[#f7f7f7]`} />
            {semaines.map((s) => (
              <div
                key={`${s.n}-${s.debut}`}
                style={{ gridColumn: `${s.debut + 2} / span ${s.longueur}` }}
                className="truncate border-l border-black/10 px-1 py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-ink-soft"
              >
                {t("week_short", { n: s.n })}
              </div>
            ))}
          </div>

          {/* Jours */}
          <div className="grid border-b border-black/10 bg-black/[0.03]" style={rowStyle}>
            <div className={`${stickyCell} flex items-end bg-[#f7f7f7] px-3 py-2 font-bold text-ink-soft`}>
              {t("col_vehiculo")}
            </div>
            {jours.map((jour) => {
              const passe = jour < today;
              const estAujourdhui = jour === today;
              return (
                <div
                  key={jour}
                  className={`flex flex-col items-center justify-center border-l border-black/5 py-1 ${fondJour(jour)} ${
                    passe ? "opacity-50" : ""
                  }`}
                  aria-current={estAujourdhui ? "date" : undefined}
                >
                  <span className="text-[10px] font-normal text-ink-soft">
                    {formatDate(jour, locale, { weekday: compact ? "narrow" : "short" })}
                  </span>
                  <span
                    className={`mt-0.5 flex h-6 min-w-6 items-center justify-center rounded-full px-1 font-semibold ${
                      estAujourdhui ? "bg-brand text-white" : "text-ink"
                    }`}
                  >
                    {Number(jour.slice(8, 10))}
                  </span>
                </div>
              );
            })}
          </div>

          {groupes.map((groupe) => (
            <div key={groupe.cle}>
              {/* Ligne de synthèse du groupe : véhicules libres par jour */}
              <div className="grid border-b border-black/10 bg-black/[0.02]" style={rowStyle}>
                <div
                  className={`${stickyCell} flex items-center gap-1 truncate bg-[#fafafa] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink`}
                >
                  {groupeLabel[groupe.cle]}
                  <span className="font-medium normal-case tracking-normal text-ink-soft">
                    · {t("free_row")}
                  </span>
                </div>
                {jours.map((jour) => {
                  const libres = groupe.vehicules.filter((v) => !occupe[v.id]?.has(jour)).length;
                  return (
                    <div
                      key={jour}
                      aria-label={t("free_aria", { count: libres, date: fmtLong(jour) })}
                      className={`flex items-center justify-center border-l border-black/5 py-1.5 font-semibold tabular-nums ${fondJour(
                        jour,
                      )} ${libres === 0 ? "text-red-600" : "text-ink-soft"}`}
                    >
                      {libres}
                    </div>
                  );
                })}
              </div>

              {groupe.vehicules.map((v) => {
                const liste = intervalles[v.id] ?? [];
                return (
                  <div
                    key={v.id}
                    className="grid border-b border-black/5"
                    style={{ ...rowStyle, gridTemplateRows: "auto" }}
                  >
                    <div
                      style={{ gridRow: 1, gridColumn: 1 }}
                      className={`${stickyCell} flex ${rowHeight} min-w-0 flex-col justify-center bg-white px-3 leading-tight`}
                      title={v.nom}
                    >
                      <span className="truncate font-semibold text-ink">{v.titre}</span>
                      {v.sousTitre && !compact && (
                        <span className="truncate text-[10px] text-ink-soft">{v.sousTitre}</span>
                      )}
                    </div>

                    {jours.map((jour, i) => {
                      const libre = !occupe[v.id]?.has(jour);
                      const selected =
                        isDragging &&
                        dragVehiculeId === v.id &&
                        anchorDate &&
                        hoverDate &&
                        jour >= (anchorDate <= hoverDate ? anchorDate : hoverDate) &&
                        jour <= (anchorDate <= hoverDate ? hoverDate : anchorDate);
                      return (
                        <div
                          key={jour}
                          style={{ gridRow: 1, gridColumn: i + 2 }}
                          className={`${rowHeight} border-l border-black/5 ${fondJour(jour)}`}
                        >
                          {libre && (
                            <div
                              role="button"
                              title={t("choose_title")}
                              aria-label={`${t("choose_title")} — ${v.nom} — ${fmtLong(jour)}`}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setDragVehiculeId(v.id);
                                setAnchorDate(jour);
                                setHoverDate(jour);
                              }}
                              onMouseEnter={() => {
                                if (isDragging && dragVehiculeId === v.id) setHoverDate(jour);
                              }}
                              className={`flex h-full w-full cursor-pointer items-center justify-center ${
                                selected
                                  ? "bg-brand/20 text-brand"
                                  : "text-black/10 hover:bg-black/[0.04] hover:text-ink"
                              }`}
                            >
                              {!compact && "+"}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {liste.map((it) => {
                      const avant = it.debut < premier;
                      const apres = it.fin > dernier;
                      const debutIdx = avant ? 0 : diffDays(premier, it.debut);
                      const finIdx = apres ? n - 1 : diffDays(premier, it.fin);
                      if (finIdx < 0 || debutIdx > n - 1 || finIdx < debutIdx) return null;
                      const longueur = finIdx - debutIdx + 1;
                      const texte = compact && longueur <= 2 ? initiales(it.label) : it.label;
                      const resa = it.type === "reservation";
                      const fase = resa ? (it.fase ?? "a_venir") : null;
                      const couleur = fase ? FASE_BARRE[fase] : BLOCAGE_BARRE;
                      const icone = fase ? FASE_ICONE[fase] : undefined;
                      // En cours : trait bleu plus foncé à gauche (sauf barre coupée à gauche).
                      const accent =
                        fase === "en_cours" && !avant ? "border-l-4 border-l-blue-900" : "";
                      const coins = `${avant ? "rounded-l-none border-l-0" : "rounded-l-md"} ${
                        apres ? "rounded-r-none border-r-0" : "rounded-r-md"
                      }`;
                      const description = [
                        t("bar_aria", {
                          nom: it.label,
                          vehicule: v.nom,
                          debut: fmtCourt(it.debut),
                          fin: fmtCourt(it.fin),
                        }),
                        fase ? faseLabel(fase) : null,
                        avant ? t("continues_before") : null,
                        apres ? t("continues_after") : null,
                      ]
                        .filter(Boolean)
                        .join(" — ");
                      const style: CSSProperties = {
                        gridRow: 1,
                        gridColumn: `${debutIdx + 2} / span ${longueur}`,
                      };
                      const classe = `z-10 mx-px my-1 flex min-w-0 items-center gap-0.5 overflow-hidden border px-1 text-[10px] font-semibold leading-tight ${couleur} ${accent} ${coins}`;
                      const contenu = (
                        <>
                          {avant && <span aria-hidden="true">‹</span>}
                          {icone && <span aria-hidden="true">{icone}</span>}
                          <span className="min-w-0 flex-1 truncate text-left">{texte}</span>
                          {apres && <span aria-hidden="true">›</span>}
                        </>
                      );
                      return resa ? (
                        <button
                          key={`${it.type}-${it.id}`}
                          type="button"
                          style={style}
                          title={description}
                          aria-label={description}
                          onClick={() => setSelection({ ...it, vehicule: v.nom })}
                          className={classe}
                        >
                          {contenu}
                        </button>
                      ) : (
                        <Link
                          key={`${it.type}-${it.id}`}
                          href={`/admin/blocages/${it.id}`}
                          style={style}
                          title={description}
                          aria-label={description}
                          className={classe}
                        >
                          {contenu}
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}

          {totalVehicules === 0 && (
            <p className="px-4 py-6 text-center text-sm text-ink-soft">{emptyLabel}</p>
          )}
        </div>
      </div>

      <div aria-live="polite">
        {selection ? (
          <div className="flex flex-col gap-3 rounded-lg border border-black/10 bg-white p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between">
            <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                  {t("details_client")}
                </dt>
                <dd className="font-semibold text-ink">{selection.label}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                  {t("details_status")}
                </dt>
                <dd className="text-ink">
                  {selection.fase ? `${FASE_ICONE[selection.fase] ?? ""} ${faseLabel(selection.fase)}`.trim() : ""}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                  {t("details_vehicle")}
                </dt>
                <dd className="text-ink">{selection.vehicule}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                  {t("details_dates")}
                </dt>
                <dd className="text-ink">
                  {t("range", { debut: fmtLong(selection.debut), fin: fmtLong(selection.fin) })}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                  {t("details_duration")}
                </dt>
                <dd className="text-ink">
                  {/* Même règle que le calcul du prix : fin − début, minimum 1 jour. */}
                  {t("details_days", {
                    count: Math.max(diffDays(selection.debut, selection.fin), 1),
                  })}
                </dd>
              </div>
            </dl>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/admin/reservations/${selection.id}`}
                className="inline-flex min-h-[36px] items-center rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                {t("details_open")} →
              </Link>
              <button
                type="button"
                onClick={() => setSelection(null)}
                aria-label={t("details_close")}
                className="inline-flex min-h-[36px] items-center rounded-md border border-black/15 px-3 py-2 text-sm font-medium text-ink hover:bg-black/5"
              >
                {t("details_close")}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-ink-soft">{t("details_hint")}</p>
        )}
      </div>
    </div>
  );
}
