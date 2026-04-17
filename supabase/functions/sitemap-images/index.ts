// Sitemap específico de imágenes del portafolio (Google Image)
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
  const today = new Date().toISOString().split("T")[0];

  const [catsRes, subsRes, imgsRes] = await Promise.all([
    supabase.from("portfolio_categories").select("id, slug").eq("is_visible", true),
    supabase.from("portfolio_subcategories").select("id, slug, category_id, is_visible"),
    supabase.from("portfolio_images")
      .select("image_url, title, alt_text, subcategory_id")
      .eq("media_type", "image")
      .order("created_at", { ascending: false })
      .limit(1000),
  ]);

  const cats = catsRes.data || [];
  const subs = (subsRes.data || []).filter((s: any) => s.is_visible);
  const imgsBySub = new Map<string, any[]>();
  (imgsRes.data || []).forEach((img: any) => {
    const arr = imgsBySub.get(img.subcategory_id) || [];
    arr.push(img);
    imgsBySub.set(img.subcategory_id, arr);
  });

  const urls: string[] = [];
  subs.forEach((s: any) => {
    const cat = cats.find((c: any) => c.id === s.category_id);
    const imgs = imgsBySub.get(s.id) || [];
    if (!cat || imgs.length === 0) return;
    const blocks = imgs.slice(0, 100).map((img: any) =>
      `    <image:image>
      <image:loc>${escapeXml(img.image_url)}</image:loc>${img.title ? `
      <image:title>${escapeXml(img.title)}</image:title>` : ""}${img.alt_text ? `
      <image:caption>${escapeXml(img.alt_text)}</image:caption>` : ""}
    </image:image>`
    ).join("\n");
    urls.push(`  <url>
    <loc>${SITE_URL}/portafolio/${cat.slug}/${s.slug}</loc>
    <lastmod>${today}</lastmod>
${blocks}
  </url>`);
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join("\n")}
</urlset>`;
  return new Response(xml, {
    headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
});
