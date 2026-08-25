import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import type { AppLocale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.faq" });
  return pageMetadata({
    locale: locale as AppLocale,
    path: "/faq",
    title: t("title"),
    description: t("description"),
  });
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("faq");
  const items = t.raw("items") as { question: string; answer: string }[];

  return (
    <Container className="flex flex-col gap-8 py-16">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-lg text-ink-soft">{t("subtitle")}</p>
      </div>

      <div className="flex flex-col divide-y divide-black/10 rounded-lg bg-white shadow-sm">
        {items.map((item) => (
          <details key={item.question} className="group px-6 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
              {item.question}
              <span className="shrink-0 text-xl text-brand transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-ink-soft">{item.answer}</p>
          </details>
        ))}
      </div>
    </Container>
  );
}
