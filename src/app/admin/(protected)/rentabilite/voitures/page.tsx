import { RentabiliteVue } from "@/components/admin/RentabiliteVue";

export default function RentabiliteVoituresPage({
  searchParams,
}: {
  searchParams: Promise<{ debut?: string; fin?: string }>;
}) {
  return <RentabiliteVue groupe="voitures" searchParams={searchParams} />;
}
