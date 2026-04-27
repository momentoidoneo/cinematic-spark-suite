// Sitemap index — links to segmented sitemaps
const SITE_URL = "https://silviocosta.net";
const SUPABASE_FUNCTIONS = "https://edpqywwtgoiktotxrqrz.supabase.co/functions/v1";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const today = new Date().toISOString().split("T")[0];

  // Las funciones segmentadas no se sirven desde silviocosta.net (Lovable hosting
  // no proxea edge functions al dominio). Apuntamos directamente a las URLs reales
  // de Supabase Functions, que sí responden 200.
  const sitemaps = [
    `${SUPABASE_FUNCTIONS}/dynamic-sitemap`,
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(loc => `  <sitemap>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`).join("\n")}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
});
