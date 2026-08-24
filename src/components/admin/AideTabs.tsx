"use client";

import { useState, type ReactNode } from "react";

type Chapter = {
  id: string;
  n: string;
  navLabel: string;
  content: ReactNode;
};

export function AideTabs({ chapters }: { chapters: Chapter[] }) {
  const [activeId, setActiveId] = useState(chapters[0]?.id);
  const active = chapters.find((c) => c.id === activeId) ?? chapters[0];

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex flex-wrap gap-1 rounded-lg border border-black/10 bg-white p-2 text-[13px]">
        {chapters.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveId(c.id)}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              c.id === active?.id ? "bg-brand text-white" : "text-ink-soft hover:bg-black/5"
            }`}
          >
            <span className="mr-1.5 font-mono text-[11px] opacity-60">{c.n}</span>
            {c.navLabel}
          </button>
        ))}
      </nav>

      {active && <div className="rounded-lg border border-black/10 bg-white p-6">{active.content}</div>}
    </div>
  );
}
