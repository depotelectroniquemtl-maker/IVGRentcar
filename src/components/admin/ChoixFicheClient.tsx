"use client";

import Link from "next/link";
import { lienClass } from "@/components/admin/admin-ui";
import { useTranslations } from "next-intl";
import type { Candidat } from "@/lib/demandes/correspondance";
import { boutonPrincipal, boutonSecondaire } from "@/components/admin/demandes-ui";

// Fiches clients candidates pour une demande (logique : lib/demandes/correspondance.ts).
// Rien n'est jamais choisi ni créé automatiquement :
// - « saisie » (nouvelle demande) : rattachement facultatif, par un choix explicite ; jamais de
//   création de fiche à ce stade ;
// - « action » (conversion, « Créer la fiche client ») : utiliser une fiche existante après
//   confirmation, ou créer volontairement une nouvelle fiche.
export function ChoixFicheClient({
  candidats,
  mode,
  selection,
  onSelection,
  onUtiliser,
  onCreer,
  libelleCreer,
  enCours = false,
}: {
  candidats: Candidat[];
  mode: "saisie" | "action";
  selection?: string | null;
  onSelection?: (id: string | null) => void;
  onUtiliser?: (id: string) => void;
  onCreer?: () => void;
  libelleCreer?: string;
  enCours?: boolean;
}) {
  const t = useTranslations("admin.demandes");
  const raison = (c: Candidat) =>
    c.parTelephone && c.parCourriel ? t("candidat_tel_courriel") : c.parTelephone ? t("candidat_tel") : t("candidat_courriel");
  const lienFiche = (c: Candidat) => (
    <Link href={`/admin/clients/${c.id}`} target="_blank" className={lienClass}>
      {c.nom}
    </Link>
  );

  if (candidats.length === 0) {
    return (
      <div className="flex flex-col items-start gap-2" data-candidats="0">
        <p className="text-ink-soft">{t("candidats_aucun")}</p>
        {mode === "action" && onCreer && (
          <button type="button" disabled={enCours} onClick={onCreer} className={boutonSecondaire}>
            {libelleCreer ?? t("fiche_creer")}
          </button>
        )}
      </div>
    );
  }

  const intro =
    candidats.length === 1 ? (
      <p className="text-ink">
        {t("candidat_unique")} {lienFiche(candidats[0])} <span className="text-ink-soft">({raison(candidats[0])})</span>
      </p>
    ) : (
      <p className="font-semibold text-ink">{t("candidats_plusieurs", { n: candidats.length })}</p>
    );

  if (mode === "saisie") {
    return (
      <fieldset className="flex flex-col gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 text-amber-950" data-candidats={candidats.length}>
        <legend className="sr-only">{t("fiche_titre")}</legend>
        {intro}
        <label className="flex items-start gap-2">
          <input type="radio" name="fiche-candidate" checked={!selection} onChange={() => onSelection?.(null)} className="mt-1" />
          <span>{t("candidat_ne_pas_rattacher")}</span>
        </label>
        {candidats.map((c) => (
          <label key={c.id} className="flex items-start gap-2">
            <input type="radio" name="fiche-candidate" checked={selection === c.id} onChange={() => onSelection?.(c.id)} className="mt-1" />
            <span>
              {t("candidat_rattacher_a")} {candidats.length > 1 ? <>{lienFiche(c)} <span className="text-amber-900">({raison(c)})</span></> : c.nom}
            </span>
          </label>
        ))}
      </fieldset>
    );
  }

  return (
    <div role="group" aria-label={t("fiche_titre")} className="flex flex-col gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 text-amber-950" data-candidats={candidats.length}>
      {intro}
      {candidats.length === 1 ? (
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={enCours} onClick={() => onUtiliser?.(candidats[0].id)} className={boutonPrincipal}>
            {t("candidat_utiliser")}
          </button>
          {onCreer && (
            <button type="button" disabled={enCours} onClick={onCreer} className={boutonSecondaire}>
              {t("candidat_creer_nouvelle")}
            </button>
          )}
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-1.5">
            {candidats.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  {lienFiche(c)} <span className="text-amber-900">({raison(c)})</span>
                </span>
                <button type="button" disabled={enCours} onClick={() => onUtiliser?.(c.id)} className={boutonSecondaire}>
                  {t("candidat_utiliser_celle_ci")}
                </button>
              </li>
            ))}
          </ul>
          {onCreer && (
            <button type="button" disabled={enCours} onClick={onCreer} className={`${boutonSecondaire} self-start`}>
              {t("candidat_creer_nouvelle")}
            </button>
          )}
        </>
      )}
    </div>
  );
}
