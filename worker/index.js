const PUBLISHED_SERVICE_CITY_PATHS = new Set([
  "/fotografia-madrid",
  "/fotografia-inmobiliaria-madrid",
]);

const SERVICE_CITY_PREFIXES = [
  "fotografia-inmobiliaria",
  "fotografia-arquitectura",
  "fotografia-gastronomia",
  "fotografia-producto",
  "fotografia-eventos",
  "tour-virtual",
  "video-dron",
  "fotografia",
];

const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isRetiredProgrammaticPath(pathname) {
  const normalizedPath = `/${pathname.replace(/^\/+|\/+$/g, "")}`;
  if (PUBLISHED_SERVICE_CITY_PATHS.has(normalizedPath)) return false;

  const slug = normalizedPath.slice(1);
  return SERVICE_CITY_PREFIXES.some((prefix) => {
    if (!slug.startsWith(`${prefix}-`)) return false;
    const locationSlug = slug.slice(prefix.length + 1);
    return SAFE_SLUG.test(locationSlug);
  });
}

function goneResponse() {
  return new Response(
    `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="robots" content="noindex, nofollow" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Página retirada | Silvio Costa Photography</title>
  </head>
  <body>
    <main>
      <h1>Esta página ya no está disponible</h1>
      <p>Consulta los servicios y zonas de cobertura actualmente publicados.</p>
      <p><a href="/servicios-audiovisuales-madrid">Servicios en Madrid</a></p>
      <p><a href="/servicios-audiovisuales-castilla-la-mancha">Servicios en Castilla-La Mancha</a></p>
    </main>
  </body>
</html>`,
    {
      status: 410,
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Type": "text/html; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    },
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (
      (request.method === "GET" || request.method === "HEAD") &&
      isRetiredProgrammaticPath(url.pathname)
    ) {
      return goneResponse();
    }

    return env.ASSETS.fetch(request);
  },
};
