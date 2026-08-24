import Link from "next/link";
import type { Profile } from "@/lib/types";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { AdminLocaleSwitcher } from "@/components/admin/AdminLocaleSwitcher";
import { AdminMobileNav, type NavEntry } from "@/components/admin/AdminMobileNav";
import { getAdminTranslator } from "@/lib/admin-i18n";

// Regroupé en trois blocs pour rester lisible à mesure que le nombre d'écrans admin
// grandit (12 aujourd'hui à plat, difficile à scanner) : Opérations (le quotidien),
// Données (fiches de référence, moins consultées), Admin (réservé aux admins). Aide
// reste seule hors groupe, en dernier — c'est un utilitaire permanent, pas une catégorie
// de données.
const NAV_GROUPS = [
  {
    groupKey: "group_operations",
    items: [
      { href: "/admin", key: "nav_panel", adminOnly: false },
      { href: "/admin/demandes", key: "nav_demandes", adminOnly: false },
      { href: "/admin/reservations", key: "nav_reservations", adminOnly: false },
      { href: "/admin/calendrier", key: "nav_calendrier", adminOnly: false },
      { href: "/admin/entretiens", key: "nav_entretiens", adminOnly: false },
    ],
  },
  {
    groupKey: "group_donnees",
    items: [
      { href: "/admin/vehicules", key: "nav_vehicules", adminOnly: false },
      { href: "/admin/clients", key: "nav_clients", adminOnly: false },
      { href: "/admin/garantes", key: "nav_garantes", adminOnly: false },
      { href: "/admin/tarifs", key: "nav_tarifs", adminOnly: false },
    ],
  },
  {
    groupKey: "group_admin",
    items: [
      { href: "/admin/utilisateurs", key: "nav_utilisateurs", adminOnly: true },
      { href: "/admin/rentabilite", key: "nav_rentabilite", adminOnly: true },
    ],
  },
] as const;

const AIDE_ITEM = { href: "/admin/aide", key: "nav_aide" } as const;

export async function Sidebar({ profile }: { profile: Profile }) {
  const t = await getAdminTranslator("admin.sidebar");
  const tCommon = await getAdminTranslator("admin.common");

  const entries: NavEntry[] = [];
  for (const group of NAV_GROUPS) {
    const visibleItems = group.items.filter((item) => !item.adminOnly || profile.role === "admin");
    if (visibleItems.length === 0) continue;
    entries.push({ type: "group", label: t(group.groupKey) });
    for (const item of visibleItems) {
      entries.push({ type: "link", href: item.href, label: t(item.key) });
    }
  }
  entries.push({ type: "link", href: AIDE_ITEM.href, label: t(AIDE_ITEM.key) });

  const footer = (
    <div className="flex flex-col gap-2">
      <p className="px-3 py-1 text-xs text-white/50">
        {profile.nom} · {profile.role === "admin" ? tCommon("role_admin") : tCommon("role_employe")}
      </p>
      <AdminLocaleSwitcher />
      <LogoutButton />
    </div>
  );

  return (
    <>
      <AdminMobileNav
        entries={entries}
        footer={footer}
        ariaOpen={t("menu_open")}
        ariaClose={t("menu_close")}
      />

      <aside className="hidden h-screen w-56 flex-col justify-between bg-ink text-white lg:flex print:hidden">
        <div className="overflow-y-auto">
          <div className="border-b border-white/10 px-4 py-5">
            <p className="font-bold">
              <span className="text-brand">I.V.J</span> Polanco
            </p>
            <p className="text-xs text-white/50">{t("subtitle")}</p>
          </div>

          <nav className="flex flex-col gap-1 p-3 text-sm">
            {entries.map((entry, i) =>
              entry.type === "group" ? (
                <p
                  key={`g-${i}`}
                  className={`px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-white/35 ${i === 0 ? "pt-1" : "pt-4"}`}
                >
                  {entry.label}
                </p>
              ) : (
                <Link
                  key={entry.href}
                  href={entry.href}
                  className="rounded px-3 py-2 transition-colors hover:bg-white/10"
                >
                  {entry.label}
                </Link>
              ),
            )}
          </nav>
        </div>

        <div className="border-t border-white/10 p-3">{footer}</div>
      </aside>
    </>
  );
}
