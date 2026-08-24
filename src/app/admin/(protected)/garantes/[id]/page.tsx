import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { getCurrentProfile } from "@/lib/supabase/queries/profile";
import { GaranteForm } from "@/components/admin/GaranteForm";
import { DeleteGaranteButton } from "@/components/admin/DeleteGaranteButton";

export default async function EditarGarantePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient();
  const t = await getAdminTranslator("admin.garantes");
  const profile = await getCurrentProfile();

  const { data: garante } = await supabase
    .from("garants")
    .select("id, nom, telephone, cedula, adresse, notes")
    .eq("id", id)
    .single();

  if (!garante) notFound();

  return (
    <GaranteForm
      title={t("edit_title", { nom: garante.nom })}
      secondaryActions={
        profile?.role === "admin" ? (
          <div className="flex justify-end">
            <DeleteGaranteButton id={garante.id} />
          </div>
        ) : undefined
      }
      garante={garante}
    />
  );
}
