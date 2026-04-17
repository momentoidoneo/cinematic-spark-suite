// Sitemap: ciudades SEO (hardcoded + BD) + páginas cruce ciudad×servicio
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const SITE_URL = "https://silviocosta.net";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HARDCODED = [
  "madrid", "barcelona", "valencia", "sevilla", "malaga", "bilbao",
  "zaragoza", "alicante", "murcia", "palma", "granada", "cordoba",
  "marbella", "san-sebastian", "tenerife", "las-palmas",
  "lisboa", "porto", "faro",
];

const SERVICES = ["inmobiliaria", "arquitectura", "gastronomia", "producto", "eventos", "tour-virtual", "video-dron"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase.from("seo_cities").select("slug, updated_at").eq("is_visible", true);
  const dbMap = new Map<string, string>();
  (data || []).forEach((c: any) => dbMap.set(c.slug, (c.updated_at || today).split("T")[0]));
  const allSlugs = Array.from(new Set([...HARDCODED, ...dbMap.keys()]));

  const urls: string[] = [];
  allSlugs.forEach(slug => {
    const lastmod = dbMap.get(slug) || today;
    urls.push(`  <url>
    <loc>${SITE_URL}/fotografia-${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>`);
    // Cross pages
    SERVICES.forEach(svc => {
      urls.push(`  <url>
    <loc>${SITE_URL}/${svc}-${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.75</priority>
  </url>`);
    });
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
  return new Response(xml, {
    headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
});
