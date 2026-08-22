"use server";

import { getCurrentProfile } from "@/lib/supabase/queries/profile";
import { createAdminClient } from "@/lib/supabase/admin";

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
    return { error: "Acceso restringido a administradores." };
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
