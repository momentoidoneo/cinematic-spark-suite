// RSS 2.0 feed for blog posts
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

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: posts } = await supabase
      .from("blog_posts")
      .select("title, slug, excerpt, cover_image, published_at, updated_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(50);

    const items = (posts || []).map((p: any) => `    <item>
      <title>${escapeXml(p.title || "")}</title>
      <link>${SITE_URL}/blog/${p.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${p.slug}</guid>
      <pubDate>${new Date(p.published_at || p.updated_at || Date.now()).toUTCString()}</pubDate>
      <description>${escapeXml(p.excerpt || "")}</description>${p.cover_image ? `
      <enclosure url="${escapeXml(p.cover_image)}" type="image/jpeg" />` : ""}
    </item>`).join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Silvio Costa Photography — Blog</title>
    <link>${SITE_URL}/blog</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Fotografía, vídeo, dron, tours virtuales 360° y renders 3D en España y Portugal.</description>
    <language>es-ES</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=1800",
      },
    });
  } catch (error: any) {
    return new Response(`Error: ${error.message}`, { status: 500, headers: corsHeaders });
  }
});
