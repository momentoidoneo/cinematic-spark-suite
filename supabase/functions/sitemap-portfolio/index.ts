// Sitemap: portfolio categorías y subcategorías
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const SITE_URL = "https://silviocosta.net";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const today = new Date().toISOString().split("T")[0];

  const [catsRes, subsRes] = await Promise.all([
    supabase.from("portfolio_categories").select("id, slug, updated_at").eq("is_visible", true),
    supabase.from("portfolio_subcategories").select("slug, updated_at, category_id, is_visible"),
  ]);

  const cats = catsRes.data || [];
  const subs = (subsRes.data || []).filter((s: any) => s.is_visible);

  const urls: string[] = [];
  cats.forEach((c: any) => {
    urls.push(`  <url>
    <loc>${SITE_URL}/portafolio/${c.slug}</loc>
    <lastmod>${(c.updated_at || today).split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
  });
  subs.forEach((s: any) => {
    const cat = cats.find((c: any) => c.id === s.category_id);
    if (cat) urls.push(`  <url>
    <loc>${SITE_URL}/portafolio/${cat.slug}/${s.slug}</loc>
    <lastmod>${(s.updated_at || today).split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
  return new Response(xml, {
    headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
});
