import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// Liens vers les deux pages hub (accueil et page flotte), pour le maillage interne.
export function FleetHubLinks() {
  const t = useTranslations("flotte");

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
      <Link href="/flotte/voitures" className="text-brand hover:underline">
        {t("hub_voitures")} →
      </Link>
      <Link href="/flotte/quads" className="text-brand hover:underline">
        {t("hub_quads")} →
      </Link>
    </div>
  );
}
