import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ReservarForm } from "@/components/site/ReservarForm";
import { getCatalogue } from "@/lib/data/catalogue";

export default async function ReservarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, catalogue] = await Promise.all([getTranslations("reservar"), getCatalogue()]);

  return (
    <Container className="flex flex-col gap-8 py-16">
      <div className="max-w-xl">
        <h1 className="text-3xl font-bold text-ink">{t("title")}</h1>
        <p className="mt-2 text-ink-soft">{t("subtitle")}</p>
      </div>

      <div className="max-w-xl">
        <ReservarForm categories={catalogue} />
      </div>
    </Container>
  );
}
