import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/supabase/queries/profile";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { UsuarioEditForm } from "@/components/admin/UsuarioEditForm";

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const tCommon = await getAdminTranslator("admin.common");

  if (profile?.role !== "admin") {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <p className="text-ink">{tCommon("access_restricted")}</p>
      </div>
    );
  }

  const t = await getAdminTranslator("admin.utilisateurs");
  const supabase = createClient();

  const { data: usuario } = await supabase
    .from("profiles")
    .select("id, nom, role")
    .eq("id", id)
    .single();

  if (!usuario) notFound();

  // banned_until n'existe que dans l'API Auth admin (pas dans la table profiles) — c'est
  // le seul moyen de savoir si le compte est réellement bloqué à la connexion.
  const admin = createAdminClient();
  const { data: authUser } = await admin.auth.admin.getUserById(id);
  const baneado = Boolean(
    authUser?.user?.banned_until && new Date(authUser.user.banned_until) > new Date(),
  );

  return (
    <UsuarioEditForm
      title={t("edit_title", { nombre: usuario.nom })}
      id={usuario.id}
      nombreInicial={usuario.nom}
      rolInicial={usuario.role as "admin" | "employe"}
      baneadoInicial={baneado}
      esUnoMismo={profile.id === usuario.id}
    />
  );
}
