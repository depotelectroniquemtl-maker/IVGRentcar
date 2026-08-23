import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { VehiculeForm } from "@/components/admin/VehiculeForm";

export default async function EditarVehiculoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient();
  const t = await getAdminTranslator("admin.vehicules");
  const tEntretiens = await getAdminTranslator("admin.entretiens");
  const tCommon = await getAdminTranslator("admin.common");

  const TYPE_LABELS: Record<string, string> = {
    vidange: tCommon("entretien_type_vidange"),
    freins: tCommon("entretien_type_freins"),
    pneus: tCommon("entretien_type_pneus"),
    reparation: tCommon("entretien_type_reparation"),
    inspection: tCommon("entretien_type_inspection"),
    autre: tCommon("entretien_type_autre"),
  };

  const tBlocages = await getAdminTranslator("admin.blocages");

  const [{ data: vehicule }, { data: categories }, { data: entretiens }, { data: blocages }] =
    await Promise.all([
      supabase
        .from("vehicules")
        .select("id, categorie_id, plaque, annee, etat_operationnel, notes, actif")
        .eq("id", id)
        .single(),
      supabase.from("categories_vehicules").select("id, nom").order("nom"),
      supabase
        .from("entretiens")
        .select("id, type, date_entretien, cout_usd, prochain_entretien, notes")
        .eq("vehicule_id", id)
        .order("date_entretien", { ascending: false }),
      supabase
        .from("indisponibilites_vehicule")
        .select("id, date_debut, date_fin, motif")
        .eq("vehicule_id", id)
        .order("date_debut", { ascending: false }),
    ]);

  if (!vehicule) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">
        {t("edit_title", { plaque: vehicule.plaque ?? tCommon("dash") })}
      </h1>
      <VehiculeForm categories={categories ?? []} vehicule={vehicule} />

      <div className="flex max-w-lg flex-col gap-4 rounded-lg bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">{tEntretiens("history_title")}</h2>
          <Link
            href={`/admin/entretiens/nuevo?vehicule_id=${id}`}
            className="text-sm font-semibold text-brand hover:underline"
          >
            {tEntretiens("history_add")}
          </Link>
        </div>

        {entretiens?.length ? (
          <ul className="flex flex-col divide-y divide-black/5">
            {entretiens.map((e) => (
              <li key={e.id} className="flex flex-col gap-1 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink">
                    {TYPE_LABELS[e.type] ?? e.type}
                  </span>
                  <span className="text-ink-soft">{e.date_entretien}</span>
                </div>
                <div className="flex items-center justify-between text-ink-soft">
                  <span>{e.cout_usd ? `US$ ${e.cout_usd}` : tCommon("dash")}</span>
                  {e.prochain_entretien && (
                    <span>
                      {tEntretiens("col_proximo")}: {e.prochain_entretien}
                    </span>
                  )}
                </div>
                {e.notes && <p className="text-ink-soft">{e.notes}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-soft">{tEntretiens("history_empty")}</p>
        )}
      </div>

      <div className="flex max-w-lg flex-col gap-4 rounded-lg bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">{tBlocages("title")}</h2>
          <Link
            href={`/admin/blocages/nuevo?vehicule_id=${id}`}
            className="text-sm font-semibold text-brand hover:underline"
          >
            {t("indispo_add")}
          </Link>
        </div>

        {blocages?.length ? (
          <ul className="flex flex-col divide-y divide-black/5">
            {blocages.map((b) => (
              <li key={b.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-ink">{b.motif || tCommon("dash")}</p>
                  <p className="text-ink-soft">
                    {b.date_debut} → {b.date_fin}
                  </p>
                </div>
                <Link href={`/admin/blocages/${b.id}`} className="text-brand hover:underline">
                  {tCommon("edit")}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-soft">{t("indispo_empty")}</p>
        )}
      </div>
    </div>
  );
}
