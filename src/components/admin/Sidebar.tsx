import Link from "next/link";
import type { Profile } from "@/lib/types";
import { LogoutButton } from "@/components/admin/LogoutButton";

const NAV_ITEMS = [
  { href: "/admin", label: "Panel", adminOnly: false },
  { href: "/admin/reservations", label: "Reservas", adminOnly: false },
  { href: "/admin/vehicules", label: "Vehículos", adminOnly: false },
  { href: "/admin/clients", label: "Clientes", adminOnly: false },
  { href: "/admin/tarifs", label: "Tarifas", adminOnly: false },
  { href: "/admin/utilisateurs", label: "Usuarios", adminOnly: true },
] as const;

export function Sidebar({ profile }: { profile: Profile }) {
  return (
    <aside className="flex h-screen w-56 flex-col justify-between bg-ink text-white">
      <div>
        <div className="border-b border-white/10 px-4 py-5">
          <p className="font-bold">
            <span className="text-brand">I.V.J</span> Polanco
          </p>
          <p className="text-xs text-white/50">Panel interno</p>
        </div>

        <nav className="flex flex-col gap-1 p-3 text-sm">
          {NAV_ITEMS.filter((item) => !item.adminOnly || profile.role === "admin").map(
            (item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded px-3 py-2 transition-colors hover:bg-white/10"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
      </div>

      <div className="border-t border-white/10 p-3">
        <p className="px-3 py-1 text-xs text-white/50">
          {profile.nom} · {profile.role === "admin" ? "Admin" : "Empleado"}
        </p>
        <LogoutButton />
      </div>
    </aside>
  );
}
