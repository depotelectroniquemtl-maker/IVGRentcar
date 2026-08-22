import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/queries/profile";
import { Sidebar } from "@/components/admin/Sidebar";

// Vérification d'accès faite ICI, côté serveur, pour toutes les pages internes — pas
// seulement en cachant des liens dans le menu (leçon gestion-stock).
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar profile={profile} />
      <main className="flex-1 overflow-y-auto bg-black/[0.02] p-8">
        {children}
      </main>
    </div>
  );
}
