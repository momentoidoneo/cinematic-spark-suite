import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://silviocosta.net";

// Ciudades para SEO local — generan páginas /fotografia-{slug}
const LOCATIONS = [
  "madrid", "barcelona", "valencia", "sevilla", "malaga", "bilbao",
  "zaragoza", "alicante", "murcia", "palma", "granada", "cordoba",
  "marbella", "san-sebastian", "tenerife", "las-palmas",
  "lisboa", "porto", "faro",
];

const staticPages = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/servicios/fotografia", changefreq: "monthly", priority: "0.9" },
  { loc: "/servicios/video-dron", changefreq: "monthly", priority: "0.9" },
  { loc: "/servicios/tour-virtual", changefreq: "monthly", priority: "0.9" },
  { loc: "/servicios/eventos", changefreq: "monthly", priority: "0.9" },
  { loc: "/servicios/renders", changefreq: "monthly", priority: "0.9" },
  { loc: "/portafolio", changefreq: "weekly", priority: "0.8" },
  { loc: "/blog", changefreq: "weekly", priority: "0.8" },
  { loc: "/precios", changefreq: "monthly", priority: "0.7" },
  { loc: "/legal/privacy-policy", changefreq: "yearly", priority: "0.3" },
  { loc: "/legal/legal-notice", changefreq: "yearly", priority: "0.3" },
  { loc: "/legal/cookies", changefreq: "yearly", priority: "0.3" },
  { loc: "/legal/terms", changefreq: "yearly", priority: "0.3" },
];

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = new Date().toISOString().split("T")[0];

    // Datos en paralelo
    const [postsRes, categoriesRes, subcategoriesRes, imagesRes, citiesRes] = await Promise.all([
      supabase.from("blog_posts").select("slug, updated_at, cover_image, title").eq("status", "published"),
      supabase.from("portfolio_categories").select("slug, updated_at").eq("is_visible", true),
      supabase.from("portfolio_subcategories").select("slug, updated_at, category_id, link_enabled, is_visible"),
      supabase.from("portfolio_images")
        .select("image_url, title, alt_text, updated_at, subcategory_id")
        .eq("media_type", "image")
        .order("created_at", { ascending: false })
        .limit(1000),
      supabase.from("seo_cities").select("slug, updated_at").eq("is_visible", true),
    ]);

    const categories = categoriesRes.data || [];
    const subcategories = (subcategoriesRes.data || []).filter((s: any) => s.is_visible);
    const catById = new Map(categories.map((c: any) => [c.slug, c]));
    const subcatToCategory = new Map<string, any>();
    subcategories.forEach((s: any) => {
      const cat = categories.find((c: any) => c.slug && (c as any).id === s.category_id);
      if (cat) subcatToCategory.set(s.slug, cat);
    });

    const urls: string[] = [];

    // Páginas estáticas
    staticPages.forEach((p) => {
      urls.push(
        `  <url>\n    <loc>${SITE_URL}${p.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
      );
    });

    // Páginas de ubicación SEO local — hardcoded + dinámicas (BD)
    const dbCitySlugs = new Map<string, string>();
    ((citiesRes?.data as any[]) || []).forEach((c) => {
      dbCitySlugs.set(c.slug, (c.updated_at || today).split("T")[0]);
    });
    const allCitySlugs = new Set<string>([...LOCATIONS, ...dbCitySlugs.keys()]);
    allCitySlugs.forEach((slug) => {
      const lastmod = dbCitySlugs.get(slug) || today;
      urls.push(
        `  <url>\n    <loc>${SITE_URL}/fotografia-${slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.85</priority>\n  </url>`
      );
    });

    // Categorías y subcategorías del portafolio
    categories.forEach((c: any) => {
      urls.push(
        `  <url>\n    <loc>${SITE_URL}/portafolio/${c.slug}</loc>\n    <lastmod>${(c.updated_at || today).split("T")[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`
      );
    });
    subcategories.forEach((s: any) => {
      const cat = categories.find((c: any) => (c as any).id === s.category_id) as any;
      if (cat) {
        urls.push(
          `  <url>\n    <loc>${SITE_URL}/portafolio/${cat.slug}/${s.slug}</loc>\n    <lastmod>${(s.updated_at || today).split("T")[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`
        );
      }
    });

    // Posts de blog (con image:image si tiene cover)
    (postsRes.data || []).forEach((post: any) => {
      const lastmod = (post.updated_at || today).split("T")[0];
      const imgBlock = post.cover_image
        ? `\n    <image:image>\n      <image:loc>${escapeXml(post.cover_image)}</image:loc>\n      <image:title>${escapeXml(post.title || "")}</image:title>\n    </image:image>`
        : "";
      urls.push(
        `  <url>\n    <loc>${SITE_URL}/blog/${post.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>${imgBlock}\n  </url>`
      );
    });

    // Sitemap de imágenes — agrupadas por subcategoría
    const imagesBySubcat = new Map<string, any[]>();
    (imagesRes.data || []).forEach((img: any) => {
      const arr = imagesBySubcat.get(img.subcategory_id) || [];
      arr.push(img);
      imagesBySubcat.set(img.subcategory_id, arr);
    });

    subcategories.forEach((s: any) => {
      const cat = categories.find((c: any) => (c as any).id === s.category_id) as any;
      const imgs = imagesBySubcat.get((s as any).id) || [];
      if (!cat || imgs.length === 0) return;
      const imgBlocks = imgs.slice(0, 50).map((img: any) =>
        `    <image:image>\n      <image:loc>${escapeXml(img.image_url)}</image:loc>${img.title ? `\n      <image:title>${escapeXml(img.title)}</image:title>` : ""}${img.alt_text ? `\n      <image:caption>${escapeXml(img.alt_text)}</image:caption>` : ""}\n    </image:image>`
      ).join("\n");
      urls.push(
        `  <url>\n    <loc>${SITE_URL}/portafolio/${cat.slug}/${s.slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.75</priority>\n${imgBlocks}\n  </url>`
      );
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join("\n")}\n</urlset>`;

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
