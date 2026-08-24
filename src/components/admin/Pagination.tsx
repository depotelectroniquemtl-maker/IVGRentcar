import Link from "next/link";

// Pagination purement par lien (?page=N) — pas de state client nécessaire, la page
// suivante est un simple Server Component re-rendu avec un autre searchParams.page.
// Préserve les autres paramètres d'URL (la recherche ?q=...) au changement de page.
export function Pagination({
  page,
  totalPages,
  basePath,
  searchParams,
  labelPrev,
  labelNext,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
  labelPrev: string;
  labelNext: string;
}) {
  if (totalPages <= 1) return null;

  function href(p: number) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v && k !== "page") params.set(k, v);
    }
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <div className="flex items-center justify-center gap-2 text-sm">
      <Link
        href={href(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={`rounded-md border border-black/15 px-3 py-1.5 font-medium text-ink transition-colors ${
          page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-black/5"
        }`}
      >
        {labelPrev}
      </Link>
      <span className="text-ink-soft">
        {page} / {totalPages}
      </span>
      <Link
        href={href(Math.min(totalPages, page + 1))}
        aria-disabled={page >= totalPages}
        className={`rounded-md border border-black/15 px-3 py-1.5 font-medium text-ink transition-colors ${
          page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-black/5"
        }`}
      >
        {labelNext}
      </Link>
    </div>
  );
}
