import { useEffect } from "react";
import { useSEOMetadata } from "@/hooks/useSEOMetadata";

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

const SITE_URL = "https://silviocosta.net";
const DEFAULT_OG_IMAGE = "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2f67c332-ce35-47a8-9573-d3eca9b22ea6/id-preview-66eb4a07--fe5fb065-a82f-4e14-9e41-abf41661d2fd.lovable.app-1772959367452.png";

export function getSiteUrl() {
  return SITE_URL;
}

const SEOHead = ({ title, description, canonical, ogType = "website", ogImage, noindex = false, jsonLd }: SEOHeadProps) => {
  useEffect(() => {
    // Title
    document.title = title;

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

    setMeta("description", description);
    setMeta("robots", noindex ? "noindex, nofollow" : "index, follow");

    // Open Graph
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", ogType, "property");
    setMeta("og:image", ogImage || DEFAULT_OG_IMAGE, "property");
    setMeta("og:url", canonical || window.location.href, "property");
    setMeta("og:site_name", "Silvio Costa Photography", "property");
    setMeta("og:locale", "es_ES", "property");

    // Twitter
    setMeta("twitter:card", "summary_large_image", "name");
    setMeta("twitter:title", title, "name");
    setMeta("twitter:description", description, "name");
    setMeta("twitter:image", ogImage || DEFAULT_OG_IMAGE, "name");

    // Canonical
    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      canonicalEl.rel = "canonical";
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.href = canonical || window.location.href;

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
  }, [title, description, canonical, ogType, ogImage, noindex, jsonLd]);

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

export default SEOHead;
