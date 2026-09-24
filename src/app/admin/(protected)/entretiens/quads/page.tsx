import { EntretiensListe } from "@/components/admin/EntretiensListe";

export default function EntretiensQuadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  return <EntretiensListe groupe="quads" searchParams={searchParams} />;
}
