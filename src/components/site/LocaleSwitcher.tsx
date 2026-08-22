"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LABELS: Record<string, string> = {
  es: "ES",
  en: "EN",
  fr: "FR",
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex items-center gap-1 text-xs font-bold">
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() => router.replace(pathname, { locale: l })}
          className={`border-b-2 px-1.5 py-1 transition-colors ${
            l === locale
              ? "border-brand font-black text-ink"
              : "border-transparent text-ink-soft/70 hover:text-ink"
          }`}
          aria-current={l === locale}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
