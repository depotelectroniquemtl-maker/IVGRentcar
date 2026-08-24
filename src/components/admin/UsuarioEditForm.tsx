"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { updateEmploye, setEmployeBanned } from "@/app/admin/(protected)/utilisateurs/actions";
import { inputClass, labelClass, primaryButtonClass, secondaryLinkClass } from "@/components/admin/form-ui";

export function UsuarioEditForm({
  title,
  id,
  nombreInicial,
  rolInicial,
  baneadoInicial,
  esUnoMismo,
}: {
  title: string;
  id: string;
  nombreInicial: string;
  rolInicial: "admin" | "employe";
  baneadoInicial: boolean;
  esUnoMismo: boolean;
}) {
  const router = useRouter();
  const t = useTranslations("admin.utilisateurs");
  const tCommon = useTranslations("admin.common");

  const [nom, setNom] = useState(nombreInicial);
  const [role, setRole] = useState<"admin" | "employe">(rolInicial);
  const [baneado, setBaneado] = useState(baneadoInicial);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await updateEmploye({ id, nom, role });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/admin/utilisateurs");
    router.refresh();
  }

  async function handleToggleBaneado() {
    setToggling(true);
    setToggleError(null);

    const result = await setEmployeBanned({ id, banned: !baneado });

    if (result.error) {
      setToggleError(result.error);
      setToggling(false);
      return;
    }

    setBaneado(!baneado);
    setToggling(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin/utilisateurs" className={secondaryLinkClass}>
            {tCommon("cancel")}
          </Link>
          <button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading ? tCommon("saving") : t("save_changes")}
          </button>
        </div>
      </div>

      {!esUnoMismo && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleToggleBaneado}
            disabled={toggling}
            className={baneado ? primaryButtonClass : secondaryLinkClass}
          >
            {toggling ? tCommon("saving") : baneado ? t("action_activar") : t("action_desactivar")}
          </button>
          {baneado && <span className="text-sm font-medium text-red-600">{t("estado_desactivado")}</span>}
        </div>
      )}
      {toggleError && <p className="text-sm text-red-600">{toggleError}</p>}

      <div className="flex flex-col gap-4 rounded-lg border border-black/10 bg-white p-8 shadow-sm">
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
      </div>
    </form>
  );
}
