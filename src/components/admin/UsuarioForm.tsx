"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createEmploye } from "@/app/admin/(protected)/utilisateurs/actions";
import { inputClass, labelClass, primaryButtonClass } from "@/components/admin/form-ui";

export function UsuarioForm() {
  const router = useRouter();
  const t = useTranslations("admin.utilisateurs");
  const tCommon = useTranslations("admin.common");

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "employe">("employe");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await createEmploye({ nom, email, password, role });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/admin/utilisateurs");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4 rounded-lg bg-white p-8 shadow-sm">
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

      <label className="block text-sm">
        <span className={labelClass}>{t("field_correo")}</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="block text-sm">
        <span className={labelClass}>{t("field_password")}</span>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        <span className="mt-1 block text-xs text-ink-soft">{t("field_password_hint")}</span>
      </label>

      <label className="block text-sm">
        <span className={labelClass}>{t("field_rol")}</span>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "admin" | "employe")}
          className={inputClass}
        >
          <option value="employe">{tCommon("role_employe")}</option>
          <option value="admin">{tCommon("role_admin")}</option>
        </select>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={loading} className={primaryButtonClass}>
        {loading ? t("creating") : t("submit_create")}
      </button>
    </form>
  );
}
