"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const t = useTranslations("admin.sidebar");

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded px-3 py-2 text-left text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
    >
      {t("logout")}
    </button>
  );
}
