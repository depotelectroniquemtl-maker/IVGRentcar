import { useLocale, useTranslations } from "next-intl";
import { GOOGLE_MAPS_URL, GOOGLE_RATING, GOOGLE_REVIEWS_COUNT } from "@/lib/constants";

const STAR_PATH =
  "M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96L12 2.5z";

// Petit bloc « note + nombre d'avis + lien vers Google », sur fond sombre (accueil, pied de page).
// Valeurs statiques (constants.ts) ; si l'une manque, rien ne s'affiche. Ni extraits d'avis ni
// balisage d'avis : seulement la note, le nombre et le lien. `location` alimente l'événement
// GA4 « google_reviews_click » (emplacement du lien).
export function GoogleReviews({ location, className = "" }: { location: string; className?: string }) {
  const t = useTranslations("site.reviews");
  const locale = useLocale();

  if (!GOOGLE_RATING || !GOOGLE_REVIEWS_COUNT || !GOOGLE_MAPS_URL) return null;

  const rating = GOOGLE_RATING.toLocaleString(locale, { minimumFractionDigits: 1 });

  return (
    <div className={`flex flex-col gap-1 text-sm text-white ${className}`}>
      {/* Étoiles décoratives ; le texte lisible par un lecteur d'écran donne la note. */}
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className="flex gap-0.5 text-amber-400">
          {Array.from({ length: 5 }, (_, i) => (
            <svg key={i} viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" focusable="false">
              <path d={STAR_PATH} />
            </svg>
          ))}
        </span>
        <span aria-hidden="true" className="font-bold">
          {rating} · {GOOGLE_REVIEWS_COUNT}
        </span>
        <span className="sr-only">{t("summary", { rating, count: GOOGLE_REVIEWS_COUNT })}</span>
      </div>
      <a
        href={GOOGLE_MAPS_URL}
        target="_blank"
        rel="noopener noreferrer"
        data-google-reviews=""
        data-wa-location={location}
        className="inline-flex min-h-[36px] w-fit items-center text-sm font-semibold text-white underline underline-offset-2 hover:text-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        {t("link")}
      </a>
    </div>
  );
}
