import { FaqJsonLd } from "@/components/site/FaqJsonLd";

// Questions fréquentes repliables + balisage FAQPage, pour les pages de catégorie (quads, voitures).
// Même présentation que la FAQ des fiches véhicule.
export function FaqAccordion({
  title,
  items,
}: {
  title: string;
  items: { question: string; answer: string }[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="flex max-w-3xl flex-col gap-3">
      <FaqJsonLd items={items} />
      <h2 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h2>
      <div className="flex flex-col divide-y divide-black/10 rounded-lg bg-white shadow-sm">
        {items.map((item) => (
          <details key={item.question} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
              {item.question}
              <span className="shrink-0 text-xl text-brand transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-2 text-ink-soft">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
