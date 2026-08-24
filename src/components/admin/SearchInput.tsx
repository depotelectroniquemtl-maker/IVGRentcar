"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Filtre en direct par paramètre d'URL (?q=...) plutôt qu'un state local : la liste
// reste filtrable même après un rafraîchissement de page ou un lien partagé, et le
// filtrage lui-même reste côté serveur (page.tsx relit searchParams). Débounce de 300ms
// pour ne pas re-render/naviguer à chaque frappe.
export function SearchInput({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [valeur, setValeur] = useState(searchParams.get("q") ?? "");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setValeur(searchParams.get("q") ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function handleChange(v: string) {
    setValeur(v);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (v) params.set("q", v);
      else params.delete("q");
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    }, 300);
  }

  return (
    <div className="relative w-full max-w-xs">
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
      >
        <circle cx="7" cy="7" r="4.8" stroke="currentColor" strokeWidth="1.4" />
        <path d="M13 13l-2.7-2.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={valeur}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-black/20 bg-white py-2 pl-9 pr-3 text-sm text-ink transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
      />
    </div>
  );
}
