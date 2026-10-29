// Contrôle de l'en-tête Origin des demandes publiques (/api/demandes). Il empêche un autre
// site d'utiliser le formulaire depuis le navigateur de ses visiteurs ; il ne remplace pas les
// contrôles de la base (un client hors navigateur peut forger n'importe quel en-tête).
//
// Origines acceptées :
//   - le domaine de production, avec et sans www ;
//   - les URL Vercel du déploiement courant (aperçus compris) : VERCEL_URL, VERCEL_BRANCH_URL et
//     VERCEL_PROJECT_PRODUCTION_URL, fournies automatiquement par Vercel côté serveur ;
//   - localhost / 127.0.0.1 en développement ;
//   - le même hôte que la requête elle-même (formulaire servi par ce déploiement, quel que soit
//     son domaine) — garantit qu'un visiteur légitime n'est jamais bloqué par un alias oublié.
// Sans Origin, on se rabat sur Referer. Sans aucun des deux, la requête est acceptée : les
// navigateurs envoient toujours Origin sur un POST fetch, son absence signifie un client hors
// navigateur, que ce contrôle ne peut de toute façon pas arrêter.

const DOMAINES_PRODUCTION = ["ivjrentcar.com", "www.ivjrentcar.com"];
const HOTES_LOCAUX = ["localhost", "127.0.0.1"];

function hoteDe(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return null;
  }
}

export function origineAutorisee(request: Request): boolean {
  const origine = request.headers.get("origin");
  const source = origine ?? request.headers.get("referer");
  if (!source) return true;

  let url: URL;
  try {
    url = new URL(source);
  } catch {
    return false; // dont Origin « null » (iframe isolée, fichier local)
  }
  const hote = url.host.toLowerCase();

  if (url.protocol === "https:" && DOMAINES_PRODUCTION.includes(hote)) return true;

  const hotesVercel = [
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ].filter((h): h is string => Boolean(h)).map((h) => h.toLowerCase());
  if (url.protocol === "https:" && hotesVercel.includes(hote)) return true;

  if (process.env.NODE_ENV !== "production" && HOTES_LOCAUX.includes(url.hostname)) return true;

  const hoteRequete =
    request.headers.get("x-forwarded-host")?.split(",")[0].trim().toLowerCase() ??
    hoteDe(request.url);
  return hoteRequete !== null && hote === hoteRequete;
}
