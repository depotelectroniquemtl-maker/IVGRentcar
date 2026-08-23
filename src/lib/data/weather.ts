// Température actuelle à Las Terrenas pour le petit widget décoratif du hero — Open-Meteo
// (gratuit, sans clé API). Coordonnées reprises du site précédent (recherche d'adresse
// centrée sur Las Terrenas). Mise en cache 30 min : la météo ne change pas assez vite pour
// justifier un appel à chaque visite, et ça reste respectueux du service gratuit.
const LAS_TERRENAS = { latitude: 19.311, longitude: -69.543 };

export async function getCurrentTemperature(): Promise<number | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAS_TERRENAS.latitude}&longitude=${LAS_TERRENAS.longitude}&current=temperature_2m&temperature_unit=celsius`;
    const response = await fetch(url, { next: { revalidate: 1800 } });
    if (!response.ok) return null;

    const data = (await response.json()) as { current?: { temperature_2m?: number } };
    const temperature = data.current?.temperature_2m;
    return typeof temperature === "number" ? Math.round(temperature) : null;
  } catch {
    // Widget purement décoratif — si l'API est indisponible, on ne l'affiche pas plutôt
    // que de risquer d'afficher une erreur ou une valeur fausse.
    return null;
  }
}
