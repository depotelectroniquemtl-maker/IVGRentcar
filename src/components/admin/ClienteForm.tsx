"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded border border-black/20 px-3 py-2 focus:border-brand focus:outline-none";
const labelClass = "mb-1 block font-medium text-ink";

type Cliente = {
  id: string;
  nom: string;
  telephone: string | null;
  email: string | null;
  numero_permis: string | null;
  notes: string | null;
};

export function ClienteForm({ cliente }: { cliente?: Cliente }) {
  const router = useRouter();
  const t = useTranslations("admin.clients");
  const tCommon = useTranslations("admin.common");
  const editing = Boolean(cliente);

  const [nom, setNom] = useState(cliente?.nom ?? "");
  const [telephone, setTelephone] = useState(cliente?.telephone ?? "");
  const [email, setEmail] = useState(cliente?.email ?? "");
  const [numeroPermis, setNumeroPermis] = useState(cliente?.numero_permis ?? "");
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
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4 rounded-lg bg-white p-8 shadow-sm">
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
        <span className={labelClass}>{t("field_notas")}</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className={inputClass}
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? tCommon("saving") : editing ? t("save_changes") : t("submit_create")}
      </button>
    </form>
  );
}
