import Image from "next/image";
import Link from "next/link";
import { Link as LocaleLink } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { BUSINESS_ADDRESS, PHONE_DISPLAY } from "@/lib/constants";
import { splitLines } from "@/lib/splitLines";
import { CookieSettingsButton } from "@/components/site/CookieSettingsButton";

// Reproduit le pied de page de la reference fournie : bandeau sombre nettement plus
// haut que l'ancienne version compacte, logo en haut a gauche, gros slogan sur deux
// lignes, puis une ligne de bas de page separee par une bordure fine (copyright +
// localisation a gauche, WhatsApp a droite).
export function Footer({ showCookieSettings = false }: { showCookieSettings?: boolean }) {
  const t = useTranslations("site");

  return (
    <footer className="mt-16 bg-ink text-white">
      <div className="px-6 py-16 sm:px-10 sm:py-20 md:px-[6vw] md:py-24">
        <Image
          src="/logo.png"
          alt={t("name")}
          width={220}
          height={70}
          className="h-14 w-auto sm:h-16"
        />

        <h2 className="mt-10 text-5xl font-extrabold leading-[0.98] tracking-tight sm:mt-14 sm:text-6xl lg:text-7xl">
          {splitLines(t("footer.tagline"))}
        </h2>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/15 pt-6 text-xs text-white/60 sm:mt-14 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-6">
          <p>
            © {new Date().getFullYear()} IVJ Rentcar · {t("footer.location")}
          </p>
          <address className="not-italic">{BUSINESS_ADDRESS}</address>
          <p>WhatsApp: {PHONE_DISPLAY}</p>
          <nav className="flex flex-wrap items-center gap-x-4">
            <LocaleLink href="/flotte/voitures" className="inline-block py-1 text-white/60 underline-offset-2 transition hover:text-white hover:underline">
              {t("footer.link_cars")}
            </LocaleLink>
            <LocaleLink href="/flotte/quads" className="inline-block py-1 text-white/60 underline-offset-2 transition hover:text-white hover:underline">
              {t("footer.link_quads")}
            </LocaleLink>
            <LocaleLink href="/contact" className="inline-block py-1 text-white/60 underline-offset-2 transition hover:text-white hover:underline">
              {t("footer.link_contact")}
            </LocaleLink>
            <LocaleLink href="/conditions" className="inline-block py-1 text-white/60 underline-offset-2 transition hover:text-white hover:underline">
              {t("footer.link_conditions")}
            </LocaleLink>
            <LocaleLink href="/mentions-legales" className="inline-block py-1 text-white/60 underline-offset-2 transition hover:text-white hover:underline">
              {t("footer.link_legal")}
            </LocaleLink>
            <LocaleLink href="/confidentialite" className="inline-block py-1 text-white/60 underline-offset-2 transition hover:text-white hover:underline">
              {t("footer.link_privacy")}
            </LocaleLink>
            {showCookieSettings && (
              <CookieSettingsButton className="inline-block py-1 text-left text-white/60 underline-offset-2 transition hover:text-white hover:underline" />
            )}
          </nav>
          <Link href="/admin/login" className="text-white/40 transition hover:text-white/70">
            {t("footer.admin")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
