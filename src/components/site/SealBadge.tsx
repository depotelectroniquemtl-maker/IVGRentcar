// Badge circulaire repris du site précédent (section "why" de l'ancien app/page.tsx,
// classe .seal) — cercle blanc à bord rouge avec "IVJ" + "LAS TERRENAS", réutilisé ici
// pour la cohérence de marque entre les sections "Pourquoi IVJ" et "Las Terrenas".
export function SealBadge({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full border-4 border-brand bg-white text-center text-brand shadow-lg ${className}`}
    >
      <span className="text-lg font-black leading-none">IVJ</span>
      <span className="mt-1 text-[6px] font-bold tracking-widest">LAS TERRENAS</span>
    </div>
  );
}
