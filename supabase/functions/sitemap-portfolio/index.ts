// Sitemap: portfolio categorías y subcategorías
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";
import {
  dateOnly,
  isSafeSlug,
  SITE_URL,
} from "../_shared/seoCatalog.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const [catsRes, subsRes] = await Promise.all([
    supabase.from("portfolio_categories").select("id, slug, updated_at").eq("is_visible", true),
    supabase.from("portfolio_subcategories").select("id, slug, updated_at, category_id").eq("is_visible", true),
  ]);
  if (catsRes.error || subsRes.error) {
    throw catsRes.error || subsRes.error;
  }

  const cats = (catsRes.data || []).filter((c: any) => isSafeSlug(c.slug));
  const subs = (subsRes.data || []).filter((s: any) => isSafeSlug(s.slug));
  const catById = new Map(cats.map((c: any) => [c.id, c]));

  const urls: string[] = [];
  cats.forEach((c: any) => {
    const lastmod = dateOnly(c.updated_at);
    urls.push(`  <url>
    <loc>${SITE_URL}/portafolio/${c.slug}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
  });
  subs.forEach((s: any) => {
    const cat = catById.get(s.category_id) as any;
    const lastmod = dateOnly(s.updated_at);
    if (cat) urls.push(`  <url>
    <loc>${SITE_URL}/portafolio/${cat.slug}/${s.slug}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
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
