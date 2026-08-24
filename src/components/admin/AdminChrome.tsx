"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// La signature se fait souvent sur un appareil partagé avec le client — masquer le
// menu admin évite qu'il ne voie ou ne touche autre chose que l'écran de signature.
const FULLSCREEN_ROUTES = [/\/contrat\/firmar$/];

export function AdminChrome({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const fullscreen = FULLSCREEN_ROUTES.some((route) => route.test(pathname));

  if (fullscreen) {
    return <main className="min-h-screen bg-black/[0.02] p-4 sm:p-8">{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row print:block">
      {sidebar}
      <main className="flex-1 overflow-y-auto bg-black/[0.02] p-4 sm:p-8 print:bg-white print:p-0">
        {children}
      </main>
    </div>
  );
}
