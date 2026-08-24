import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ReservarForm } from "@/components/site/ReservarForm";
import { getCatalogue } from "@/lib/data/catalogue";

const ETAPES = [1, 2, 3] as const;

export default async function ReservarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, catalogue] = await Promise.all([getTranslations("reservar"), getCatalogue()]);

  return (
    <div className="bg-black/[0.02] py-16 sm:py-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-start lg:gap-16">
          <div className="lg:pt-2">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-brand">
              {t("eyebrow")}
            </p>
            <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-3 max-w-md text-lg text-ink-soft">{t("subtitle")}</p>

            <ol className="mt-8 flex flex-col gap-4">
              {ETAPES.map((n) => (
                <li key={n} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
                    {n}
                  </span>
                  <span className="text-sm font-medium text-ink">{t(`step${n}_label`)}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <ReservarForm categories={catalogue} />
          </div>
        </div>
      </Container>
    </div>
  );
}
