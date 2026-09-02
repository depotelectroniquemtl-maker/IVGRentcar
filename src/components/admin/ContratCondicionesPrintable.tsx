import type { getAdminTranslator } from "@/lib/admin-i18n";

type ContratTranslator = Awaited<ReturnType<typeof getAdminTranslator<"admin.contratoImprimible">>>;

// Le "verso" du contrat papier — jusqu'ici jamais implémenté alors que le recto y fait
// déjà référence ("ayant déclaré avoir lu le verso de ce contrat", legal_signature). Texte
// fourni par le client, transcrit tel quel (y compris sa ponctuation d'origine côté
// espagnol) plutôt que "corrigé" : c'est un texte juridique, pas une simple chaîne d'UI.
export function ContratCondicionesPrintable({ t }: { t: ContratTranslator }) {
  const clauses = t.raw("condiciones_items") as string[];

  return (
    <div className="mx-auto w-full max-w-[680px] break-inside-avoid bg-white p-8 text-[10.5px] leading-relaxed text-black print:p-4">
      <h1 className="border-b-2 border-black pb-3 text-center text-sm font-bold uppercase">
        {t("condiciones_titulo")}
      </h1>

      <ol className="mt-4 flex flex-col gap-3">
        {clauses.map((clause, i) => (
          <li key={i} className="flex gap-2 text-justify">
            <span className="shrink-0 font-bold">{i + 1}.</span>
            <span>{clause}</span>
          </li>
        ))}
      </ol>

      <p className="mt-4 text-justify font-medium">{t("condiciones_cierre")}</p>
    </div>
  );
}
