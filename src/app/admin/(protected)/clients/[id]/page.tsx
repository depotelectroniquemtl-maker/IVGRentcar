import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { ClienteForm } from "@/components/admin/ClienteForm";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient();
  const t = await getAdminTranslator("admin.clients");

  const { data: cliente } = await supabase
    .from("clients")
    .select(
      "id, nom, telephone, email, numero_permis, permis_expiration, cedula, passeport, passeport_expiration, nationalite, adresse, residencia, notes",
    )
    .eq("id", id)
    .single();

  if (!cliente) notFound();

  return <ClienteForm title={t("edit_title", { nom: cliente.nom })} cliente={cliente} />;
}
