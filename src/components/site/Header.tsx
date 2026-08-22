import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { LocaleSwitcher } from "@/components/site/LocaleSwitcher";

export function Header() {
  const t = useTranslations("site");

  return (
    <header className="border-b border-black/10 bg-white">
      <Container className="flex h-16 items-center justify-between">
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
          <Link href="/contact" className="hover:text-brand">
            {t("nav.contact")}
          </Link>
        </nav>

        <LocaleSwitcher />
      </Container>
    </header>
  );
}
