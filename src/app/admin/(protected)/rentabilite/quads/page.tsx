import { RentabiliteVue } from "@/components/admin/RentabiliteVue";

export default function RentabiliteQuadsPage({
  searchParams,
}: {
  searchParams: Promise<{ debut?: string; fin?: string }>;
}) {
  return <RentabiliteVue groupe="quads" searchParams={searchParams} />;
}
