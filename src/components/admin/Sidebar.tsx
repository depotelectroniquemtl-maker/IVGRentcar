import Link from "next/link";
import type { Profile } from "@/lib/types";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { AdminLocaleSwitcher } from "@/components/admin/AdminLocaleSwitcher";
import { getAdminTranslator } from "@/lib/admin-i18n";

const NAV_ITEMS = [
  { href: "/admin", key: "nav_panel", adminOnly: false },
  { href: "/admin/demandes", key: "nav_demandes", adminOnly: false },
  { href: "/admin/reservations", key: "nav_reservations", adminOnly: false },
  { href: "/admin/calendrier", key: "nav_calendrier", adminOnly: false },
  { href: "/admin/vehicules", key: "nav_vehicules", adminOnly: false },
  { href: "/admin/entretiens", key: "nav_entretiens", adminOnly: false },
  { href: "/admin/clients", key: "nav_clients", adminOnly: false },
  { href: "/admin/tarifs", key: "nav_tarifs", adminOnly: false },
  { href: "/admin/utilisateurs", key: "nav_utilisateurs", adminOnly: true },
] as const;

export async function Sidebar({ profile }: { profile: Profile }) {
  const t = await getAdminTranslator("admin.sidebar");
  const tCommon = await getAdminTranslator("admin.common");

  return (
    <aside className="flex h-screen w-56 flex-col justify-between bg-ink text-white">
      <div>
        <div className="border-b border-white/10 px-4 py-5">
          <p className="font-bold">
            <span className="text-brand">I.V.J</span> Polanco
          </p>
          <p className="text-xs text-white/50">{t("subtitle")}</p>
        </div>

        <nav className="flex flex-col gap-1 p-3 text-sm">
          {NAV_ITEMS.filter((item) => !item.adminOnly || profile.role === "admin").map(
            (item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded px-3 py-2 transition-colors hover:bg-white/10"
              >
                {t(item.key)}
              </Link>
            ),
          )}
        </nav>
      </div>

      <div className="border-t border-white/10 p-3">
        <p className="px-3 py-1 text-xs text-white/50">
          {profile.nom} · {profile.role === "admin" ? tCommon("role_admin") : tCommon("role_employe")}
        </p>
        <div className="my-2">
          <AdminLocaleSwitcher />
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
