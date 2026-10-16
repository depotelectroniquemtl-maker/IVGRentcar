// Balisage schema.org FAQPage — uniquement pour les questions dont la réponse est complète
// et exacte (marquées "schema": true dans messages/*.json). Les réponses qui renvoient à
// « contactez-nous » pour un détail à préciser n'y figurent volontairement pas.
export function FaqJsonLd({ items }: { items: { question: string; answer: string }[] }) {
  if (items.length === 0) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- JSON.stringify d'un contenu interne fixe (messages), aucune entrée utilisateur.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
