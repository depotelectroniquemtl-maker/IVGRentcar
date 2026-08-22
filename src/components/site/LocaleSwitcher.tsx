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
    <div className="flex items-center gap-1 text-sm font-medium">
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() => router.replace(pathname, { locale: l })}
          className={`rounded px-2 py-1 transition-colors ${
            l === locale
              ? "bg-brand text-white"
              : "text-ink-soft hover:bg-black/5"
          }`}
          aria-current={l === locale}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
