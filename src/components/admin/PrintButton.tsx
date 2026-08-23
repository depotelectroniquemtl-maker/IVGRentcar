"use client";

import { primaryButtonClass } from "@/components/admin/form-ui";

export function PrintButton({ children }: { children: React.ReactNode }) {
  return (
    <button type="button" onClick={() => window.print()} className={primaryButtonClass}>
      {children}
    </button>
  );
}
