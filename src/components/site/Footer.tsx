import Image from "next/image";
import Link from "next/link";
import { Link as LocaleLink } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  BUSINESS_ADDRESS,
  PHONE_2_DISPLAY,
  PHONE_DISPLAY,
  WHATSAPP_NUMBER_2,
  whatsappUrl,
} from "@/lib/constants";
import { splitLines } from "@/lib/splitLines";
import { CookieSettingsButton } from "@/components/site/CookieSettingsButton";

// Zone cliquable d'au moins 36 px de haut (mobile), même teinte discrète qu'avant.
const LINK_CLASS =
  "inline-flex min-h-[36px] items-center text-sm text-white/60 underline-offset-2 transition hover:text-white hover:underline";
const HEADING_CLASS = "text-xs font-bold uppercase tracking-wider text-white";

// Pied de page : logo et slogan en haut, trois colonnes (Flotte, Informations, Contact) qui
// s'empilent ou passent à la ligne selon la largeur — aucune ligne à largeur fixe, donc jamais
// de défilement horizontal —, puis le copyright seul en bas.
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

        <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-8 border-t border-white/15 pt-8 sm:mt-14 sm:grid-cols-2 sm:pt-10 md:grid-cols-3">
          <nav aria-labelledby="footer-col-fleet" className="min-w-0">
            <h3 id="footer-col-fleet" className={HEADING_CLASS}>
              {t("footer.col_fleet")}
            </h3>
            <ul className="mt-2 flex flex-col">
              <li>
                <LocaleLink href="/flotte/voitures" className={LINK_CLASS}>
                  {t("footer.link_cars")}
                </LocaleLink>
              </li>
              <li>
                <LocaleLink href="/flotte/quads" className={LINK_CLASS}>
                  {t("footer.link_quads")}
                </LocaleLink>
              </li>
            </ul>
          </nav>

          <nav aria-labelledby="footer-col-info" className="min-w-0">
            <h3 id="footer-col-info" className={HEADING_CLASS}>
              {t("footer.col_info")}
            </h3>
            <ul className="mt-2 flex flex-col">
              <li>
                <LocaleLink href="/conditions" className={LINK_CLASS}>
                  {t("footer.link_conditions")}
                </LocaleLink>
              </li>
              <li>
                <LocaleLink href="/mentions-legales" className={LINK_CLASS}>
                  {t("footer.link_legal")}
                </LocaleLink>
              </li>
              <li>
                <LocaleLink href="/confidentialite" className={LINK_CLASS}>
                  {t("footer.link_privacy")}
                </LocaleLink>
              </li>
              {showCookieSettings && (
                <li>
                  <CookieSettingsButton className={`${LINK_CLASS} text-left`} />
                </li>
              )}
              <li>
                <Link
                  href="/admin/login"
                  className="inline-flex min-h-[36px] items-center text-sm text-white/40 transition hover:text-white/70"
                >
                  {t("footer.admin")}
                </Link>
              </li>
            </ul>
          </nav>

          <div className="min-w-0 sm:col-span-2 md:col-span-1">
            <h3 className={HEADING_CLASS}>{t("footer.col_contact")}</h3>
            <ul className="mt-2 flex flex-col">
              <li>
                <LocaleLink href="/contact" className={LINK_CLASS}>
                  {t("footer.link_contact")}
                </LocaleLink>
              </li>
              <li>
                <a
                  href={whatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-wa-location="footer"
                  className={LINK_CLASS}
                >
                  <span className="break-words">WhatsApp: {PHONE_DISPLAY}</span>
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER_2}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-wa-location="footer"
                  className={LINK_CLASS}
                >
                  <span className="break-words">WhatsApp: {PHONE_2_DISPLAY}</span>
                </a>
              </li>
              <li>
                <address className="py-2 text-sm not-italic leading-relaxed text-white/60 break-words">
                  {BUSINESS_ADDRESS}
                </address>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-10 border-t border-white/15 pt-6 text-xs text-white/60 sm:mt-12">
          © {new Date().getFullYear()} IVJ Rentcar · {t("footer.location")}
        </p>
      </div>
    </footer>
  );
}
