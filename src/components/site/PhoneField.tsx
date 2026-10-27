"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import type { CountryCode } from "libphonenumber-js/min";
import { TOP_COUNTRIES, allCountries, callingCode, foldText } from "@/lib/phone";
import "flag-icons/css/flag-icons.min.css";

const inputClass =
  "w-full rounded border border-black/20 px-3 py-2 focus:border-brand focus:outline-none";

// Langues dans lesquelles on peut chercher un pays, quelle que soit la langue d'affichage.
const SEARCH_LOCALES = ["fr", "en", "es"];

type Position = { left: number; width: number; maxHeight: number; top?: number; bottom?: number };

// Champ téléphone avec sélecteur de pays (drapeau + indicatif) à gauche. Le pays est
// contrôlé par le parent : il sert à valider puis normaliser le numéro en E.164.
// `namesLocale` : langue des noms de pays affichés (par défaut celle de l'interface) ; la
// recherche, elle, comprend toujours le français, l'anglais et l'espagnol.
export function PhoneField({
  label,
  country,
  onCountryChange,
  value,
  onValueChange,
  error,
  id = "whatsapp-input",
  required = true,
  namesLocale,
}: {
  label: string;
  country: CountryCode;
  onCountryChange: (c: CountryCode) => void;
  value: string;
  onValueChange: (v: string) => void;
  error: string | null;
  id?: string;
  required?: boolean;
  namesLocale?: string;
}) {
  const t = useTranslations("reservar");
  const uiLocale = useLocale();
  const locale = namesLocale ?? uiLocale;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState<Position | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const names = useMemo(() => {
    const dn = new Intl.DisplayNames([locale], { type: "region" });
    return (c: CountryCode) => dn.of(c) ?? c;
  }, [locale]);

  // Texte de recherche de chaque pays : noms fr/en/es (+ langue d'affichage), code ISO, indicatif.
  const haystacks = useMemo(() => {
    const dns = Array.from(new Set([locale, ...SEARCH_LOCALES])).map(
      (l) => new Intl.DisplayNames([l], { type: "region" }),
    );
    const map = new Map<CountryCode, string>();
    for (const c of allCountries()) {
      const parts = dns.map((dn) => foldText(dn.of(c) ?? ""));
      map.set(c, [...parts, c.toLowerCase(), callingCode(c)].join(" | "));
    }
    return map;
  }, [locale]);

  const { top, others } = useMemo(() => {
    const rest = allCountries()
      .filter((c) => !TOP_COUNTRIES.includes(c))
      .sort((a, b) => names(a).localeCompare(names(b), locale));
    return { top: TOP_COUNTRIES, others: rest };
  }, [names, locale]);

  // Menu placé en position fixe (rendu dans <body>) : aucune carte à overflow masqué ne peut
  // le rogner. Il s'ouvre au-dessus du champ s'il manque de place en dessous.
  function place() {
    const b = buttonRef.current;
    if (!b) return;
    const r = b.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(352, vw - 24);
    const left = Math.max(12, Math.min(r.left, vw - width - 12));
    const spaceBelow = vh - r.bottom - 16;
    const spaceAbove = r.top - 16;
    const below = spaceBelow >= 300 || spaceBelow >= spaceAbove;
    const maxHeight = Math.max(200, Math.min(440, below ? spaceBelow : spaceAbove));
    setPos(
      below
        ? { left, width, maxHeight, top: r.bottom + 4 }
        : { left, width, maxHeight, bottom: vh - r.top + 4 },
    );
  }

  useLayoutEffect(() => {
    if (!open) return;
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target) || popRef.current?.contains(target)) return;
      setOpen(false);
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

  const tokens = foldText(query).split(" ").filter(Boolean);
  const matches = (c: CountryCode) => {
    if (tokens.length === 0) return true;
    const hay = haystacks.get(c) ?? "";
    return tokens.every((tok) => hay.includes(tok));
  };

  function choose(c: CountryCode) {
    onCountryChange(c);
    setOpen(false);
    setQuery("");
    buttonRef.current?.focus();
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

  // Un code ISO saisi en entier (« DO ») place ce pays en premier.
  const exact = tokens.length === 1 ? tokens[0].toUpperCase() : null;
  const byExactCode = (a: CountryCode, b: CountryCode) => Number(b === exact) - Number(a === exact);
  const topShown = top.filter(matches).sort(byExactCode);
  const othersShown = others.filter(matches).sort(byExactCode);

  const menu =
    open && pos ? (
      <div
        ref={popRef}
        style={{
          position: "fixed",
          left: pos.left,
          width: pos.width,
          top: pos.top,
          bottom: pos.bottom,
        }}
        className="z-[100] rounded border border-black/15 bg-white text-ink shadow-lg"
      >
        <input
          type="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            // Entrée choisit le premier pays trouvé ; elle ne doit jamais envoyer un formulaire.
            if (e.key === "Enter") {
              e.preventDefault();
              const first = topShown[0] ?? othersShown[0];
              if (first) choose(first);
            }
          }}
          placeholder={t("phone_country_search")}
          aria-label={t("phone_country_search")}
          className="w-full rounded-t border-b border-black/10 px-3 py-2.5 text-base focus:outline-none"
        />
        <ul
          role="listbox"
          aria-label={t("phone_country")}
          style={{ maxHeight: pos.maxHeight - 52 }}
          className="overflow-y-auto overscroll-contain"
        >
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
    ) : null;

  return (
    <div className="block text-sm" ref={rootRef}>
      <label htmlFor={id} className="mb-1 block font-medium text-ink">
        {label}
      </label>
      <div className="relative flex gap-2">
        <button
          ref={buttonRef}
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
      </div>
      {menu && createPortal(menu, document.body)}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
