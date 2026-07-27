export const SITE_URL = "https://silviocosta.net";

// Only locations with current commercial priority should be pushed through
// the sitemap. Other supported routes can remain available without consuming
// crawl/indexing resources until they have differentiated local content.
export const PRIORITY_CITY_SLUGS = ["madrid"] as const;

export const LOCAL_SERVICE_PREFIXES = [
  "fotografia",
  "fotografia-inmobiliaria",
  "fotografia-arquitectura",
  "fotografia-gastronomia",
  "fotografia-producto",
  "fotografia-eventos",
  "tour-virtual",
  "video-dron",
] as const;

export const SITEMAP_STATIC_PAGES = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/servicios/fotografia", changefreq: "monthly", priority: "0.9" },
  { loc: "/servicios/video-dron", changefreq: "monthly", priority: "0.9" },
  { loc: "/servicios/tour-virtual", changefreq: "monthly", priority: "0.9" },
  { loc: "/servicios/eventos", changefreq: "monthly", priority: "0.9" },
  { loc: "/servicios/renders", changefreq: "monthly", priority: "0.9" },
  { loc: "/portafolio", changefreq: "weekly", priority: "0.8" },
  { loc: "/blog", changefreq: "weekly", priority: "0.8" },
  {
    loc: "/guia-servicios-audiovisuales",
    changefreq: "monthly",
    priority: "0.8",
  },
  {
    loc: "/servicios-audiovisuales-madrid",
    changefreq: "monthly",
    priority: "0.9",
  },
  {
    loc: "/servicios-audiovisuales-castilla-la-mancha",
    changefreq: "monthly",
    priority: "0.9",
  },
  { loc: "/glosario", changefreq: "monthly", priority: "0.8" },
  { loc: "/precios", changefreq: "monthly", priority: "0.7" },
  {
    loc: "/trabaja-con-nosotros",
    changefreq: "monthly",
    priority: "0.6",
  },
  { loc: "/legal/privacy-policy", changefreq: "yearly", priority: "0.3" },
  { loc: "/legal/legal-notice", changefreq: "yearly", priority: "0.3" },
  { loc: "/legal/cookies", changefreq: "yearly", priority: "0.3" },
  { loc: "/legal/terms", changefreq: "yearly", priority: "0.3" },
] as const;

export const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const isSafeSlug = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim());

export const dateOnly = (value: unknown): string | null => {
  if (typeof value !== "string" || !value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? null
    : parsed.toISOString().slice(0, 10);
};

export const latestDate = (...values: unknown[]): string | null => {
  const dates = values.map(dateOnly).filter((value): value is string => !!value);
  return dates.length > 0 ? dates.sort().at(-1)! : null;
};
