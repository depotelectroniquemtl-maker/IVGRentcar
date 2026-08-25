import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { hasLocale, routing } from "@/i18n/routing";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { LocalBusinessJsonLd } from "@/components/site/LocalBusinessJsonLd";
import { BUSINESS_NAME, SITE_URL } from "@/lib/constants";
import { OG_IMAGE } from "@/lib/seo";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

// Fallback uniquement, en espagnol (langue par défaut — cohérent avec la redirection de "/"
// vers "/es") — chaque page définit son propre generateMetadata avec un titre/description
// traduits qui prennent le dessus. Comme il n'existe pas de app/layout.tsx partagé au-dessus
// de [locale] et admin (chacun garde son propre <html lang> pour rester précis par langue),
// ce fichier reste le fallback le plus proche de la racine : utile si une page ne résout pas
// encore sa propre metadata (erreur, route future sans generateMetadata...).
const FALLBACK_TITLE = "I.V.J Polanco Rent a Car — Las Terrenas";
const FALLBACK_DESCRIPTION =
  "Alquiler de autos, camionetas 4x4 y cuadriciclos en Las Terrenas, República Dominicana. Tu confianza en el volante.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: FALLBACK_TITLE,
  description: FALLBACK_DESCRIPTION,
  openGraph: {
    title: FALLBACK_TITLE,
    description: FALLBACK_DESCRIPTION,
    url: SITE_URL,
    siteName: BUSINESS_NAME,
    locale: "es_DO",
    type: "website",
    images: [{ ...OG_IMAGE, alt: FALLBACK_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: FALLBACK_TITLE,
    description: FALLBACK_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Rend le composant statiquement rendable pour cette locale (recommandé par next-intl).
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} className={inter.variable}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <LocalBusinessJsonLd />
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
