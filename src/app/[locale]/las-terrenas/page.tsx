import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { LasTerrenasBanner } from "@/components/site/LasTerrenasBanner";

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
    <>
      <LasTerrenasBanner />

      <Container className="flex flex-col gap-8 py-16 sm:py-24">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {t("places_title")}
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
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
    </>
  );
}
