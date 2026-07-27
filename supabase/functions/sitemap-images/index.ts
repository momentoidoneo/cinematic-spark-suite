// Sitemap específico de imágenes del portafolio (Google Image)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";
import {
  escapeXml,
  isSafeSlug,
  latestDate,
  SITE_URL,
} from "../_shared/seoCatalog.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const [catsRes, subsRes, imgsRes] = await Promise.all([
    supabase.from("portfolio_categories").select("id, slug").eq("is_visible", true),
    supabase.from("portfolio_subcategories").select("id, slug, category_id, updated_at").eq("is_visible", true),
    supabase.from("portfolio_images")
      .select("image_url, title, alt_text, subcategory_id, updated_at")
      .eq("media_type", "image")
      .order("created_at", { ascending: false })
      .limit(1000),
  ]);
  if (catsRes.error || subsRes.error || imgsRes.error) {
    throw catsRes.error || subsRes.error || imgsRes.error;
  }

  const cats = (catsRes.data || []).filter((c: any) => isSafeSlug(c.slug));
  const subs = (subsRes.data || []).filter((s: any) => isSafeSlug(s.slug));
  const catById = new Map(cats.map((c: any) => [c.id, c]));
  const imgsBySub = new Map<string, any[]>();
  (imgsRes.data || []).forEach((img: any) => {
    const arr = imgsBySub.get(img.subcategory_id) || [];
    arr.push(img);
    imgsBySub.set(img.subcategory_id, arr);
  });

  const urls: string[] = [];
  subs.forEach((s: any) => {
    const cat = catById.get(s.category_id) as any;
    const imgs = imgsBySub.get(s.id) || [];
    if (!cat || imgs.length === 0) return;
    const lastmod = latestDate(s.updated_at, ...imgs.map((img: any) => img.updated_at));
    const blocks = imgs.slice(0, 100).map((img: any) =>
      `    <image:image>
      <image:loc>${escapeXml(img.image_url)}</image:loc>${img.title ? `
      <image:title>${escapeXml(img.title)}</image:title>` : ""}${img.alt_text ? `
      <image:caption>${escapeXml(img.alt_text)}</image:caption>` : ""}
    </image:image>`
    ).join("\n");
    urls.push(`  <url>
    <loc>${SITE_URL}/portafolio/${cat.slug}/${s.slug}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
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
