import { FleetCard } from "@/components/site/FleetCard";
import type { CategorieAvecTarifs } from "@/lib/types";

export function FleetGrid({ categories }: { categories: CategorieAvecTarifs[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((cat) => (
        <FleetCard key={cat.id} categorie={cat} />
      ))}
    </div>
  );
}
