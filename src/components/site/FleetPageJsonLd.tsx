import { BUSINESS_ID, SITE_URL } from "@/lib/constants";

type Crumb = { name: string; path: string };

// BreadcrumbList (toutes les pages flotte).
export function BreadcrumbJsonLd({ locale, crumbs }: { locale: string; crumbs: Crumb[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}/${locale}${c.path}`,
    })),
  };
  return <JsonLd data={data} />;
}

// Product + une Offer par palier de prix (USD), rattaché au LocalBusiness existant par son
// @id. Aucune note, aucun avis, aucune disponibilité : rien de tout cela n'est publié.
export function ProductJsonLd({
  locale,
  path,
  name,
  description,
  images,
  offers,
}: {
  locale: string;
  path: string;
  name: string;
  description: string;
  images: string[];
  offers: { name: string; price: number }[];
}) {
  const url = `${SITE_URL}/${locale}${path}`;
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: images.map((src) => `${SITE_URL}${src}`),
    url,
    offers: offers.map((o) => ({
      "@type": "Offer",
      name: o.name,
      price: o.price.toFixed(2),
      priceCurrency: "USD",
      url,
      seller: { "@id": BUSINESS_ID },
    })),
  };
  return <JsonLd data={data} />;
}

function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- JSON.stringify d'un objet interne (messages, base), aucune entrée utilisateur.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
