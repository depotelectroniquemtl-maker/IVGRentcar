"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { CountryCode } from "libphonenumber-js/min";
import { TOP_COUNTRIES, allCountries, callingCode } from "@/lib/phone";
import "flag-icons/css/flag-icons.min.css";

const inputClass =
  "w-full rounded border border-black/20 px-3 py-2 focus:border-brand focus:outline-none";

// Champ téléphone avec sélecteur de pays (drapeau + indicatif) à gauche. Le pays est
// contrôlé par le parent : il sert à valider puis normaliser le numéro en E.164.
export function PhoneField({
  label,
  country,
  onCountryChange,
  value,
  onValueChange,
  error,
  id = "whatsapp-input",
  required = true,
}: {
  label: string;
  country: CountryCode;
  onCountryChange: (c: CountryCode) => void;
  value: string;
  onValueChange: (v: string) => void;
  error: string | null;
  id?: string;
  required?: boolean;
}) {
  const t = useTranslations("reservar");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const names = useMemo(() => {
    const dn = new Intl.DisplayNames([locale], { type: "region" });
    return (c: CountryCode) => dn.of(c) ?? c;
  }, [locale]);

  const { top, others } = useMemo(() => {
    const rest = allCountries()
      .filter((c) => !TOP_COUNTRIES.includes(c))
      .sort((a, b) => names(a).localeCompare(names(b), locale));
    return { top: TOP_COUNTRIES, others: rest };
  }, [names, locale]);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent | TouchEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const q = query.trim().toLowerCase();
  const matches = (c: CountryCode) =>
    !q ||
    names(c).toLowerCase().includes(q) ||
    c.toLowerCase() === q ||
    callingCode(c).includes(q.replace(/^\+?/, "+"));

  function choose(c: CountryCode) {
    onCountryChange(c);
    setOpen(false);
    setQuery("");
  }

  function row(c: CountryCode) {
    return (
      <li key={c} role="option" aria-selected={c === country}>
        <button
          type="button"
          onClick={() => choose(c)}
          className={`flex min-h-[44px] w-full items-center gap-3 px-3 text-left text-sm hover:bg-black/5 ${
            c === country ? "bg-brand-light font-semibold" : ""
          }`}
        >
          <span className={`fi fi-${c.toLowerCase()} shrink-0 rounded-sm`} aria-hidden="true" />
          <span className="flex-1 truncate">{names(c)}</span>
          <span className="text-ink-soft">{callingCode(c)}</span>
        </button>
      </li>
    );
  }

  const topShown = top.filter(matches);
  const othersShown = others.filter(matches);

  return (
    <div className="block text-sm" ref={rootRef}>
      <label htmlFor={id} className="mb-1 block font-medium text-ink">
        {label}
      </label>
      <div className="relative flex gap-2">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`${t("phone_country")} : ${names(country)} ${callingCode(country)}`}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-[44px] shrink-0 items-center gap-1.5 rounded border border-black/20 bg-white px-2.5 focus:border-brand focus:outline-none"
        >
          <span className={`fi fi-${country.toLowerCase()} rounded-sm`} aria-hidden="true" />
          <span className="text-ink">{callingCode(country)}</span>
          <span aria-hidden="true" className="text-xs text-ink-soft">
            ▾
          </span>
        </button>

        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required={required}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${inputClass} min-h-[44px] min-w-0 flex-1 ${error ? "border-red-500" : ""}`}
        />

        {open && (
          <div className="absolute left-0 top-full z-20 mt-1 w-[min(20rem,calc(100vw-3rem))] rounded border border-black/15 bg-white shadow-lg">
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("phone_country_search")}
              aria-label={t("phone_country_search")}
              className="w-full border-b border-black/10 px-3 py-2.5 text-base focus:outline-none"
            />
            <ul role="listbox" aria-label={t("phone_country")} className="max-h-64 overflow-y-auto">
              {topShown.map(row)}
              {topShown.length > 0 && othersShown.length > 0 && (
                <li role="separator" className="border-t border-black/10" />
              )}
              {othersShown.map(row)}
              {topShown.length === 0 && othersShown.length === 0 && (
                <li className="px-3 py-3 text-sm text-ink-soft">{t("phone_country_none")}</li>
              )}
            </ul>
          </div>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
