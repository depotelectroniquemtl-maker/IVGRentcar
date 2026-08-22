"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createEmploye } from "@/app/admin/(protected)/utilisateurs/actions";

const inputClass =
  "w-full rounded border border-black/20 px-3 py-2 focus:border-brand focus:outline-none";
const labelClass = "mb-1 block font-medium text-ink";

export function UsuarioForm() {
  const router = useRouter();

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
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4 rounded-lg bg-white p-8 shadow-sm">
      <label className="block text-sm">
        <span className={labelClass}>Nombre completo</span>
        <input
          type="text"
          required
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="block text-sm">
        <span className={labelClass}>Correo</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="block text-sm">
        <span className={labelClass}>Contraseña temporal</span>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        <span className="mt-1 block text-xs text-ink-soft">
          Mínimo 6 caracteres. Compártela con el empleado por un canal seguro.
        </span>
      </label>

      <label className="block text-sm">
        <span className={labelClass}>Rol</span>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "admin" | "employe")}
          className={`${inputClass} bg-white`}
        >
          <option value="employe">Empleado</option>
          <option value="admin">Admin</option>
        </select>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? "Creando…" : "Crear usuario"}
      </button>
    </form>
  );
}
