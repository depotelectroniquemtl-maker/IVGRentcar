"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Pill,
  tableCardClass,
  thClass,
  thNumClass,
  theadClass,
  trClass,
} from "@/components/admin/admin-ui";
import { FASE_BADGE_CLASSES } from "@/lib/reservation-fase";

export type LocationLigne = {
  id: string;
  numero: number;
  clientId: string;
  client: string;
  vehicule: string;
  debut: string;
  fin: string;
  jours: number;
  montant: number;
  montantFmt: string;
  // Phase calculée côté serveur (même règle que la liste des réservations).
  fase: string;
  enAttente: boolean;
  faseLabel: string;
  // Catégorie exclusive : réel (en cours/terminée), à venir confirmée, en attente.
  categorie: "reel" | "avenir" | "attente";
};

const LIGNES_INITIALES = 25;

// Échappement CSV : guillemets doublés, champ entouré de guillemets si besoin.
function champCsv(valeur: string | number): string {
  const s = String(valeur);
  return /[";\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Liste des clients ayant loué sur la période du rapport de rentabilité (lecture seule).
// Une ligne par réservation ; l'export CSV est généré ici à partir des lignes déjà chargées.
export function RentabiliteClientsListe({
  lignes,
  groupe,
  periode,
  avecPeriode,
  statuts,
  selecteur,
  ecart,
}: {
  lignes: LocationLigne[];
  groupe: string;
  periode: string;
  avecPeriode: boolean;
  statuts: string[];
  selecteur: ReactNode;
  ecart: { liste: string; rapport: string } | null;
}) {
  const t = useTranslations("admin.rentabilite");
  const tCommon = useTranslations("admin.common");
  const tRes = useTranslations("admin.reservations");
  const [toutVoir, setToutVoir] = useState(false);

  const fmtMontant = (n: number) => `US$ ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const clients = new Set(lignes.map((l) => l.clientId)).size;
  const jours = lignes.reduce((s, l) => s + l.jours, 0);
  const totalFmt = fmtMontant(lignes.reduce((s, l) => s + l.montant, 0));
  // Sous-totaux séparés : réel (= revenu du rapport) et à venir / en attente.
  const sousTotal = (reel: boolean) => {
    const sel = lignes.filter((l) => (l.categorie === "reel") === reel);
    return {
      n: sel.length,
      clients: new Set(sel.map((l) => l.clientId)).size,
      jours: sel.reduce((s, l) => s + l.jours, 0),
      montant: fmtMontant(sel.reduce((s, l) => s + l.montant, 0)),
    };
  };
  const stReel = sousTotal(true);
  const stAvenir = sousTotal(false);
  const avenirCoche = statuts.includes("avenir") || statuts.includes("attente");
  const visibles = toutVoir ? lignes : lignes.slice(0, LIGNES_INITIALES);

  function exporter() {
    const entetes = [
      t("col_client"),
      tRes("col_vehiculo"),
      t("col_du"),
      t("col_au"),
      t("col_jours"),
      `${t("col_montant")} (US$)`,
      t("col_statut"),
    ];
    const rows = lignes.map((l) => [
      l.client,
      l.vehicule,
      l.debut,
      l.fin,
      l.jours,
      // Virgule décimale : Excel en français lit ainsi le nombre.
      String(l.montant).replace(".", ","),
      l.enAttente ? `${l.faseLabel} · ${tRes("stat_pendientes")}` : l.faseLabel,
    ]);
    // « ; » comme séparateur et BOM UTF-8 : ouverture directe dans Excel avec les accents.
    const contenu =
      "﻿" +
      [entetes, ...rows].map((r) => r.map(champCsv).join(";")).join("\r\n");
    const url = URL.createObjectURL(
      new Blob([contenu], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${t("csv_file")}-${groupe}-${periode}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <section
      aria-labelledby="rentabilite-clients"
      className="flex flex-col gap-3"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="rentabilite-clients" className="text-lg font-bold text-ink">
            {t(avecPeriode ? "list_title" : "list_title_all")}
          </h2>
          {lignes.length > 0 && (
            <p className="mt-1 text-sm text-ink-soft">
              {t("list_summary", {
                clients,
                reservations: lignes.length,
                jours,
                montant: totalFmt,
              })}
            </p>
          )}
        </div>
        {lignes.length > 0 && (
          <button
            type="button"
            onClick={exporter}
            className="inline-flex min-h-[36px] items-center rounded-md border border-black/15 px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-black/5"
          >
            {t("export_csv")}
          </button>
        )}
      </div>

      {selecteur}

      <div className={tableCardClass}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className={theadClass}>
              <tr>
                <th
                  scope="col"
                  className={`${thClass} sticky left-0 z-10 bg-[#f7f7f7]`}
                >
                  {t("col_client")}
                </th>
                <th scope="col" className={thClass}>
                  {tRes("col_vehiculo")}
                </th>
                <th scope="col" className={thClass}>
                  {t("col_du")}
                </th>
                <th scope="col" className={thClass}>
                  {t("col_au")}
                </th>
                <th scope="col" className={thNumClass}>
                  {t("col_jours")}
                </th>
                <th scope="col" className={thNumClass}>
                  {t("col_montant")}
                </th>
                <th scope="col" className={thClass}>
                  {t("col_statut")}
                </th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((l) => (
                <tr key={l.id} className={trClass}>
                  <td className="sticky left-0 z-10 bg-white px-4 py-3 font-medium text-ink">
                    <Link
                      href={`/admin/clients/${l.clientId}`}
                      className="hover:text-brand hover:underline"
                    >
                      {l.client}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{l.vehicule}</td>
                  <td className="px-4 py-3 tabular-nums">{l.debut}</td>
                  <td className="px-4 py-3 tabular-nums">{l.fin}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {l.jours}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {l.montantFmt}
                  </td>
                  <td className="px-4 py-3">
                    <Pill
                      className={
                        FASE_BADGE_CLASSES[l.enAttente ? "en_attente" : l.fase]
                      }
                    >
                      {l.fase === "terminee" && (
                        <span aria-hidden="true">✓</span>
                      )}
                      {l.fase === "en_retraso" && (
                        <span aria-hidden="true">⚠</span>
                      )}
                      {l.faseLabel}
                      {l.enAttente &&
                        ` · ${tCommon("reservation_statut_en_attente")}`}
                    </Pill>
                  </td>
                </tr>
              ))}
              {lignes.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-ink-soft"
                  >
                    {t("list_empty")}
                  </td>
                </tr>
              )}
            </tbody>
            {lignes.length > 0 && (
              <tfoot>
                {[
                  { cle: "reel", label: t("subtotal_reel"), st: stReel, afficher: statuts.includes("reel") },
                  {
                    cle: "avenir",
                    label: t("subtotal_avenir"),
                    st: stAvenir,
                    afficher: avenirCoche,
                  },
                ]
                  .filter((x) => x.afficher)
                  .map((x) => (
                    <tr
                      key={x.cle}
                      className="border-t-2 border-black/10 bg-black/[0.03] font-semibold text-ink"
                    >
                      <th
                        scope="row"
                        className="sticky left-0 z-10 bg-[#f7f7f7] px-4 py-3 text-left"
                      >
                        {x.label}
                      </th>
                      <td className="px-4 py-3" colSpan={3}>
                        {t("list_totals_detail", {
                          clients: x.st.clients,
                          reservations: x.st.n,
                        })}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{x.st.jours}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{x.st.montant}</td>
                      <td className="px-4 py-3" />
                    </tr>
                  ))}
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {lignes.length > LIGNES_INITIALES && (
        <div>
          <button
            type="button"
            onClick={() => setToutVoir((v) => !v)}
            className="inline-flex min-h-[36px] items-center rounded-md border border-black/15 px-3 py-1.5 text-sm font-semibold text-ink hover:bg-black/5"
          >
            {toutVoir
              ? t("show_less")
              : t("show_all", { count: lignes.length })}
          </button>
        </div>
      )}

      {ecart && (
        <p role="alert" className="text-xs font-medium text-red-600">
          {t("list_mismatch", { liste: ecart.liste, rapport: ecart.rapport })}
        </p>
      )}
      <p className="max-w-[80ch] text-xs text-ink-soft">{t("list_note")}</p>
    </section>
  );
}
