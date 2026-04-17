// Sitemap: blog posts publicados
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const SITE_URL = "https://silviocosta.net";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data } = await supabase
    .from("blog_posts")
    .select("slug, updated_at, cover_image, title")
    .eq("status", "published");

  const today = new Date().toISOString().split("T")[0];
  const urls = (data || []).map((p: any) => {
    const lastmod = (p.updated_at || today).split("T")[0];
    const img = p.cover_image
      ? `\n    <image:image><image:loc>${escapeXml(p.cover_image)}</image:loc><image:title>${escapeXml(p.title || "")}</image:title></image:image>`
      : "";
    return `  <url>
    <loc>${SITE_URL}/blog/${p.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>${img}
  </url>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;
  return new Response(xml, {
    headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=1800" },
  });
});
