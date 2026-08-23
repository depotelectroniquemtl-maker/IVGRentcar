"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Card, inputClass, labelClass, primaryButtonClass, secondaryLinkClass } from "@/components/admin/form-ui";

type Cliente = {
  id: string;
  nom: string;
  telephone: string | null;
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
};

export function ClienteForm({ title, cliente }: { title: string; cliente?: Cliente }) {
  const router = useRouter();
  const t = useTranslations("admin.clients");
  const tCommon = useTranslations("admin.common");
  const editing = Boolean(cliente);

  const [nom, setNom] = useState(cliente?.nom ?? "");
  const [telephone, setTelephone] = useState(cliente?.telephone ?? "");
  const [email, setEmail] = useState(cliente?.email ?? "");
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const payload = {
      nom,
      telephone: telephone || null,
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
    };

    const { error } = editing
      ? await supabase.from("clients").update(payload).eq("id", cliente!.id)
      : await supabase.from("clients").insert(payload);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin/clients");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin/clients" className={secondaryLinkClass}>
            {tCommon("cancel")}
          </Link>
          <button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading ? tCommon("saving") : editing ? t("save_changes") : t("submit_create")}
          </button>
        </div>
      </div>

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
              <label className="block text-sm">
                <span className={labelClass}>{t("field_telefono")}</span>
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className={inputClass}
                />
              </label>

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
