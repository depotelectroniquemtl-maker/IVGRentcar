"use client";

import { useRef, useState } from "react";
import { primaryButtonClass, secondaryLinkClass } from "@/components/admin/form-ui";

// Résolution interne fixe (indépendante de la largeur CSS affichée) pour que le trait
// reste net sur tous les écrans — la position du pointeur est reprojetée du repère CSS
// vers ce repère à chaque évènement via getBoundingClientRect().
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 220;

export function SignaturePad({
  clearLabel,
  confirmLabel,
  onConfirm,
  disabled = false,
}: {
  clearLabel: string;
  confirmLabel: string;
  onConfirm: (dataUrl: string) => void;
  disabled?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dessinEnCours = useRef(false);
  const [aDessine, setADessine] = useState(false);

  function contexte() {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#141413";
    return ctx;
  }

  function position(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS_WIDTH,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
    };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = contexte();
    if (!ctx) return;
    canvasRef.current?.setPointerCapture(e.pointerId);
    dessinEnCours.current = true;
    const { x, y } = position(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!dessinEnCours.current) return;
    const ctx = contexte();
    if (!ctx) return;
    const { x, y } = position(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setADessine(true);
  }

  function handlePointerUp() {
    dessinEnCours.current = false;
  }

  function handleClear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setADessine(false);
  }

  function handleConfirm() {
    const canvas = canvasRef.current;
    if (!canvas || !aDessine) return;
    onConfirm(canvas.toDataURL("image/png"));
  }

  return (
    <div className="flex flex-col gap-3">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full touch-none rounded-md border border-black/20 bg-white"
        style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
      />
      <div className="flex items-center gap-3">
        <button type="button" onClick={handleClear} disabled={disabled} className={secondaryLinkClass}>
          {clearLabel}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!aDessine || disabled}
          className={primaryButtonClass}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
