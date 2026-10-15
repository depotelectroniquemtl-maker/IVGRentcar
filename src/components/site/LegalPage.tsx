import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";
import { BUSINESS_EMAIL } from "@/lib/constants";
import { fillLegalTokens, type LegalContent } from "@/lib/legal";

// Rend le courriel de l'entreprise sous forme de lien mailto: dans un paragraphe.
function withMailto(text: string): ReactNode {
  const parts = text.split(BUSINESS_EMAIL);
  if (parts.length === 1) return text;
  return parts.flatMap((part, i) =>
    i === 0
      ? [part]
      : [
          <a key={i} href={`mailto:${BUSINESS_EMAIL}`} className="font-medium text-brand underline">
            {BUSINESS_EMAIL}
          </a>,
          part,
        ],
  );
}

// Mise en page commune aux pages légales (même style que FAQ et Contact).
export function LegalPage({
  content,
  updated,
  children,
}: {
  content: LegalContent;
  updated: string;
  children?: ReactNode;
}) {
  return (
    <Container className="flex max-w-3xl flex-col gap-8 py-16">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          {content.title}
        </h1>
        <p className="mt-3 text-lg text-ink-soft">{content.intro}</p>
        <p className="mt-2 text-xs text-ink-soft">{updated}</p>
      </div>

      <div className="flex flex-col gap-8">
        {content.sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-ink">{section.heading}</h2>
            {section.paragraphs?.map((p) => (
              <p key={p} className="text-ink-soft">
                {withMailto(fillLegalTokens(p))}
              </p>
            ))}
            {section.list && (
              <ul className="list-disc pl-6 text-ink-soft">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {section.after?.map((p) => (
              <p key={p} className="text-ink-soft">
                {withMailto(fillLegalTokens(p))}
              </p>
            ))}
            {section.link && (
              <p>
                <Link href={section.link.href} className="font-medium text-brand underline">
                  {section.link.label}
                </Link>
              </p>
            )}
          </section>
        ))}
      </div>

      {children}
    </Container>
  );
}
