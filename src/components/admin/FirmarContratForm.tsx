"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SignaturePad } from "@/components/admin/SignaturePad";

export function FirmarContratForm({
  reservationId,
  clearLabel,
  confirmLabel,
  savingLabel,
  errorLabel,
}: {
  reservationId: string;
  clearLabel: string;
  confirmLabel: string;
  savingLabel: string;
  errorLabel: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm(dataUrl: string) {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("contrats_location")
      .update({ signature_client: dataUrl, signe_a: new Date().toISOString() })
      .eq("reservation_id", reservationId);

    if (error) {
      setError(errorLabel);
      setLoading(false);
      return;
    }

    router.push(`/admin/reservations/${reservationId}/contrat`);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <SignaturePad
        clearLabel={clearLabel}
        confirmLabel={loading ? savingLabel : confirmLabel}
        onConfirm={handleConfirm}
        disabled={loading}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
