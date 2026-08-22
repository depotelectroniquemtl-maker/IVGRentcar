import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getAdminLocale, getAdminMessages, getAdminTranslator } from "@/lib/admin-i18n";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export async function generateMetadata(): Promise<Metadata> {
  const t = await getAdminTranslator("admin.meta");
  return { title: t("title") };
}

// Layout racine du back-office : arbre séparé de la vitrine publique ([locale]), donc son
// propre <html>/<body> (pattern "multiple root layouts" de Next.js). Pas de vérification
// d'auth ici — /admin/login doit rester accessible sans être connecté. La vérification se
// fait dans (protected)/layout.tsx, qui couvre toutes les pages sauf login.
//
// Langue résolue via un cookie dédié (admin_locale), indépendant du routage par URL de la
// vitrine publique — voir src/lib/admin-i18n.ts. Espagnol par défaut pour le personnel ;
// AdminLocaleSwitcher (Sidebar + /admin/login) permet au développeur de basculer le
// panneau sans toucher à ce que voit le personnel.
export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getAdminLocale();
  const messages = await getAdminMessages(locale);

  return (
    <html lang={locale} className={inter.variable}>
      <body className="font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={{ admin: messages.admin }}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
