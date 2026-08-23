"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Periode = { date_debut: string; date_fin: string };

function isoDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function todayIso() {
  const now = new Date();
  return isoDate(now.getFullYear(), now.getMonth(), now.getDate());
}

// Étale chaque période [date_debut, date_fin] en dates individuelles — les réservations
// durent rarement plus de quelques semaines, donc pas besoin d'un index plus malin.
function expandUnavailable(periodes: Periode[]): Set<string> {
  const set = new Set<string>();
  for (const p of periodes) {
    const debut = new Date(p.date_debut + "T00:00:00");
    const fin = new Date(p.date_fin + "T00:00:00");
    const cursor = new Date(debut);
    let garde = 0;
    while (cursor <= fin && garde < 730) {
      set.add(isoDate(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()));
      cursor.setDate(cursor.getDate() + 1);
      garde++;
    }
  }
  return set;
}

export function AvailabilityCalendar({
  periodesIndisponibles,
  dateDebut,
  dateFin,
  onChange,
}: {
  periodesIndisponibles: Periode[];
  dateDebut: string;
  dateFin: string;
  onChange: (dateDebut: string, dateFin: string) => void;
}) {
  const t = useTranslations("reservar");
  const locale = useLocale();

  const today = todayIso();
  const now = new Date();
  const [moisAffiche, setMoisAffiche] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));

  const indisponibles = useMemo(
    () => expandUnavailable(periodesIndisponibles),
    [periodesIndisponibles],
  );

  const annee = moisAffiche.getFullYear();
  const mois = moisAffiche.getMonth();
  const premierJourSemaine = new Date(annee, mois, 1).getDay();
  const nbJours = new Date(annee, mois + 1, 0).getDate();

  const cases: (string | null)[] = [
    ...Array(premierJourSemaine).fill(null),
    ...Array.from({ length: nbJours }, (_, i) => isoDate(annee, mois, i + 1)),
  ];

  const moisAuMinimum = annee === now.getFullYear() && mois === now.getMonth();

  function handleClickJour(jour: string) {
    if (jour < today || indisponibles.has(jour)) return;

    if (!dateDebut || (dateDebut && dateFin)) {
      onChange(jour, "");
      return;
    }

    if (jour < dateDebut) {
      onChange(jour, "");
      return;
    }

    onChange(dateDebut, jour);
  }

  const nomsJours = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
    // 4 janvier 2026 est un dimanche — point de départ arbitraire pour dériver les 7
    // libellés courts localisés (dim, lun, mar…) sans dépendance externe.
    return Array.from({ length: 7 }, (_, i) => formatter.format(new Date(2026, 0, 4 + i)));
  }, [locale]);

  const nomMois = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
    moisAffiche,
  );

  return (
    <div className="rounded-lg border border-black/10 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMoisAffiche(new Date(annee, mois - 1, 1))}
          disabled={moisAuMinimum}
          className="rounded px-2 py-1 text-ink-soft hover:bg-black/5 disabled:opacity-30"
          aria-label={t("calendar_prev")}
        >
          ←
        </button>
        <p className="text-sm font-bold capitalize text-ink">{nomMois}</p>
        <button
          type="button"
          onClick={() => setMoisAffiche(new Date(annee, mois + 1, 1))}
          className="rounded px-2 py-1 text-ink-soft hover:bg-black/5"
          aria-label={t("calendar_next")}
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-ink-soft">
        {nomsJours.map((n, i) => (
          <span key={i} className="py-1 capitalize">
            {n}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cases.map((jour, i) => {
          if (!jour) return <span key={`vide-${i}`} />;

          const passe = jour < today;
          const indispo = indisponibles.has(jour);
          const desactive = passe || indispo;
          const estDebut = jour === dateDebut;
          const estFin = jour === dateFin;
          const dansPlage =
            dateDebut && dateFin && jour > dateDebut && jour < dateFin;

          return (
            <button
              key={jour}
              type="button"
              disabled={desactive}
              onClick={() => handleClickJour(jour)}
              className={`aspect-square rounded text-xs transition-colors ${
                desactive
                  ? "cursor-not-allowed bg-black/5 text-black/25 line-through"
                  : estDebut || estFin
                    ? "bg-brand font-bold text-white"
                    : dansPlage
                      ? "bg-brand/15 text-ink"
                      : "text-ink hover:bg-brand-light"
              }`}
            >
              {Number(jour.slice(-2))}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-black/5" />
          {t("calendar_legend_unavailable")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-brand" />
          {t("calendar_legend_selected")}
        </span>
      </div>

      <p className="mt-2 text-xs text-ink-soft">
        {!dateDebut && t("calendar_start_hint")}
        {dateDebut && !dateFin && t("calendar_end_hint")}
        {dateDebut && dateFin && (
          <>
            {t("field_fecha_inicio")}: <strong className="text-ink">{dateDebut}</strong>
            {" · "}
            {t("field_fecha_fin")}: <strong className="text-ink">{dateFin}</strong>
            {" — "}
            <button
              type="button"
              onClick={() => onChange("", "")}
              className="font-medium text-brand hover:underline"
            >
              {t("calendar_reset")}
            </button>
          </>
        )}
      </p>
    </div>
  );
}
