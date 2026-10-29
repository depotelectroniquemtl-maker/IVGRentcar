"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js/min";
import { createClient } from "@/lib/supabase/client";
import { PhoneField } from "@/components/site/PhoneField";
import { defaultCountryForLocale, isE164, normalizePhone } from "@/lib/phone";
import { LANGUES, estLangue } from "@/lib/demandes/libelles";
import { Card, inputClass, labelClass, primaryButtonClass, secondaryLinkClass } from "@/components/admin/form-ui";

type Cliente = {
  id: string;
  nom: string;
  telephone: string | null;
  telephone_a_verifier?: boolean;
  email: string | null;
  numero_permis: string | null;
  permis_expiration: string | null;
  cedula: string | null;
  passeport: string | null;
  passeport_expiration: string | null;
  nationalite: string | null;
  adresse: string | null;
  residencia: string | null;
  notes: string | null;
  langue?: string | null;
};

export function ClienteForm({
  title,
  secondaryActions,
  cliente,
  prefill,
  retour,
  demandeId,
}: {
  title: string;
  secondaryActions?: ReactNode;
  cliente?: Cliente;
  // Nouvelle fiche créée depuis une demande (/admin/demandes) : champs préremplis, puis retour
  // sur la demande après l'enregistrement plutôt que sur la liste des clients.
  prefill?: { nom?: string; telephone?: string; email?: string; langue?: string };
  retour?: string;
  // Fiche créée depuis une demande : la demande est liée à la fiche créée (client_id).
  demandeId?: string;
}) {
  const router = useRouter();
  const t = useTranslations("admin.clients");
  const tCommon = useTranslations("admin.common");
  const tReservar = useTranslations("reservar");
  const locale = useLocale();
  const editing = Boolean(cliente);

  const [nom, setNom] = useState(cliente?.nom ?? prefill?.nom ?? "");
  // Numéro déjà en E.164 : on affiche le pays et le numéro national. Sinon (ancien numéro en
  // format libre, « à vérifier »), on affiche la valeur brute telle quelle, sans deviner de pays.
  const initialTel = cliente?.telephone ?? prefill?.telephone ?? "";
  const parsedTel = isE164(initialTel) ? parsePhoneNumberFromString(initialTel) : undefined;
  const [telephone, setTelephone] = useState(parsedTel ? parsedTel.formatNational() : initialTel);
  const [paysTel, setPaysTel] = useState<CountryCode>(
    // Admin en espagnol : République dominicaine (clientèle locale), contrairement au site public.
    parsedTel?.country ?? (locale === "es" ? "DO" : defaultCountryForLocale(locale)),
  );
  const [errorTel, setErrorTel] = useState<string | null>(null);
  const [telTouched, setTelTouched] = useState(false);
  const [email, setEmail] = useState(cliente?.email ?? prefill?.email ?? "");
  const [numeroPermis, setNumeroPermis] = useState(cliente?.numero_permis ?? "");
  const [permisExpiration, setPermisExpiration] = useState(cliente?.permis_expiration ?? "");
  const [cedula, setCedula] = useState(cliente?.cedula ?? "");
  const [passeport, setPasseport] = useState(cliente?.passeport ?? "");
  const [passeportExpiration, setPasseportExpiration] = useState(
    cliente?.passeport_expiration ?? "",
  );
  const [nationalite, setNationalite] = useState(cliente?.nationalite ?? "");
  const [adresse, setAdresse] = useState(cliente?.adresse ?? "");
  const [residencia, setResidencia] = useState(cliente?.residencia ?? "");
  const [notes, setNotes] = useState(cliente?.notes ?? "");
  const [langue, setLangue] = useState(cliente?.langue ?? (estLangue(prefill?.langue) ? prefill.langue : ""));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // Téléphone : vide = autorisé ; modifié = validé et enregistré en E.164 ; non modifié
    // (ancien numéro « à vérifier ») = conservé tel quel, avec son marqueur.
    let telephoneFinal: string | null = cliente?.telephone ?? null;
    let aVerifier = cliente?.telephone_a_verifier ?? false;
    if (!telephone.trim()) {
      telephoneFinal = null;
      aVerifier = false;
    } else if (telTouched || !editing) {
      const tel = normalizePhone(telephone, paysTel);
      if (!tel.ok) {
        setErrorTel(tReservar(`phone_error_${tel.error}`));
        return;
      }
      telephoneFinal = tel.e164;
      aVerifier = false;
    }
    setErrorTel(null);
    setLoading(true);

    const supabase = createClient();
    const payload = {
      nom,
      telephone: telephoneFinal,
      telephone_a_verifier: aVerifier,
      email: email || null,
      numero_permis: numeroPermis || null,
      permis_expiration: permisExpiration || null,
      cedula: cedula || null,
      passeport: passeport || null,
      passeport_expiration: passeportExpiration || null,
      nationalite: nationalite || null,
      adresse: adresse || null,
      residencia: residencia || null,
      notes: notes || null,
      langue: estLangue(langue) ? langue : null,
    };

    const { data: enregistre, error } = editing
      ? await supabase.from("clients").update(payload).eq("id", cliente!.id).select("id").single()
      : await supabase.from("clients").insert(payload).select("id").single();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (!editing && demandeId && enregistre) {
      const { error: errLien } = await supabase
        .from("demandes_reservation")
        .update({ client_id: enregistre.id })
        .eq("id", demandeId);
      if (errLien) {
        setError(errLien.message);
        setLoading(false);
        return;
      }
    }

    router.push(retour ?? "/admin/clients");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        <div className="flex items-center gap-3">
          <Link href={retour ?? "/admin/clients"} className={secondaryLinkClass}>
            {tCommon("cancel")}
          </Link>
          <button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading ? tCommon("saving") : editing ? t("save_changes") : t("submit_create")}
          </button>
        </div>
      </div>

      {secondaryActions}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
        <div className="flex flex-col gap-5">
          <Card title={t("section_basico")}>
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
              <div>
                <PhoneField
                  id="client-telephone"
                  required={false}
                  // Pays toujours affichés en français dans l'admin (la recherche comprend aussi
                  // l'anglais et l'espagnol).
                  namesLocale="fr"
                  label={t("field_telefono")}
                  country={paysTel}
                  onCountryChange={(c) => {
                    setPaysTel(c);
                    setTelTouched(true);
                    setErrorTel(null);
                  }}
                  value={telephone}
                  onValueChange={(v) => {
                    setTelephone(v);
                    setTelTouched(true);
                    setErrorTel(null);
                  }}
                  error={errorTel}
                />
                {cliente?.telephone_a_verifier && !telTouched && (
                  <p className="mt-1 text-xs font-medium text-amber-800">
                    ⚠ {t("a_verifier_hint")}
                  </p>
                )}
              </div>

              <label className="block text-sm">
                <span className={labelClass}>{t("field_correo")}</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>

            <label className="block text-sm sm:max-w-[50%]">
              <span className={labelClass}>{t("field_langue")}</span>
              <select value={langue} onChange={(e) => setLangue(e.target.value)} className={inputClass}>
                <option value="">{tCommon("dash")}</option>
                {LANGUES.map((l) => (
                  <option key={l} value={l}>
                    {t(`langue_${l}`)}
                  </option>
                ))}
              </select>
            </label>
          </Card>

          <Card title={t("section_documentos")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className={labelClass}>{t("field_licencia")}</span>
                <input
                  type="text"
                  value={numeroPermis}
                  onChange={(e) => setNumeroPermis(e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="block text-sm">
                <span className={labelClass}>{t("field_licencia_exp")}</span>
                <input
                  type="date"
                  value={permisExpiration}
                  onChange={(e) => setPermisExpiration(e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className={labelClass}>{t("field_cedula")}</span>
                <input
                  type="text"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="block text-sm">
                <span className={labelClass}>{t("field_nacionalidad")}</span>
                <input
                  type="text"
                  value={nationalite}
                  onChange={(e) => setNationalite(e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className={labelClass}>{t("field_pasaporte")}</span>
                <input
                  type="text"
                  value={passeport}
                  onChange={(e) => setPasseport(e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="block text-sm">
                <span className={labelClass}>{t("field_pasaporte_exp")}</span>
                <input
                  type="date"
                  value={passeportExpiration}
                  onChange={(e) => setPasseportExpiration(e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card title={t("section_direccion")}>
            <label className="block text-sm">
              <span className={labelClass}>{t("field_direccion")}</span>
              <input
                type="text"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block text-sm">
              <span className={labelClass}>{t("field_residencia")}</span>
              <input
                type="text"
                value={residencia}
                onChange={(e) => setResidencia(e.target.value)}
                className={inputClass}
              />
            </label>
          </Card>

          <Card title={tCommon("section_notas")}>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className={inputClass}
            />
          </Card>
        </div>
      </div>
    </form>
  );
}
