import type { ReactNode } from "react";

// Découpe un texte multi-lignes (séparateur "\n") en <span className="block"> pour un
// retour à la ligne visuel contrôlé (gros titres), tout en gardant un espace réel entre
// les fragments — sans lui, le texte accessible (lecteurs d'écran, moteurs de recherche)
// colle les mots des lignes voisines ("Terrenasest" au lieu de "Terrenas est").
export function splitLines(text: string): ReactNode[] {
  const lines = text.split("\n");
  return lines.map((line, i) => (
    <span key={i} className="block">
      {line}
      {i < lines.length - 1 ? " " : ""}
    </span>
  ));
}
