// Sitemap: páginas estáticas y de servicios
const SITE_URL = "https://silviocosta.net";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const pages = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/servicios/fotografia", changefreq: "monthly", priority: "0.9" },
  { loc: "/servicios/video-dron", changefreq: "monthly", priority: "0.9" },
  { loc: "/servicios/tour-virtual", changefreq: "monthly", priority: "0.9" },
  { loc: "/servicios/eventos", changefreq: "monthly", priority: "0.9" },
  { loc: "/servicios/renders", changefreq: "monthly", priority: "0.9" },
  { loc: "/portafolio", changefreq: "weekly", priority: "0.8" },
  { loc: "/blog", changefreq: "weekly", priority: "0.8" },
  { loc: "/precios", changefreq: "monthly", priority: "0.7" },
  { loc: "/legal/privacy-policy", changefreq: "yearly", priority: "0.3" },
  { loc: "/legal/legal-notice", changefreq: "yearly", priority: "0.3" },
  { loc: "/legal/cookies", changefreq: "yearly", priority: "0.3" },
  { loc: "/legal/terms", changefreq: "yearly", priority: "0.3" },
];

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const today = new Date().toISOString().split("T")[0];
  const urls = pages.map(p => `  <url>
    <loc>${SITE_URL}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
});
