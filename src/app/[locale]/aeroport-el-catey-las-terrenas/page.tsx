import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ButtonLink, ExternalButtonLink } from "@/components/ui/Button";
import type { AppLocale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { whatsappUrl } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.aeroport" });
  return pageMetadata({
    locale: locale as AppLocale,
    path: "/aeroport-el-catey-las-terrenas",
    title: t("title"),
    description: t("description"),
  });
}

// Page strictement informative : situation de Las Terrenas, durée du trajet depuis l'aéroport de
// Samaná El Catey et rappel qu'il n'y a pas de comptoir à l'aéroport. Aucun prix, aucune
// distance, aucun nom d'entreprise, et aucun service de transport ou d'accueil n'y est promis.
export default async function AeroportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("aeroport");

  return (
    <Container className="flex max-w-3xl flex-col gap-8 py-16">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-brand">{t("eyebrow")}</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          {t("title")}
        </h1>
      </div>

      <div className="flex flex-col gap-4 text-lg text-ink-soft">
        <p>{t("p1")}</p>
        <p>{t("p2")}</p>
        <p>{t("p3")}</p>
      </div>

      <aside
        aria-labelledby="aeroport-notice"
        className="rounded-lg border-l-4 border-brand bg-white p-6 shadow-sm"
      >
        <h2 id="aeroport-notice" className="text-sm font-bold uppercase tracking-wider text-brand-dark">
          {t("notice_title")}
        </h2>
        <p className="mt-2 text-lg font-semibold text-ink">{t("notice")}</p>
      </aside>

      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/reservar">{t("cta_reserver")}</ButtonLink>
        <ExternalButtonLink variant="whatsapp" href={whatsappUrl()} data-wa-location="aeroport">
          {t("cta_whatsapp")}
        </ExternalButtonLink>
      </div>
    </Container>
  );
}
