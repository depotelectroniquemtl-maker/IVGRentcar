"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

// Lecture automatique seulement si le visiteur ne demande ni moins d'animation ni économie de
// données, et que la connexion n'est pas très lente.
function autoplayAllowed(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (connection?.saveData) return false;
  if (connection?.effectiveType && /(^|-)2g$|^3g$/.test(connection.effectiveType)) return false;
  return true;
}

// Vidéo d'ambiance (muette, en boucle) qui ne se charge PAS avec la page : seule l'image
// d'aperçu (next/image) est livrée au départ. La vidéo démarre quand elle approche de l'écran,
// ou au clic sur le bouton de lecture quand la lecture automatique n'est pas autorisée.
export function LazyVideo({
  src,
  poster,
  posterAlt,
  playLabel,
}: {
  src: string;
  poster: string;
  posterAlt: string;
  playLabel: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [actif, setActif] = useState(false);
  const [parClic, setParClic] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el || actif || !autoplayAllowed() || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setActif(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [actif]);

  return (
    <div ref={box} className="relative aspect-video w-full bg-black">
      {actif ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          // Démarré par le visiteur : contrôles disponibles (pause, son).
          controls={parClic}
          preload="auto"
          className="h-full w-full object-cover"
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : (
        <>
          <Image
            src={poster}
            alt={posterAlt}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
          <button
            type="button"
            aria-label={playLabel}
            onClick={() => {
              setParClic(true);
              setActif(true);
            }}
            className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-ink">
              <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-6 w-6" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        </>
      )}
    </div>
  );
}
