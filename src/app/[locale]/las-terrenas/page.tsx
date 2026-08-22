import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { LasTerrenasGallery } from "@/components/site/LasTerrenasGallery";

export default async function LasTerrenasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("lasTerrenas");
  const places = t.raw("places") as string[];

  return (
    <Container className="flex flex-col gap-8 py-16">
      <div>
        <h1 className="text-3xl font-bold text-ink">{t("title")}</h1>
        <p className="mt-4 max-w-2xl text-ink-soft">{t("intro")}</p>
      </div>

      <LasTerrenasGallery />

      <div>
        <h2 className="mb-4 text-lg font-semibold text-ink">{t("places_title")}</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {places.map((place) => (
            <li
              key={place}
              className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm"
            >
              <span className="h-2 w-2 shrink-0 rounded-full bg-brand" aria-hidden />
              <span className="font-medium text-ink">{place}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <ButtonLink href="/flotte">{t("cta")}</ButtonLink>
      </div>
    </Container>
  );
}
