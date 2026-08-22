import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

// Client "service role" — contourne RLS entièrement. NE JAMAIS importer ce module depuis
// un composant "use client" ou tout code qui finit dans le bundle navigateur : la clé
// SUPABASE_SERVICE_ROLE_KEY (sans préfixe NEXT_PUBLIC_) n'est lisible que côté serveur.
// Réservé aux Server Actions / Route Handlers qui ont déjà vérifié eux-mêmes que
// l'appelant est admin (voir utilisateurs/actions.ts) — ce client n'applique aucune policy.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
