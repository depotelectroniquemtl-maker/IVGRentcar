import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/**
 * Profil (rôle admin/employe) du compte staff connecté, ou null si personne n'est
 * connecté. À utiliser côté serveur pour les vérifications d'accès — jamais se fier
 * uniquement à l'affichage/masquage du menu (leçon gestion-stock : "vérification côté
 * serveur, pas seulement dans l'affichage").
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, nom, role")
    .eq("id", user.id)
    .single();

  return data as Profile | null;
}
