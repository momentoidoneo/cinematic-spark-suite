// Sitemap: páginas locales con contenido activado en código o en la BD.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";
import {
  dateOnly,
  HARDCODED_CITY_SLUGS,
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

  const { data, error } = await supabase.from("seo_cities").select("slug, updated_at").eq("is_visible", true);
  if (error) throw error;
  const dbMap = new Map<string, string | null>();
  (data || []).forEach((c: any) => {
    if (isSafeSlug(c.slug)) dbMap.set(c.slug, dateOnly(c.updated_at));
  });
  const allSlugs = Array.from(new Set([...HARDCODED_CITY_SLUGS, ...dbMap.keys()]));

  const urls: string[] = [];
  allSlugs.forEach(slug => {
    const lastmod = dbMap.get(slug);
    urls.push(`  <url>
    <loc>${SITE_URL}/fotografia-${slug}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
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
