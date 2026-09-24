import { EntretiensListe } from "@/components/admin/EntretiensListe";

export default function EntretiensVoituresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  return <EntretiensListe groupe="voitures" searchParams={searchParams} />;
}
