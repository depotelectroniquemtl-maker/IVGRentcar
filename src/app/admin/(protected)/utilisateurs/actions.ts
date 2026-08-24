"use server";

import { getCurrentProfile } from "@/lib/supabase/queries/profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminTranslator } from "@/lib/admin-i18n";

type RoleStaff = "admin" | "employe";

// Server Action = endpoint réseau appelable directement, pas seulement depuis le bouton
// du formulaire — donc revérifié ici que l'appelant est admin, pas seulement dans
// l'affichage de la page /admin/utilisateurs/nuevo (même réflexe que partout ailleurs
// dans ce projet : vérification côté serveur, jamais seulement côté affichage).
export async function createEmploye({
  nom,
  email,
  password,
  role,
}: {
  nom: string;
  email: string;
  password: string;
  role: RoleStaff;
}): Promise<{ error: string | null }> {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") {
    const tCommon = await getAdminTranslator("admin.common");
    return { error: tCommon("access_restricted") };
  }

  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nom },
  });

  if (error) {
    return { error: error.message };
  }

  // Le trigger handle_new_user crée le profil avec role="employe" par défaut. Si "admin"
  // a été demandé, on le corrige ici — le client admin contourne RLS donc l'update passe
  // même si l'appelant (nous, côté serveur) n'a pas de session utilisateur sur ce client.
  if (role === "admin" && data.user) {
    const { error: updateError } = await admin
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", data.user.id);

    if (updateError) {
      return { error: updateError.message };
    }
  }

  return { error: null };
}

// Modifie le nom/rôle d'un compte staff existant — création uniquement gérait jusque-là,
// aucune façon de corriger une faute de frappe sur le nom ou de changer un rôle sans
// recréer le compte.
export async function updateEmploye({
  id,
  nom,
  role,
}: {
  id: string;
  nom: string;
  role: RoleStaff;
}): Promise<{ error: string | null }> {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") {
    const tCommon = await getAdminTranslator("admin.common");
    return { error: tCommon("access_restricted") };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ nom, role }).eq("id", id);

  return { error: error?.message ?? null };
}

// Désactivation réversible d'un compte staff, au niveau Auth (pas seulement un flag
// cosmétique sur profiles) : ban_duration bloque réellement la connexion, "none" débloque.
// Un admin ne peut pas se désactiver lui-même — risque de se retrouver bloqué hors du
// panneau sans personne pour l'aider à revenir en arrière.
export async function setEmployeBanned({
  id,
  banned,
}: {
  id: string;
  banned: boolean;
}): Promise<{ error: string | null }> {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") {
    const tCommon = await getAdminTranslator("admin.common");
    return { error: tCommon("access_restricted") };
  }
  if (profile.id === id) {
    const t = await getAdminTranslator("admin.utilisateurs");
    return { error: t("error_self_deactivate") };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(id, {
    ban_duration: banned ? "876000h" : "none",
  });

  return { error: error?.message ?? null };
}
