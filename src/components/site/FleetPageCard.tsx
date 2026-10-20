import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TierPrices } from "@/components/site/TierPrices";
import { FLEET_PAGES, type FleetPageSlug } from "@/lib/fleet-pages";
import type { CategorieAvecTarifs } from "@/lib/types";

// Carte vers une page véhicule (hubs et « autres véhicules »).
export function FleetPageCard({
  slug,
  categorie,
  headingLevel = "h3",
}: {
  slug: FleetPageSlug;
  categorie: CategorieAvecTarifs;
  // Sur les hubs, la carte suit directement le H1 : son titre est un H2 (même rendu visuel).
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  const t = useTranslations("fleetPages");
  const page = FLEET_PAGES[slug];
  const photo = page.photos[0];

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-black/5 bg-white shadow-sm">
      <Link
        href={`/flotte/${slug}`}
        className="relative block aspect-[4/3] w-full bg-black/5"
        aria-label={page.label}
      >
        <Image
          src={photo.src}
          alt={t(`pages.${slug}.alts.0`)}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Heading className="text-xl font-bold text-ink">
          <Link href={`/flotte/${slug}`} className="hover:text-brand">
            {page.label}
          </Link>
        </Heading>
        <TierPrices tarifs={categorie.tarifs} />
        <Link
          href={`/flotte/${slug}`}
          className="mt-auto inline-flex items-center justify-center rounded-md bg-ink px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-brand"
        >
          {t("ui.details")} →
        </Link>
      </div>
    </div>
  );
}
