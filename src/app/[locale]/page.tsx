import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ButtonLink, ExternalButtonLink } from "@/components/ui/Button";
import { PriceTable } from "@/components/site/PriceTable";
import { whatsappUrl } from "@/lib/constants";
import { getCatalogue } from "@/lib/data/catalogue";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tPreview, tWhy, catalogue] = await Promise.all([
    getTranslations("home.hero"),
    getTranslations("home.flotte_preview"),
    getTranslations("home.why"),
    getCatalogue(),
  ]);

  return (
    <>
      <section className="bg-ink text-white">
        <Container className="flex flex-col items-start gap-6 py-20">
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
            {t("title")}
          </h1>
          <p className="max-w-xl text-lg text-white/80">{t("subtitle")}</p>
          <div className="flex flex-wrap gap-3">
            <ExternalButtonLink href={whatsappUrl()} variant="whatsapp">
              {t("cta_whatsapp")}
            </ExternalButtonLink>
            <ButtonLink href="/flotte" variant="outline" className="border-white text-white hover:bg-white hover:text-ink">
              {t("cta_flotte")}
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container className="flex flex-col gap-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-2xl font-bold text-ink">{tPreview("title")}</h2>
            <ButtonLink href="/flotte" variant="outline">
              {tPreview("see_all")}
            </ButtonLink>
          </div>
          <PriceTable categories={catalogue} />
        </Container>
      </section>

      <section className="bg-black/[0.03] py-16">
        <Container>
          <h2 className="mb-8 text-2xl font-bold text-ink">{tWhy("title")}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-2 font-semibold text-brand">
                  {tWhy(`item${i}_title` as "item1_title")}
                </h3>
                <p className="text-sm text-ink-soft">
                  {tWhy(`item${i}_text` as "item1_text")}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
