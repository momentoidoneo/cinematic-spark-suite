import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://silviocosta.net";

const staticPages = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/servicios/fotografia", changefreq: "monthly", priority: "0.9" },
  { loc: "/servicios/video-dron", changefreq: "monthly", priority: "0.9" },
  { loc: "/servicios/tour-virtual", changefreq: "monthly", priority: "0.9" },
  { loc: "/portafolio", changefreq: "weekly", priority: "0.8" },
  { loc: "/blog", changefreq: "weekly", priority: "0.8" },
  { loc: "/legal/privacy-policy", changefreq: "yearly", priority: "0.3" },
  { loc: "/legal/legal-notice", changefreq: "yearly", priority: "0.3" },
  { loc: "/legal/cookies", changefreq: "yearly", priority: "0.3" },
  { loc: "/legal/terms", changefreq: "yearly", priority: "0.3" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug, updated_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    const urls = staticPages.map(
      (p) =>
        `  <url>\n    <loc>${SITE_URL}${p.loc}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
    );

    if (posts) {
      posts.forEach((post) => {
        urls.push(
          `  <url>\n    <loc>${SITE_URL}/blog/${post.slug}</loc>\n    <lastmod>${post.updated_at.split("T")[0]}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
        );
      });
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response("Error generating sitemap", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
