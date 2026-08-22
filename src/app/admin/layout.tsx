import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Panel — I.V.J Polanco Rent a Car",
};

// Layout racine du back-office : arbre séparé de la vitrine publique ([locale]), donc son
// propre <html>/<body> (pattern "multiple root layouts" de Next.js). Pas de vérification
// d'auth ici — /admin/login doit rester accessible sans être connecté. La vérification se
// fait dans (protected)/layout.tsx, qui couvre toutes les pages sauf login.
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
