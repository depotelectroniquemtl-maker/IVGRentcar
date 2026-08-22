import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClienteForm } from "@/components/admin/ClienteForm";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient();

  const { data: cliente } = await supabase
    .from("clients")
    .select("id, nom, telephone, email, numero_permis, notes")
    .eq("id", id)
    .single();

  if (!cliente) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Editar cliente — {cliente.nom}</h1>
      <ClienteForm cliente={cliente} />
    </div>
  );
}
