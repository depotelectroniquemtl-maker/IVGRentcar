"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { AdminLocaleSwitcher } from "@/components/admin/AdminLocaleSwitcher";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("admin.login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(t("error"));
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="absolute right-4 top-4">
        <AdminLocaleSwitcher />
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg bg-white p-8 shadow-lg"
      >
        <p className="mb-1 text-center font-bold text-ink">
          <span className="text-brand">I.V.J</span> Polanco
        </p>
        <h1 className="mb-6 text-center text-sm text-ink-soft">{t("subtitle")}</h1>

        <label className="mb-3 block text-sm">
          <span className="mb-1 block font-medium text-ink">{t("email")}</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-black/20 px-3 py-2 focus:border-brand focus:outline-none"
          />
        </label>

        <label className="mb-4 block text-sm">
          <span className="mb-1 block font-medium text-ink">{t("password")}</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-black/20 px-3 py-2 focus:border-brand focus:outline-none"
          />
        </label>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-brand px-4 py-2 font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? t("connecting") : t("submit")}
        </button>
      </form>
    </div>
  );
}
