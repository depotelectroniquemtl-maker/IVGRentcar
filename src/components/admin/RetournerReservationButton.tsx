"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { definirRetourReservation } from "@/lib/reservation-retour";
import { aujourdhui, formatDate } from "@/lib/calendrier-dates";

type Etat = "idle" | "saving" | "done" | "error" | "already";

// Bouton rapide « Retourner » (liste des réservations) : demande une confirmation puis appelle
// la même logique de retour que la fiche de réservation (definirRetourReservation). L'étape
// existante ne demande aucun champ (ni kilométrage, ni carburant, ni état) : la fenêtre ne
// contient donc que le récapitulatif. Ne modifie jamais les dates ni le prix.
export function RetournerReservationButton({
  id,
  numero,
  client,
  vehicule,
  dateDebut,
  dateFin,
}: {
  id: string;
  numero: number;
  client: string;
  vehicule: string;
  dateDebut: string;
  dateFin: string;
}) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("admin.reservations");
  const [ouvert, setOuvert] = useState(false);
  const [etat, setEtat] = useState<Etat>("idle");
  const [message, setMessage] = useState("");
  const confirmRef = useRef<HTMLButtonElement>(null);
  // Verrou synchrone : un double clic rapide part avant le prochain rendu, l'état seul ne suffit pas.
  const enCours = useRef(false);

  const long = (iso: string) =>
    formatDate(iso, locale, { day: "numeric", month: "long", year: "numeric" });
  const anticipe = aujourdhui() < dateFin;

  useEffect(() => {
    if (!ouvert) return;
    confirmRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && etat !== "saving") fermer();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ouvert, etat]);

  function fermer() {
    const fini = etat === "done" || etat === "already";
    setOuvert(false);
    setEtat("idle");
    setMessage("");
    // La liste ne se rafraîchit qu'à la fermeture : le message de succès reste lisible.
    if (fini) router.refresh();
  }

  async function confirmer() {
    if (enCours.current) return;
    enCours.current = true;
    setEtat("saving");
    const supabase = createClient();
    const { changed, error } = await definirRetourReservation(
      supabase,
      id,
      true,
    );
    enCours.current = false;
    if (error) {
      setMessage(error);
      setEtat("error");
    } else {
      setEtat(changed ? "done" : "already");
    }
  }

  const aria = t("return_aria", { numero, cliente: client });
  const terminé = etat === "done" || etat === "already";

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert(true)}
        aria-label={aria}
        title={aria}
        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-black/15 px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-black/5"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 3 2.5 6.5 6 10M3 6.5h6.5a3.5 3.5 0 0 1 0 7H8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {t("return_button")}
      </button>

      {ouvert && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`retour-titre-${id}`}
            className="w-full max-w-md rounded-lg bg-white p-6 text-left shadow-xl"
          >
            <h2
              id={`retour-titre-${id}`}
              className="text-lg font-bold text-ink"
            >
              {t("return_title")}
            </h2>

            {!terminé && (
              <>
                <p className="mt-1 text-sm text-ink-soft">
                  {t("return_intro")}
                </p>
                <dl className="mt-4 grid gap-2 text-sm">
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                      {t("return_client")}
                    </dt>
                    <dd className="font-semibold text-ink">{client}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                      {t("return_vehicle")}
                    </dt>
                    <dd className="text-ink">{vehicule}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                      {t("return_dates")}
                    </dt>
                    <dd className="text-ink">
                      {t("return_dates_value", {
                        debut: long(dateDebut),
                        fin: long(dateFin),
                      })}
                    </dd>
                  </div>
                </dl>

                {anticipe && (
                  <div
                    role="alert"
                    className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"
                  >
                    <p>{t("return_early_warning", { fecha: long(dateFin) })}</p>
                    <Link
                      href={`/admin/reservations/${id}`}
                      className="mt-2 inline-block font-semibold text-brand underline"
                    >
                      {t("return_edit_dates")} →
                    </Link>
                  </div>
                )}

                {etat === "error" && (
                  <p role="alert" className="mt-4 text-sm text-red-600">
                    {t("return_error", { message })}
                  </p>
                )}

                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={fermer}
                    disabled={etat === "saving"}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-black/15 px-4 py-2 text-sm font-medium text-ink hover:bg-black/5 disabled:opacity-60"
                  >
                    {t("return_cancel")}
                  </button>
                  <button
                    ref={confirmRef}
                    type="button"
                    onClick={confirmer}
                    disabled={etat === "saving"}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
                  >
                    {etat === "saving" ? "…" : t("return_confirm")}
                  </button>
                </div>
              </>
            )}

            {terminé && (
              <>
                <p role="status" className="mt-3 text-sm text-ink">
                  {etat === "done" ? t("return_success") : t("return_already")}
                </p>
                <div className="mt-6 flex justify-end">
                  <button
                    ref={confirmRef}
                    type="button"
                    onClick={fermer}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
                  >
                    {t("return_close")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
