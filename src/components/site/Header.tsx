import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/site/LocaleSwitcher";
import { ExternalButtonLink } from "@/components/ui/Button";
import { MobileMenu } from "@/components/site/MobileMenu";
import { whatsappUrl } from "@/lib/constants";

// Reproduit le header de l'ancien site (classe .topbar) : logo plus grand (le tagline est
// déjà intégré dans public/logo.png, pas besoin d'un second texte), fine bordure rouge en
// bas, nav réduite aux 4 rubriques réelles (Inicio est déjà accessible via le logo,
// Contacto reste joignable depuis le footer), et bouton WhatsApp direct à la place d'un
// bouton "Reservar" permanent — /reservar reste la première action mise en avant dans le
// hero de l'accueil.
export function Header() {
  const t = useTranslations("site");

  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-brand bg-white">
      {/* Pas de <Container> ici (même raison que le hero) : l'ancien site pousse le
          header depuis le bord de l'écran (padding en vw), sinon le logo recule vers le
          centre sur les écrans larges au lieu de rester proche du bord. */}
      <div className="flex h-20 items-center justify-between gap-4 px-4 sm:h-24 sm:px-6 lg:px-[4vw]">
        <Link href="/" className="shrink-0">
          <Image
            src="/logo.png"
            alt={t("name")}
            width={220}
            height={70}
            priority
            className="h-12 w-auto sm:h-[70px]"
          />
        </Link>

        <nav className="hidden items-center gap-8 text-[15px] font-bold text-ink lg:flex">
          <Link href="/flotte" className="hover:text-brand">
            {t("nav.flotte")}
          </Link>
          <Link href="/#why" className="hover:text-brand">
            {t("nav.why")}
          </Link>
          <Link href="/las-terrenas" className="hover:text-brand">
            {t("nav.lasTerrenas")}
          </Link>
          <Link href="/faq" className="hover:text-brand">
            {t("nav.faq")}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          <ExternalButtonLink
            href={whatsappUrl()}
            variant="dark"
            className="hidden px-5 py-2.5 text-xs sm:inline-flex"
          >
            WhatsApp
          </ExternalButtonLink>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
