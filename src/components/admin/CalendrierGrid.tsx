"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Occupation = { type: "reservation" | "indispo"; id: string; label: string };
type Vehicule = { id: string; nom: string };

export function CalendrierGrid({
  vehicules,
  jours,
  occupation,
  colVehiculo,
  chooseTitle,
  empty,
}: {
  vehicules: Vehicule[];
  jours: string[];
  occupation: Record<string, Record<string, Occupation>>;
  colVehiculo: string;
  chooseTitle: string;
  empty: string;
}) {
  const router = useRouter();
  const [dragVehiculeId, setDragVehiculeId] = useState<string | null>(null);
  const [anchorDate, setAnchorDate] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // La sélection ne s'étend que sur la ligne où le glissement a commencé (un blocage ou
  // une réservation concerne toujours un seul véhicule à la fois).
  useEffect(() => {
    if (!dragVehiculeId) return;

    function finish() {
      if (dragVehiculeId && anchorDate && hoverDate) {
        const [debut, fin] =
          anchorDate <= hoverDate ? [anchorDate, hoverDate] : [hoverDate, anchorDate];
        router.push(
          `/admin/calendrier/elegir?vehicule_id=${dragVehiculeId}&date_debut=${debut}&date_fin=${fin}`,
        );
      }
      setDragVehiculeId(null);
      setAnchorDate(null);
      setHoverDate(null);
    }

    window.addEventListener("mouseup", finish);
    return () => window.removeEventListener("mouseup", finish);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragVehiculeId, anchorDate, hoverDate]);

  const isDragging = dragVehiculeId !== null;

  return (
    <table className={`w-full border-collapse text-left text-xs ${isDragging ? "select-none" : ""}`}>
      <thead>
        <tr className="bg-black/5 text-ink-soft">
          <th className="sticky left-0 z-10 min-w-[160px] bg-black/5 px-3 py-2">{colVehiculo}</th>
          {jours.map((jour) => (
            <th key={jour} className="min-w-[44px] px-1 py-2 text-center font-medium">
              {jour.slice(8, 10)}
              <span className="block text-[10px] font-normal text-ink-soft/70">
                {new Date(jour + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" })}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {vehicules.map((v) => (
          <tr key={v.id} className="border-t border-black/5">
            <td className="sticky left-0 z-10 min-w-[160px] bg-white px-3 py-2 font-medium text-ink">
              {v.nom}
            </td>
            {jours.map((jour) => {
              const occ = occupation[v.id]?.[jour];

              if (occ) {
                const href =
                  occ.type === "reservation" ? `/admin/reservations/${occ.id}` : `/admin/blocages/${occ.id}`;
                const colorClass =
                  occ.type === "reservation"
                    ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                    : "bg-orange-100 text-orange-800 hover:bg-orange-200";

                return (
                  <td key={jour} className="border-l border-black/5 p-0">
                    <Link
                      href={href}
                      title={occ.label}
                      className={`flex h-10 w-full items-center justify-center overflow-hidden px-0.5 text-[10px] font-medium leading-tight ${colorClass}`}
                    >
                      <span className="truncate">{occ.label}</span>
                    </Link>
                  </td>
                );
              }

              const selected =
                isDragging &&
                dragVehiculeId === v.id &&
                anchorDate &&
                hoverDate &&
                jour >= (anchorDate <= hoverDate ? anchorDate : hoverDate) &&
                jour <= (anchorDate <= hoverDate ? hoverDate : anchorDate);

              return (
                <td key={jour} className="border-l border-black/5 p-0">
                  <div
                    role="button"
                    title={chooseTitle}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setDragVehiculeId(v.id);
                      setAnchorDate(jour);
                      setHoverDate(jour);
                    }}
                    onMouseEnter={() => {
                      if (isDragging && dragVehiculeId === v.id) setHoverDate(jour);
                    }}
                    className={`flex h-10 w-full cursor-pointer items-center justify-center ${
                      selected ? "bg-brand/20 text-brand" : "text-black/10 hover:bg-black/[0.04] hover:text-ink"
                    }`}
                  >
                    +
                  </div>
                </td>
              );
            })}
          </tr>
        ))}
        {vehicules.length === 0 && (
          <tr>
            <td colSpan={jours.length + 1} className="px-4 py-6 text-center text-ink-soft">
              {empty}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
