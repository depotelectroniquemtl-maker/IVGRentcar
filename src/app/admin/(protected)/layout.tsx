import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/queries/profile";
import { Sidebar } from "@/components/admin/Sidebar";
import { AdminChrome } from "@/components/admin/AdminChrome";

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

  return <AdminChrome sidebar={<Sidebar profile={profile} />}>{children}</AdminChrome>;
}
