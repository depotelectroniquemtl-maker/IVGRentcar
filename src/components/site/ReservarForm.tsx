"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { ExternalButtonLink } from "@/components/ui/Button";
import { AvailabilityCalendar } from "@/components/site/AvailabilityCalendar";
import { whatsappUrl } from "@/lib/constants";
import { FLEET_IMAGES } from "@/lib/fleet-images";
import type { CategorieAvecTarifs } from "@/lib/types";

type Disponibilidad = "idle" | "checking" | "available" | "unavailable" | "error";
type EstadoEnvio = "idle" | "submitting" | "success" | "error";

type VehiculoPublico = {
  id: string;
  categorie_id: string;
  annee: number | null;
  photo_url: string | null;
};

type Periodo = { date_debut: string; date_fin: string };

const inputClass =
  "w-full rounded border border-black/20 px-3 py-2 focus:border-brand focus:outline-none";
const labelClass = "mb-1 block font-medium text-ink";

export function ReservarForm({ categories }: { categories: CategorieAvecTarifs[] }) {
  const t = useTranslations("reservar");

  const [nom, setNom] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [categorieId, setCategorieId] = useState("");
  const [lieu, setLieu] = useState("");
  const [notes, setNotes] = useState("");

  const [vehicules, setVehicules] = useState<VehiculoPublico[]>([]);
  const [vehiculesLoading, setVehiculesLoading] = useState(false);
  const [vehiculeId, setVehiculeId] = useState("");

  const [periodesIndisponibles, setPeriodesIndisponibles] = useState<Periodo[]>([]);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");

  const [disponibilidad, setDisponibilidad] = useState<Disponibilidad>("idle");
  const [precioEstimado, setPrecioEstimado] = useState<number | null>(null);
  const [estadoEnvio, setEstadoEnvio] = useState<EstadoEnvio>("idle");
  const [mensajeWhatsapp, setMensajeWhatsapp] = useState("");

  const categoriaActual = categories.find((c) => c.id === categorieId);

  // Étape 1 -> 2 : quand la catégorie change, on recharge les véhicules précis de
  // cette catégorie via la fonction publique vehicules_publics_par_categorie (jamais
  // la plaque — voir supabase/migrations/0012_reservation_avancee.sql).
  useEffect(() => {
    setVehiculeId("");
    setVehicules([]);
    setDateDebut("");
    setDateFin("");
    setPeriodesIndisponibles([]);
    setDisponibilidad("idle");

    if (!categorieId) return;

    let cancelado = false;
    setVehiculesLoading(true);

    const supabase = createClient();
    supabase
      .rpc("vehicules_publics_par_categorie", { p_categorie_id: categorieId })
      .then(({ data }) => {
        if (cancelado) return;
        setVehicules(data ?? []);
        setVehiculesLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [categorieId]);

  // Étape 2 -> 3 : quand le véhicule précis change, on recharge son calendrier
  // d'indisponibilité (réservations + blocages manuels confondus).
  useEffect(() => {
    setDateDebut("");
    setDateFin("");
    setDisponibilidad("idle");

    if (!vehiculeId) {
      setPeriodesIndisponibles([]);
      return;
    }

    let cancelado = false;
    const supabase = createClient();
    supabase
      .rpc("periodes_indisponibles_vehicule", { p_vehicule_id: vehiculeId })
      .then(({ data }) => {
        if (!cancelado) setPeriodesIndisponibles(data ?? []);
      });

    return () => {
      cancelado = true;
    };
  }, [vehiculeId]);

  // Vérification de disponibilité en direct sur le véhicule précis (remplace l'ancienne
  // vérification par catégorie) dès que les deux dates sont choisies.
  useEffect(() => {
    if (!vehiculeId || !dateDebut || !dateFin) {
      setDisponibilidad("idle");
      return;
    }

    let cancelado = false;
    setDisponibilidad("checking");

    const supabase = createClient();
    supabase
      .rpc("disponibilite_vehicule", {
        p_vehicule_id: vehiculeId,
        p_date_debut: dateDebut,
        p_date_fin: dateFin,
      })
      .then(({ data, error }) => {
        if (cancelado) return;
        setDisponibilidad(error ? "error" : data ? "available" : "unavailable");
      });

    return () => {
      cancelado = true;
    };
  }, [vehiculeId, dateDebut, dateFin]);

  // Prix estimé en direct dès que la catégorie et les deux dates sont connues — n'a pas
  // besoin d'attendre la vérification de disponibilité (tarif indépendant du véhicule
  // précis, uniquement de la catégorie et de la durée).
  useEffect(() => {
    if (!categorieId || !dateDebut || !dateFin) {
      setPrecioEstimado(null);
      return;
    }

    let cancelado = false;
    const supabase = createClient();
    supabase
      .rpc("calculer_prix_total", {
        p_categorie_id: categorieId,
        p_date_debut: dateDebut,
        p_date_fin: dateFin,
      })
      .then(({ data }) => {
        if (!cancelado) setPrecioEstimado(typeof data === "number" ? data : null);
      });

    return () => {
      cancelado = true;
    };
  }, [categorieId, dateDebut, dateFin]);

  const puedeEnviar =
    nom &&
    whatsapp &&
    categorieId &&
    vehiculeId &&
    dateDebut &&
    dateFin &&
    disponibilidad === "available";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!puedeEnviar) return;

    setEstadoEnvio("submitting");

    const precioTexto = precioEstimado !== null ? `US$ ${precioEstimado}` : "—";
    const mensaje = t("whatsapp_message", {
      categoria: categoriaActual?.nom ?? "",
      inicio: dateDebut,
      horaInicio: horaInicio || "—",
      fin: dateFin,
      horaFin: horaFin || "—",
      lugar: lieu || "—",
      precio: precioTexto,
      nombre: nom,
    });
    setMensajeWhatsapp(mensaje);

    // Filet de sécurité demandé par le client : WhatsApp s'ouvre TOUJOURS, même si
    // l'enregistrement Supabase échoue ensuite — appelé avant le premier `await` pour
    // rester dans le geste utilisateur (sinon certains navigateurs bloquent le popup).
    window.open(whatsappUrl(mensaje), "_blank");

    const supabase = createClient();
    // Insertion anonyme autorisée par la policy "demandes_insert_public" — pas
    // besoin d'être connecté pour soumettre une demande depuis la vitrine.
    const { error } = await supabase.from("demandes_reservation").insert({
      nom,
      whatsapp,
      email: email || null,
      vehicule_id: vehiculeId,
      date_debut: dateDebut,
      date_fin: dateFin,
      heure_debut: horaInicio || null,
      heure_fin: horaFin || null,
      lieu_prise_en_charge: lieu || null,
      notes: notes || null,
      prix_estime_usd: precioEstimado,
    });

    setEstadoEnvio(error ? "error" : "success");
  }

  function reinicializar() {
    setEstadoEnvio("idle");
    setNom("");
    setWhatsapp("");
    setEmail("");
    setCategorieId("");
    setLieu("");
    setNotes("");
    setHoraInicio("");
    setHoraFin("");
    setMensajeWhatsapp("");
  }

  if (estadoEnvio === "success") {
    return (
      <div className="flex flex-col items-start gap-4 rounded-lg bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-ink">{t("success_title")}</h2>
        <p className="text-ink-soft">{t("success_text")}</p>
        <ExternalButtonLink href={whatsappUrl(mensajeWhatsapp)} variant="whatsapp">
          {t("whatsapp_cta")}
        </ExternalButtonLink>
        <button
          type="button"
          onClick={reinicializar}
          className="text-sm font-medium text-ink-soft underline hover:text-ink"
        >
          {t("new_request")}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-lg bg-white p-8 shadow-sm"
    >
      <label className="block text-sm">
        <span className={labelClass}>{t("field_nombre")}</span>
        <input
          type="text"
          required
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className={inputClass}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className={labelClass}>{t("field_whatsapp")}</span>
          <input
            type="tel"
            required
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block text-sm">
          <span className={labelClass}>{t("field_email")}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className={labelClass}>{t("field_categoria")}</span>
        <select
          required
          value={categorieId}
          onChange={(e) => setCategorieId(e.target.value)}
          className={`${inputClass} bg-white`}
        >
          <option value="" disabled>
            {t("field_categoria_placeholder")}
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nom}
            </option>
          ))}
        </select>
      </label>

      {categorieId && (
        <div>
          <span className={labelClass}>{t("field_vehiculo")}</span>
          <p className="mb-2 text-xs text-ink-soft">{t("field_vehiculo_hint")}</p>

          {vehiculesLoading && (
            <p className="text-sm text-ink-soft">{t("loading_vehiculos")}</p>
          )}

          {!vehiculesLoading && vehicules.length === 0 && (
            <p className="text-sm text-ink-soft">{t("no_vehiculos")}</p>
          )}

          {!vehiculesLoading && vehicules.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {vehicules.map((v, i) => {
                const foto = v.photo_url ?? FLEET_IMAGES[categoriaActual?.nom ?? ""]?.[0];
                const seleccionado = v.id === vehiculeId;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVehiculeId(v.id)}
                    className={`overflow-hidden rounded-lg border-2 text-left transition-colors ${
                      seleccionado ? "border-brand" : "border-black/10 hover:border-black/30"
                    }`}
                  >
                    <div className="relative aspect-[4/3] w-full bg-black/5">
                      {foto ? (
                        <Image src={foto} alt="" fill sizes="150px" className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-ink-soft">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.5}
                            className="h-8 w-8"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 17h14M6 17l1.5-5h9L18 17M8 9h8l1 3H7l1-3ZM7 20a1 1 0 100-2 1 1 0 000 2ZM17 20a1 1 0 100-2 1 1 0 000 2Z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="px-2 py-1.5 text-xs font-medium text-ink">
                      {t("vehiculo_unidad", { n: i + 1 })}
                      {v.annee ? ` · ${v.annee}` : ""}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {vehiculeId && (
        <div>
          <span className={labelClass}>{t("field_fechas")}</span>
          <AvailabilityCalendar
            periodesIndisponibles={periodesIndisponibles}
            dateDebut={dateDebut}
            dateFin={dateFin}
            onChange={(debut, fin) => {
              setDateDebut(debut);
              setDateFin(fin);
            }}
          />
        </div>
      )}

      {vehiculeId && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className={labelClass}>{t("field_hora_inicio")}</span>
            <input
              type="time"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block text-sm">
            <span className={labelClass}>{t("field_hora_fin")}</span>
            <input
              type="time"
              value={horaFin}
              onChange={(e) => setHoraFin(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      )}

      {dateDebut && dateFin && disponibilidad !== "idle" && (
        <p
          className={`text-sm font-medium ${
            disponibilidad === "available"
              ? "text-green-700"
              : disponibilidad === "unavailable"
                ? "text-red-600"
                : "text-ink-soft"
          }`}
        >
          {disponibilidad === "checking" && t("checking_availability")}
          {disponibilidad === "available" && `✓ ${t("available")}`}
          {disponibilidad === "unavailable" && t("unavailable")}
          {disponibilidad === "error" && t("checking_error")}
        </p>
      )}

      {precioEstimado !== null && (
        <div className="rounded-lg bg-brand-light px-4 py-3">
          <p className="text-sm text-ink-soft">{t("price_estimate")}</p>
          <p className="text-2xl font-bold text-brand">US$ {precioEstimado}</p>
          <p className="mt-1 text-xs text-ink-soft">{t("price_note")}</p>
        </div>
      )}

      <label className="block text-sm">
        <span className={labelClass}>{t("field_lugar")}</span>
        <input
          type="text"
          value={lieu}
          onChange={(e) => setLieu(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="block text-sm">
        <span className={labelClass}>{t("field_notas")}</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className={inputClass}
        />
      </label>

      {estadoEnvio === "error" && <p className="text-sm text-red-600">{t("error_submit")}</p>}

      <button
        type="submit"
        disabled={estadoEnvio === "submitting" || !puedeEnviar}
        className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {estadoEnvio === "submitting" ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
