import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { WHATSAPP_NUMBER } from "@/lib/constants";

// Reproduit le pied de page de la reference fournie : bandeau sombre nettement plus
// haut que l'ancienne version compacte, logo en haut a gauche, gros slogan sur deux
// lignes, puis une ligne de bas de page separee par une bordure fine (copyright +
// localisation a gauche, WhatsApp a droite).
export function Footer() {
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
          {t("footer.tagline")
            .split("\n")
            .map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
        </h2>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/15 pt-6 text-xs text-white/60 sm:mt-14 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} I.V.J Polanco Rent a Car · {t("footer.location")}
          </p>
          <p>WhatsApp: +{WHATSAPP_NUMBER}</p>
          <Link href="/admin/login" className="text-white/40 transition hover:text-white/70">
            {t("footer.admin")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
