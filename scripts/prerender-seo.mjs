import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const distDir = path.join(projectRoot, "dist");
const siteUrl = "https://silviocosta.net";
const defaultImage = `${siteUrl}/og-image.jpg`;
const supabaseUrl =
  process.env.VITE_SUPABASE_URL ||
  "https://edpqywwtgoiktotxrqrz.supabase.co";

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const stripHtml = (value = "") =>
  String(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

const truncate = (value, length) => {
  const normalized = stripHtml(value);
  if (normalized.length <= length) return normalized;
  return `${normalized.slice(0, length - 1).trimEnd()}…`;
};

const isSafeSlug = (value) =>
  typeof value === "string" &&
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim());

async function loadEnvFile(filename) {
  try {
    const contents = await readFile(path.join(projectRoot, filename), "utf8");
    contents.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match || process.env[match[1]]) return;
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
    });
  } catch {
    // CI normally provides these variables directly.
  }
}

await loadEnvFile(".env");
await loadEnvFile(".env.local");

const anonKey =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

async function fetchRows(table, query) {
  if (!anonKey) return [];
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    const rows = await response.json();
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.warn(`[prerender] ${table}: ${error.message}`);
    return [];
  }
}

const catalog = JSON.parse(
  await readFile(
    path.join(projectRoot, "src/seo/publicRoutes.json"),
    "utf8",
  ),
);

const [seoOverrides, posts, categories, subcategories, caseStudies, cities] =
  await Promise.all([
    fetchRows(
      "seo_metadata",
      "select=page_path,title,description,og_image",
    ),
    fetchRows(
      "blog_posts",
      "select=slug,title,excerpt,content,cover_image&status=eq.published",
    ),
    fetchRows(
      "portfolio_categories",
      "select=id,slug,name,description,cover_image&is_visible=eq.true",
    ),
    fetchRows(
      "portfolio_subcategories",
      "select=slug,name,description,cover_image,category_id&is_visible=eq.true",
    ),
    fetchRows(
      "case_studies",
      "select=slug,title,summary,content,cover_image&is_published=eq.true",
    ),
    fetchRows(
      "seo_cities",
      "select=slug,name,region,intro&is_visible=eq.true",
    ),
  ]);

const overridesByPath = new Map(
  seoOverrides
    .filter((item) => item.page_path)
    .map((item) => [item.page_path.replace(/\/$/, "") || "/", item]),
);

const categoriesById = new Map(
  categories.map((category) => [category.id, category]),
);

const dynamicRoutes = [
  ...posts.filter((post) => isSafeSlug(post.slug)).map((post) => ({
    path: `/blog/${post.slug}`,
    title: `${post.title} | Silvio Costa`.slice(0, 60),
    description: truncate(post.excerpt || post.title, 160),
    heading: post.title,
    summary: truncate(post.content || post.excerpt || post.title, 2800),
    image: post.cover_image,
    kind: "BlogPosting",
  })),
  ...categories.filter((category) => isSafeSlug(category.slug)).map((category) => ({
    path: `/portafolio/${category.slug}`,
    title: `Portafolio de ${category.name} | Silvio Costa Photography`,
    description: truncate(
      category.description ||
        `Trabajos profesionales de ${category.name} realizados por Silvio Costa Photography.`,
      160,
    ),
    heading: `Portafolio de ${category.name}`,
    summary:
      category.description ||
      `Selección de trabajos profesionales de ${category.name}.`,
    image: category.cover_image,
    kind: "CollectionPage",
  })),
  ...subcategories.filter((subcategory) => isSafeSlug(subcategory.slug)).flatMap((subcategory) => {
    const category = categoriesById.get(subcategory.category_id);
    if (!category || !isSafeSlug(category.slug)) return [];
    return [
      {
        path: `/portafolio/${category.slug}/${subcategory.slug}`,
        title: `${subcategory.name} | Portafolio de Silvio Costa`,
        description: truncate(
          subcategory.description ||
            `Galería profesional de ${subcategory.name} de Silvio Costa Photography.`,
          160,
        ),
        heading: subcategory.name,
        summary:
          subcategory.description ||
          `Galería de trabajos profesionales de ${subcategory.name}.`,
        image: subcategory.cover_image || category.cover_image,
        kind: "CollectionPage",
      },
    ];
  }),
  ...caseStudies.filter((item) => isSafeSlug(item.slug)).map((item) => ({
    path: `/casos-estudio/${item.slug}`,
    title: `${item.title} | Caso de estudio`,
    description: truncate(item.summary || item.title, 160),
    heading: item.title,
    summary: truncate(item.content || item.summary || item.title, 2800),
    image: item.cover_image,
    kind: "Article",
  })),
  ...cities
    .filter((city) => isSafeSlug(city.slug) && city.slug !== "madrid")
    .map((city) => ({
      path: `/fotografia-${city.slug}`,
      title: `Fotografía profesional en ${city.name} | Silvio Costa`,
      description: truncate(
        `Fotografía profesional para empresas en ${city.name}, ${city.region}. ${city.intro || ""}`,
        160,
      ),
      heading: `Fotografía profesional en ${city.name}`,
      summary:
        city.intro ||
        `Producción fotográfica para empresas y espacios de ${city.name}.`,
      kind: "Service",
    })),
];

const routesByPath = new Map();
[...catalog.map((route) => ({ ...route, managedMetadata: true })), ...dynamicRoutes].forEach((route) => {
  if (!route.path?.startsWith("/")) return;
  routesByPath.set(route.path.replace(/\/$/, "") || "/", route);
});

const sourceHtml = await readFile(path.join(distDir, "index.html"), "utf8");

function setTitle(html, value) {
  return html.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeHtml(value)}</title>`,
  );
}

function setMeta(html, attribute, key, value) {
  const pattern = new RegExp(
    `<meta\\s+([^>]*?${attribute}=["']${key}["'][^>]*?)>`,
    "i",
  );
  const match = html.match(pattern);
  const tag = `<meta ${attribute}="${escapeHtml(key)}" content="${escapeHtml(value)}" />`;
  if (!match) return html.replace("</head>", `    ${tag}\n  </head>`);
  return html.replace(pattern, (original) => {
    if (/\scontent=["'][^"']*["']/i.test(original)) {
      return original.replace(
        /\scontent=["'][^"']*["']/i,
        ` content="${escapeHtml(value)}"`,
      );
    }
    return original.replace(/>$/, ` content="${escapeHtml(value)}">`);
  });
}

function setLink(html, rel, href, extra = "") {
  const pattern = new RegExp(
    `<link\\s+[^>]*rel=["']${rel}["'][^>]*>`,
    "i",
  );
  const tag = `<link rel="${rel}" href="${escapeHtml(href)}"${extra} />`;
  return pattern.test(html)
    ? html.replace(pattern, tag)
    : html.replace("</head>", `    ${tag}\n  </head>`);
}

function fallbackMarkup(route) {
  const canonical = `${siteUrl}${route.path === "/" ? "" : route.path}`;
  const summary = truncate(route.summary || route.description, 3000);
  return `<div id="root">
      <main data-prerendered-route="${escapeHtml(route.path)}" style="min-height:100vh;background:#090b10;color:#f4f4f5;font-family:Arial,sans-serif;padding:clamp(2rem,7vw,6rem) clamp(1.25rem,7vw,7rem);box-sizing:border-box">
        <nav aria-label="Navegación principal" style="display:flex;flex-wrap:wrap;gap:1rem;margin-bottom:clamp(3rem,8vw,7rem)">
          <a href="/" style="color:#f4b52c;text-decoration:none;font-weight:700">Silvio Costa</a>
          <a href="/servicios/fotografia" style="color:#d4d4d8;text-decoration:none">Servicios</a>
          <a href="/portafolio" style="color:#d4d4d8;text-decoration:none">Portafolio</a>
          <a href="/precios" style="color:#d4d4d8;text-decoration:none">Precios</a>
          <a href="/#contacto" style="color:#d4d4d8;text-decoration:none">Contacto</a>
        </nav>
        <article style="max-width:900px">
          <p style="color:#f4b52c;text-transform:uppercase;letter-spacing:.14em;font-size:.8rem">Silvio Costa Photography</p>
          <h1 style="font-size:clamp(2.3rem,7vw,5.5rem);line-height:1.02;margin:.5rem 0 1.5rem">${escapeHtml(route.heading)}</h1>
          <p style="font-size:clamp(1rem,2vw,1.35rem);line-height:1.7;color:#c4c7cf;max-width:800px">${escapeHtml(summary)}</p>
          <p style="margin-top:2rem">
            <a href="/#contacto" style="display:inline-block;background:#f4b52c;color:#111827;padding:.9rem 1.25rem;border-radius:.6rem;text-decoration:none;font-weight:700">Solicitar propuesta</a>
          </p>
        </article>
        <footer style="margin-top:clamp(4rem,12vw,10rem);color:#8b8f99;font-size:.9rem">
          Madrid · Castilla-La Mancha · España · Portugal ·
          <a href="mailto:silvio@silviocosta.net" style="color:#d4d4d8">silvio@silviocosta.net</a>
        </footer>
      </main>
    </div>`;
}

function renderRoute(route) {
  const normalizedPath = route.path.replace(/\/$/, "") || "/";
  const override = overridesByPath.get(normalizedPath);
  const title =
    (!route.managedMetadata && override?.title) || route.title;
  const description = truncate(
    (!route.managedMetadata && override?.description) || route.description,
    160,
  );
  const image = override?.og_image || route.image || defaultImage;
  const canonical = `${siteUrl}${normalizedPath === "/" ? "" : normalizedPath}`;
  const ogType = route.kind === "BlogPosting" ? "article" : "website";
  const schemaType = route.kind || "WebPage";
  const schema = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "@id": `${canonical}#page`,
    url: canonical,
    name: title,
    headline: route.heading,
    description,
    inLanguage: "es",
    isPartOf: { "@id": `${siteUrl}/#website` },
    provider: { "@id": `${siteUrl}/#business` },
    primaryImageOfPage: { "@type": "ImageObject", url: image },
  };

  let html = setTitle(sourceHtml, title);
  html = setMeta(html, "name", "description", description);
  html = setMeta(html, "name", "robots", "index, follow");
  html = setMeta(html, "property", "og:title", title);
  html = setMeta(html, "property", "og:description", description);
  html = setMeta(html, "property", "og:type", ogType);
  html = setMeta(html, "property", "og:url", canonical);
  html = setMeta(html, "property", "og:image", image);
  html = setMeta(html, "property", "og:image:secure_url", image);
  html = setMeta(html, "name", "twitter:title", title);
  html = setMeta(html, "name", "twitter:description", description);
  html = setMeta(html, "name", "twitter:image", image);
  html = setLink(html, "canonical", canonical);
  html = html.replace(
    "</head>",
    `    <link rel="alternate" hreflang="es" href="${escapeHtml(canonical)}" />\n` +
      `    <link rel="alternate" hreflang="x-default" href="${escapeHtml(canonical)}" />\n` +
      `    <link rel="alternate" type="text/plain" title="LLM summary" href="${siteUrl}/llms.txt" data-ai-discovery="true" />\n` +
      `    <link rel="alternate" type="text/markdown" title="AI services guide" href="${siteUrl}/ai-context/servicios-audiovisuales.md" data-ai-discovery="true" />\n` +
      `    <script type="application/ld+json" data-seo-jsonld="true">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script>\n` +
      "  </head>",
  );
  html = html.replace('<div id="root"></div>', fallbackMarkup(route));
  return html;
}

for (const route of routesByPath.values()) {
  const normalized = route.path.replace(/^\/+|\/+$/g, "");
  const outputDir = normalized ? path.join(distDir, normalized) : distDir;
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "index.html"), renderRoute(route));
}

const legacyRedirects = [
  { from: "/trabajos-realizados", to: "/portafolio" },
  { from: "/tour-virtual", to: "/servicios/tour-virtual" },
  { from: "/portfolio", to: "/portafolio" },
  { from: "/servicios-1", to: "/servicios/fotografia" },
  { from: "/contacto", to: "/#contacto" },
  {
    from: "/service-page/servicios-de-fotografía-varios",
    to: "/servicios/fotografia",
    outputAliases: [
      "/service-page/servicios-de-fotograf%C3%ADa-varios",
    ],
  },
  ...posts
    .filter((post) => isSafeSlug(post.slug))
    .map((post) => ({
      from: `/single-post/${post.slug}`,
      to: `/blog/${post.slug}`,
    })),
];

function renderLegacyRedirect({ from, to }) {
  const target = `${siteUrl}${to}`;
  let html = setTitle(
    sourceHtml,
    "Página trasladada | Silvio Costa Photography",
  );
  html = setMeta(
    html,
    "name",
    "description",
    "Esta página ha cambiado de dirección. Te llevamos al contenido actualizado.",
  );
  html = setMeta(html, "name", "robots", "noindex, follow");
  html = setMeta(html, "property", "og:url", target);
  html = setLink(html, "canonical", target);
  html = html.replace(
    "</head>",
    `    <meta http-equiv="refresh" content="0; url=${escapeHtml(target)}" />\n` +
      `    <script>window.location.replace(${JSON.stringify(target).replaceAll("<", "\\u003c")});</script>\n` +
      "  </head>",
  );
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root"><main style="min-height:100vh;background:#090b10;color:#f4f4f5;font-family:Arial,sans-serif;padding:4rem 1.5rem"><h1>Página trasladada</h1><p>Este contenido está ahora en <a href="${escapeHtml(target)}" style="color:#f4b52c">${escapeHtml(to)}</a>.</p></main></div>`,
  );
  return html;
}

for (const redirect of legacyRedirects) {
  const outputPaths = [redirect.from, ...(redirect.outputAliases || [])];
  for (const outputPath of outputPaths) {
    const outputDir = path.join(
      distDir,
      outputPath.replace(/^\/+|\/+$/g, ""),
    );
    await mkdir(outputDir, { recursive: true });
    await writeFile(
      path.join(outputDir, "index.html"),
      renderLegacyRedirect(redirect),
    );
  }
}

const redirectLines = [
  "/trabajos-realizados /portafolio 301!",
  "/tour-virtual /servicios/tour-virtual 301!",
  "/portfolio /portafolio 301!",
  "/servicios-1 /servicios/fotografia 301!",
  "/contacto /#contacto 301!",
  "/single-post/* /blog 301!",
  "/service-page/servicios-de-fotograf%C3%ADa-varios /servicios/fotografia 301!",
  ...[...routesByPath.keys()]
    .filter((routePath) => routePath !== "/")
    .map((routePath) => `${routePath} ${routePath}/index.html 200`),
  "/admin/* /index.html 200",
  "/login /index.html 200",
  "/* /404.html 404",
];
await writeFile(path.join(distDir, "_redirects"), `${redirectLines.join("\n")}\n`);

const notFoundRoute = {
  path: "/404",
  title: "Página no encontrada | Silvio Costa Photography",
  description: "La página solicitada no existe o ha cambiado de ubicación.",
  heading: "Página no encontrada",
  summary:
    "La dirección solicitada no existe. Puedes volver al inicio, consultar los servicios o explorar el portafolio.",
  kind: "WebPage",
  managedMetadata: true,
};
let notFoundHtml = renderRoute(notFoundRoute);
notFoundHtml = setMeta(notFoundHtml, "name", "robots", "noindex, nofollow");
await writeFile(path.join(distDir, "404.html"), notFoundHtml);

console.log(
  `[prerender] generated ${routesByPath.size} route HTML files, ${legacyRedirects.length} legacy redirects and a real 404 fallback`,
);
