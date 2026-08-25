import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { hasLocale, routing } from "@/i18n/routing";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { LocalBusinessJsonLd } from "@/components/site/LocalBusinessJsonLd";
import { SITE_URL } from "@/lib/constants";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

// Fallback uniquement (ex: 404) — chaque page définit son propre generateMetadata avec un
// titre/description traduits, qui prennent le dessus sur ces valeurs par défaut.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "I.V.J Polanco Rent a Car — Las Terrenas",
  description:
    "Alquiler de autos, camionetas 4x4 y cuadriciclos en Las Terrenas, República Dominicana. Tu confianza en el volante.",
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
