"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { ExternalButtonLink } from "@/components/ui/Button";
import { whatsappUrl } from "@/lib/constants";
import type { CategorieAvecTarifs } from "@/lib/types";

type Disponibilidad = "idle" | "checking" | "available" | "unavailable" | "error";
type EstadoEnvio = "idle" | "submitting" | "success" | "error";

const inputClass =
  "w-full rounded border border-black/20 px-3 py-2 focus:border-brand focus:outline-none";
const labelClass = "mb-1 block font-medium text-ink";

export function ReservarForm({ categories }: { categories: CategorieAvecTarifs[] }) {
  const t = useTranslations("reservar");

  const [nom, setNom] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [categorieId, setCategorieId] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [lieu, setLieu] = useState("");
  const [notes, setNotes] = useState("");

  const [disponibilidad, setDisponibilidad] = useState<Disponibilidad>("idle");
  const [estadoEnvio, setEstadoEnvio] = useState<EstadoEnvio>("idle");

  const fechasValidas = !dateDebut || !dateFin || dateFin >= dateDebut;

  // Vérifie la disponibilité en direct dès que catégorie + les deux dates sont
  // renseignées, via la fonction SQL disponibilite_categorie (RPC, exécutable par
  // anon — voir supabase/migrations/0006_demandes_reservation.sql).
  useEffect(() => {
    if (!categorieId || !dateDebut || !dateFin || !fechasValidas) {
      setDisponibilidad("idle");
      return;
    }

    let cancelado = false;
    setDisponibilidad("checking");

    const supabase = createClient();
    supabase
      .rpc("disponibilite_categorie", {
        p_categorie_id: categorieId,
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
  }, [categorieId, dateDebut, dateFin, fechasValidas]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!fechasValidas) return;

    setEstadoEnvio("submitting");

    const supabase = createClient();
    // Insertion anonyme autorisée par la policy "demandes_insert_public" — pas
    // besoin d'être connecté pour soumettre une demande depuis la vitrine.
    const { error } = await supabase.from("demandes_reservation").insert({
      nom,
      whatsapp,
      email: email || null,
      categorie_id: categorieId,
      date_debut: dateDebut,
      date_fin: dateFin,
      lieu_prise_en_charge: lieu || null,
      notes: notes || null,
    });

    if (error) {
      setEstadoEnvio("error");
      return;
    }

    setEstadoEnvio("success");
  }

  if (estadoEnvio === "success") {
    const categoriaNombre = categories.find((c) => c.id === categorieId)?.nom ?? "";
    const mensaje = t("whatsapp_message", {
      categoria: categoriaNombre,
      inicio: dateDebut,
      fin: dateFin,
      nombre: nom,
    });

    return (
      <div className="flex flex-col items-start gap-4 rounded-lg bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-ink">{t("success_title")}</h2>
        <p className="text-ink-soft">{t("success_text")}</p>
        <ExternalButtonLink href={whatsappUrl(mensaje)} variant="whatsapp">
          {t("whatsapp_cta")}
        </ExternalButtonLink>
        <button
          type="button"
          onClick={() => {
            setEstadoEnvio("idle");
            setNom("");
            setWhatsapp("");
            setEmail("");
            setCategorieId("");
            setDateDebut("");
            setDateFin("");
            setLieu("");
            setNotes("");
          }}
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

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className={labelClass}>{t("field_fecha_inicio")}</span>
          <input
            type="date"
            required
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block text-sm">
          <span className={labelClass}>{t("field_fecha_fin")}</span>
          <input
            type="date"
            required
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      {!fechasValidas && <p className="text-sm text-red-600">{t("error_dates")}</p>}

      {fechasValidas && disponibilidad !== "idle" && (
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
        disabled={estadoEnvio === "submitting" || !fechasValidas}
        className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {estadoEnvio === "submitting" ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
