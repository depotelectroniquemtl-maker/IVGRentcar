"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Card, inputClass, labelClass, primaryButtonClass, secondaryLinkClass } from "@/components/admin/form-ui";

type Garante = {
  id: string;
  nom: string;
  telephone: string | null;
  cedula: string | null;
  adresse: string | null;
  notes: string | null;
};

export function GaranteForm({
  title,
  secondaryActions,
  garante,
}: {
  title: string;
  secondaryActions?: ReactNode;
  garante?: Garante;
}) {
  const router = useRouter();
  const t = useTranslations("admin.garantes");
  const tCommon = useTranslations("admin.common");
  const editing = Boolean(garante);

  const [nom, setNom] = useState(garante?.nom ?? "");
  const [telephone, setTelephone] = useState(garante?.telephone ?? "");
  const [cedula, setCedula] = useState(garante?.cedula ?? "");
  const [adresse, setAdresse] = useState(garante?.adresse ?? "");
  const [notes, setNotes] = useState(garante?.notes ?? "");

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
      cedula: cedula || null,
      adresse: adresse || null,
      notes: notes || null,
    };

    const { error } = editing
      ? await supabase.from("garants").update(payload).eq("id", garante!.id)
      : await supabase.from("garants").insert(payload);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin/garantes");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin/garantes" className={secondaryLinkClass}>
            {tCommon("cancel")}
          </Link>
          <button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading ? tCommon("saving") : editing ? t("save_changes") : t("submit_create")}
          </button>
        </div>
      </div>

      {secondaryActions}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card title={t("section_datos")}>
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
            <span className={labelClass}>{t("field_cedula")}</span>
            <input
              type="text"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

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
          <span className={labelClass}>{tCommon("section_notas")}</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className={inputClass}
          />
        </label>
      </Card>
    </form>
  );
}
