import { useEffect } from "react";
import { useSEOMetadata } from "@/hooks/useSEOMetadata";

type JsonLdSchema = Record<string, unknown>;

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: JsonLdSchema | JsonLdSchema[];
}

const SITE_URL = "https://silviocosta.net";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
const DEFAULT_OG_IMAGE_ALT = "Silvio Costa Photography, estudio de fotografia y produccion audiovisual profesional";

export function getSiteUrl() {
  return SITE_URL;
}

const SEOHead = ({ title, description, canonical, ogType = "website", ogImage, noindex = false, jsonLd }: SEOHeadProps) => {
  // Derive page path from canonical for DB lookup
  const pagePath = canonical ? new URL(canonical, SITE_URL).pathname.replace(/\/$/, "") || "/" : null;
  const seoOverride = useSEOMetadata(pagePath || "/");

  const finalTitle = seoOverride?.title || title;
  const finalDescription = seoOverride?.description || description;
  const finalOgImage = seoOverride?.og_image || ogImage;

  useEffect(() => {
    // Title
    document.title = finalTitle;

    // Meta tags
    const setMeta = (name: string, content: string, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta("description", finalDescription);
    setMeta("robots", noindex ? "noindex, nofollow" : "index, follow");

    // Open Graph
    setMeta("og:title", finalTitle, "property");
    setMeta("og:description", finalDescription, "property");
    setMeta("og:type", ogType, "property");
    setMeta("og:image", finalOgImage || DEFAULT_OG_IMAGE, "property");
    setMeta("og:image:alt", DEFAULT_OG_IMAGE_ALT, "property");
    setMeta("og:url", canonical || window.location.href, "property");
    setMeta("og:site_name", "Silvio Costa Photography", "property");
    setMeta("og:locale", "es_ES", "property");

    // Twitter
    setMeta("twitter:card", "summary_large_image", "name");
    setMeta("twitter:title", finalTitle, "name");
    setMeta("twitter:description", finalDescription, "name");
    setMeta("twitter:image", finalOgImage || DEFAULT_OG_IMAGE, "name");
    setMeta("twitter:image:alt", DEFAULT_OG_IMAGE_ALT, "name");

    // Canonical
    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      canonicalEl.rel = "canonical";
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.href = canonical || window.location.href;

    // AI discovery files for answer engines and LLM crawlers.
    document.querySelectorAll("link[data-ai-discovery]").forEach(el => el.remove());
    [
      { type: "text/plain", title: "LLM summary", href: `${SITE_URL}/llms.txt` },
      { type: "text/plain", title: "LLM full context", href: `${SITE_URL}/llms-full.txt` },
      { type: "text/markdown", title: "AI services guide", href: `${SITE_URL}/ai-context/servicios-audiovisuales.md` },
      { type: "application/json", title: "AI sitemap", href: `${SITE_URL}/ai-sitemap.json` },
    ].forEach(({ type, title, href }) => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.type = type;
      link.title = title;
      link.href = href;
      link.setAttribute("data-ai-discovery", "true");
      document.head.appendChild(link);
    });

    // Hreflang - ES & PT
    const hreflangs = [
      { lang: "es", href: canonical || window.location.href },
      { lang: "x-default", href: canonical || window.location.href },
    ];
    // Remove old hreflangs
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
    hreflangs.forEach(({ lang, href }) => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = lang;
      link.href = href;
      document.head.appendChild(link);
    });

    // JSON-LD
    const existingScripts = document.querySelectorAll('script[data-seo-jsonld]');
    existingScripts.forEach(s => s.remove());

    if (jsonLd) {
      const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      schemas.forEach(schema => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-seo-jsonld", "true");
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
      });
    }

    return () => {
      document.querySelectorAll('script[data-seo-jsonld]').forEach(s => s.remove());
    };
  }, [finalTitle, finalDescription, canonical, ogType, finalOgImage, noindex, jsonLd]);

  return null;
};

// ─── Pre-built JSON-LD schemas ─────────────────────

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}/#business`,
  name: "Silvio Costa Photography",
  description: "Servicios profesionales de fotografía, vídeo, dron y tours virtuales 360° en España y Portugal.",
  url: SITE_URL,
  telephone: "+34640934640",
  email: "silvio@silviocosta.net",
  image: DEFAULT_OG_IMAGE,
  priceRange: "€€-€€€",
  alternateName: ["Silvio Costa", "Silvio Costa Photography"],
  slogan: "Fotografía, vídeo, dron y tours virtuales para vender mejor espacios, marcas y experiencias.",
  founder: { "@id": `${SITE_URL}/#person` },
  knowsAbout: [
    "Fotografía inmobiliaria",
    "Fotografía de arquitectura",
    "Vídeo corporativo",
    "Vídeo con dron",
    "Tour virtual Matterport",
    "Renders 3D",
    "Streaming de eventos",
  ],
  hasOfferCatalog: { "@id": `${SITE_URL}/#service-catalog` },
  address: {
    "@type": "PostalAddress",
    addressCountry: "ES",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 36.7213,
    longitude: -4.4214,
  },
  areaServed: [
    { "@type": "Country", name: "España" },
    { "@type": "Country", name: "Portugal" },
  ],
  sameAs: [],
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "20:00",
  },
};

export const serviceCatalogSchema = {
  "@context": "https://schema.org",
  "@type": "OfferCatalog",
  "@id": `${SITE_URL}/#service-catalog`,
  name: "Catálogo de servicios audiovisuales de Silvio Costa Photography",
  itemListElement: [
    {
      "@type": "Offer",
      itemOffered: { "@id": `${SITE_URL}/servicios/fotografia#service` },
      availability: "https://schema.org/InStock",
      areaServed: ["España", "Portugal"],
    },
    {
      "@type": "Offer",
      itemOffered: { "@id": `${SITE_URL}/servicios/video-dron#service` },
      availability: "https://schema.org/InStock",
      areaServed: ["España", "Portugal"],
    },
    {
      "@type": "Offer",
      itemOffered: { "@id": `${SITE_URL}/servicios/tour-virtual#service` },
      availability: "https://schema.org/InStock",
      areaServed: ["España", "Portugal"],
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        "@id": `${SITE_URL}/servicios/eventos#service`,
        name: "Cobertura de eventos",
        serviceType: "Fotografía, vídeo y streaming de eventos",
        url: `${SITE_URL}/servicios/eventos`,
        provider: { "@id": `${SITE_URL}/#business` },
      },
      availability: "https://schema.org/InStock",
      areaServed: ["España", "Portugal"],
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        "@id": `${SITE_URL}/servicios/renders#service`,
        name: "Renders 3D",
        serviceType: "Visualización 3D y renders fotorrealistas",
        url: `${SITE_URL}/servicios/renders`,
        provider: { "@id": `${SITE_URL}/#business` },
      },
      availability: "https://schema.org/InStock",
      areaServed: ["España", "Portugal"],
    },
  ],
};

export const aiSearchFAQSchema = faqPageSchema([
  {
    question: "¿Qué servicios audiovisuales ofrece Silvio Costa Photography?",
    answer: "Silvio Costa Photography ofrece fotografía profesional, vídeo corporativo, vídeo con dron, tours virtuales Matterport, cobertura de eventos, streaming, renders 3D y contenido visual para inmobiliarias, arquitectura, hostelería y empresas en España y Portugal.",
  },
  {
    question: "¿En qué zonas trabaja Silvio Costa Photography?",
    answer: "El estudio trabaja en toda España y Portugal, con desplazamiento para proyectos inmobiliarios, arquitectura, eventos, hoteles, restaurantes, empresas y espacios comerciales.",
  },
  {
    question: "¿Cómo se solicita un presupuesto?",
    answer: "Se puede solicitar presupuesto desde el formulario de contacto, WhatsApp o el cotizador IA de la web. La respuesta incluye alcance recomendado, disponibilidad y precio orientativo.",
  },
]);

export const photographyServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${SITE_URL}/servicios/fotografia#service`,
  name: "Fotografía Profesional",
  description: "Servicios de fotografía profesional: inmobiliaria, arquitectura, producto, gastronomía, moda y eventos en España y Portugal.",
  provider: { "@id": `${SITE_URL}/#business` },
  areaServed: [
    { "@type": "Country", name: "España" },
    { "@type": "Country", name: "Portugal" },
  ],
  serviceType: "Fotografía profesional",
  url: `${SITE_URL}/servicios/fotografia`,
};

export const videoDronServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${SITE_URL}/servicios/video-dron#service`,
  name: "Vídeo Profesional y Dron",
  description: "Producción de vídeo corporativo, publicitario, eventos y grabación aérea con drones profesionales en España y Portugal.",
  provider: { "@id": `${SITE_URL}/#business` },
  areaServed: [
    { "@type": "Country", name: "España" },
    { "@type": "Country", name: "Portugal" },
  ],
  serviceType: "Producción audiovisual y dron",
  url: `${SITE_URL}/servicios/video-dron`,
};

export const tourVirtualServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${SITE_URL}/servicios/tour-virtual#service`,
  name: "Tours Virtuales 360° y Matterport",
  description: "Tours virtuales 360° con tecnología Matterport Pro3 para inmobiliarias, hoteles, comercios y espacios de eventos en España y Portugal.",
  provider: { "@id": `${SITE_URL}/#business` },
  areaServed: [
    { "@type": "Country", name: "España" },
    { "@type": "Country", name: "Portugal" },
  ],
  serviceType: "Tour virtual 360° y modelado 3D",
  url: `${SITE_URL}/servicios/tour-virtual`,
};

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function blogPostSchema(post: { title: string; slug: string; excerpt?: string; coverImage?: string; publishedAt?: string; updatedAt?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || "",
    image: post.coverImage || DEFAULT_OG_IMAGE,
    url: `${SITE_URL}/blog/${post.slug}`,
    datePublished: post.publishedAt || new Date().toISOString(),
    dateModified: post.updatedAt || post.publishedAt || new Date().toISOString(),
    author: {
      "@type": "Person",
      name: "Silvio Costa",
    },
    publisher: {
      "@type": "Organization",
      name: "Silvio Costa Photography",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
  };
}

export function faqPageSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// ─── Schema enriquecido E-E-A-T ─────────────────────

export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}/#person`,
  name: "Silvio Costa",
  givenName: "Silvio",
  familyName: "Costa",
  jobTitle: "Fotógrafo y videógrafo profesional",
  description: "Fotógrafo profesional con +10 años de experiencia en arquitectura, inmobiliaria, gastronomía y eventos. Especialista en Matterport Pro3 y dron AESA en España y Portugal.",
  url: SITE_URL,
  email: "silvio@silviocosta.net",
  telephone: "+34640934640",
  image: DEFAULT_OG_IMAGE,
  worksFor: { "@id": `${SITE_URL}/#business` },
  knowsAbout: [
    "Fotografía de arquitectura",
    "Fotografía inmobiliaria",
    "Tour virtual Matterport",
    "Vídeo con dron",
    "Renders 3D",
    "Streaming profesional",
  ],
  knowsLanguage: ["es", "pt", "en"],
  sameAs: [],
};

export const aggregateRatingSchema = {
  "@type": "AggregateRating",
  ratingValue: "4.9",
  reviewCount: "47",
  bestRating: "5",
  worstRating: "1",
};

export function imageObjectSchema(img: {
  url: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: img.url,
    url: img.url,
    name: img.title,
    description: img.description,
    width: img.width,
    height: img.height,
    creator: { "@id": `${SITE_URL}/#person` },
    copyrightHolder: { "@id": `${SITE_URL}/#business` },
    license: `${SITE_URL}/legal/terms`,
    acquireLicensePage: `${SITE_URL}/precios`,
  };
}

export function videoObjectSchema(v: {
  name: string;
  description?: string;
  thumbnailUrl: string;
  contentUrl?: string;
  embedUrl?: string;
  uploadDate?: string;
  duration?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: v.name,
    description: v.description || v.name,
    thumbnailUrl: v.thumbnailUrl,
    contentUrl: v.contentUrl,
    embedUrl: v.embedUrl,
    uploadDate: v.uploadDate || new Date().toISOString(),
    duration: v.duration,
    publisher: { "@id": `${SITE_URL}/#business` },
    creator: { "@id": `${SITE_URL}/#person` },
  };
}

/** Helper: enriches a Service schema with aggregate rating + provider Person. */
export function serviceSchemaWithRating(base: JsonLdSchema) {
  return {
    ...base,
    aggregateRating: aggregateRatingSchema,
    provider: { "@id": `${SITE_URL}/#business` },
  };
}

export default SEOHead;
