// Messages préremplis envoyés aux clients depuis /admin/demandes (lien WhatsApp),
// dans la langue du site au moment de la demande. Volontairement neutres : uniquement nom,
// véhicule, dates et prix estimé — jamais d'assurance, d'aéroport ni de montant de caution.

export type ContactLang = "fr" | "en" | "es";

export const CONTACT_LANG_DEFAULT: ContactLang = "fr";

export function contactLang(value: string | null | undefined): ContactLang {
  return value === "en" || value === "es" || value === "fr" ? value : CONTACT_LANG_DEFAULT;
}

type Input = {
  nom: string;
  vehicule: string | null;
  dateDebut: string;
  dateFin: string;
  prix: number | null;
  langue: string | null | undefined;
};

const LOCALE: Record<ContactLang, string> = { fr: "fr-CA", en: "en-US", es: "es-DO" };

function formatDate(iso: string, lang: ContactLang): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(LOCALE[lang], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function buildContactMessage(input: Input): { subject: string; body: string } {
  const lang = contactLang(input.langue);
  const du = formatDate(input.dateDebut, lang);
  const au = formatDate(input.dateFin, lang);
  const prix = input.prix ? `US$ ${input.prix}` : null;
  const v = input.vehicule;

  if (lang === "en") {
    const lignes = [
      `Hello ${input.nom},`,
      "",
      "Thank you for your rental request with IVJ Rentcar in Las Terrenas.",
      v ? `Vehicle: ${v}` : null,
      `Dates: from ${du} to ${au}`,
      prix ? `Estimated price: ${prix}` : null,
      "",
      "We will get back to you shortly to follow up on your request.",
      "",
      "Kind regards,",
      "IVJ Rentcar",
    ];
    return { subject: "Your rental request — IVJ Rentcar", body: join(lignes) };
  }

  if (lang === "es") {
    const lignes = [
      `Hola ${input.nom},`,
      "",
      "Gracias por su solicitud de alquiler en IVJ Rentcar, Las Terrenas.",
      v ? `Vehículo: ${v}` : null,
      `Fechas: del ${du} al ${au}`,
      prix ? `Precio estimado: ${prix}` : null,
      "",
      "Nos pondremos en contacto con usted en breve para continuar con su solicitud.",
      "",
      "Saludos cordiales,",
      "IVJ Rentcar",
    ];
    return { subject: "Su solicitud de alquiler — IVJ Rentcar", body: join(lignes) };
  }

  const lignes = [
    `Bonjour ${input.nom},`,
    "",
    "Merci pour votre demande de location chez IVJ Rentcar à Las Terrenas.",
    v ? `Véhicule : ${v}` : null,
    `Dates : du ${du} au ${au}`,
    prix ? `Prix estimé : ${prix}` : null,
    "",
    "Nous revenons vers vous très bientôt pour donner suite à votre demande.",
    "",
    "Cordialement,",
    "IVJ Rentcar",
  ];
  return { subject: "Votre demande de location — IVJ Rentcar", body: join(lignes) };
}

function join(lignes: (string | null)[]): string {
  return lignes.filter((l): l is string => l !== null).join("\n");
}

// wa.me attend l'indicatif et le numéro en chiffres uniquement (pas de "+").
export function whatsappHref(e164: string, text: string): string {
  return `https://wa.me/${e164.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}
