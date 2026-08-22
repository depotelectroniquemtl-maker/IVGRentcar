import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { LocaleSwitcher } from "@/components/site/LocaleSwitcher";
import { ButtonLink } from "@/components/ui/Button";
import { MobileMenu } from "@/components/site/MobileMenu";

export function Header() {
  const t = useTranslations("site");

  return (
    <header className="border-b border-black/10 bg-white">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="font-bold text-ink">
            <span className="text-brand">I.V.J</span> Polanco
          </span>
          <span className="text-xs text-ink-soft">{t("tagline")}</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-ink sm:flex">
          <Link href="/" className="hover:text-brand">
            {t("nav.home")}
          </Link>
          <Link href="/flotte" className="hover:text-brand">
            {t("nav.flotte")}
          </Link>
          <Link href="/las-terrenas" className="hover:text-brand">
            {t("nav.lasTerrenas")}
          </Link>
          <Link href="/faq" className="hover:text-brand">
            {t("nav.faq")}
          </Link>
          <Link href="/contact" className="hover:text-brand">
            {t("nav.contact")}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <ButtonLink href="/reservar" className="px-4 py-2 text-xs sm:text-sm">
            {t("reservar_cta")}
          </ButtonLink>
          <LocaleSwitcher />
          <MobileMenu />
        </div>
      </Container>
    </header>
  );
}
