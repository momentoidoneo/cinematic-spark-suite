import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";
import {
  dateOnly,
  escapeXml,
  isSafeSlug,
  latestDate,
  PRIORITY_CITY_SLUGS,
  SITE_URL,
  SITEMAP_STATIC_PAGES,
} from "../_shared/seoCatalog.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Datos en paralelo
    const [
      postsRes,
      categoriesRes,
      subcategoriesRes,
      imagesRes,
      citiesRes,
      caseStudiesRes,
    ] = await Promise.all([
      supabase.from("blog_posts").select("slug, updated_at, cover_image, title").eq("status", "published"),
      supabase.from("portfolio_categories").select("id, slug, updated_at").eq("is_visible", true),
      supabase.from("portfolio_subcategories").select("id, slug, updated_at, category_id, is_visible").eq("is_visible", true),
      supabase.from("portfolio_images")
        .select("image_url, title, alt_text, updated_at, subcategory_id")
        .eq("media_type", "image")
        .order("created_at", { ascending: false })
        .limit(1000),
      supabase.from("seo_cities").select("slug, updated_at").eq("is_visible", true),
      supabase
        .from("case_studies")
        .select("slug, updated_at, cover_image, title")
        .eq("is_published", true),
    ]);

    const queryErrors = [
      postsRes.error,
      categoriesRes.error,
      subcategoriesRes.error,
      imagesRes.error,
      citiesRes.error,
      caseStudiesRes.error,
    ].filter(Boolean);
    if (queryErrors.length > 0) {
      throw new Error(
        `Sitemap data query failed: ${queryErrors
          .map((error) => error?.message)
          .join("; ")}`,
      );
    }

    const categories = (categoriesRes.data || []).filter((category: any) =>
      isSafeSlug(category.slug)
    );
    const subcategories = (subcategoriesRes.data || []).filter(
      (subcategory: any) => isSafeSlug(subcategory.slug),
    );
    const categoryById = new Map(
      categories.map((category: any) => [category.id, category]),
    );

    const urls: string[] = [];

    // Static routes intentionally omit lastmod: using the request date would
    // falsely tell search engines that every page changes every hour.
    SITEMAP_STATIC_PAGES.forEach((page) => {
      urls.push(
        `  <url>\n    <loc>${SITE_URL}${page.loc}</loc>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>`,
      );
    });

    // Local pages supported by ServicioCiudad: code catalog + visible DB rows.
    const dbCitySlugs = new Map<string, string | null>();
    ((citiesRes?.data as any[]) || []).forEach((c) => {
      if (isSafeSlug(c.slug)) dbCitySlugs.set(c.slug, dateOnly(c.updated_at));
    });
    const allCitySlugs = new Set<string>([
      ...PRIORITY_CITY_SLUGS,
      ...dbCitySlugs.keys(),
    ]);
    allCitySlugs.forEach((slug) => {
      const lastmod = dbCitySlugs.get(slug);
      urls.push(
        `  <url>\n    <loc>${SITE_URL}/fotografia-${slug}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}\n    <changefreq>monthly</changefreq>\n    <priority>0.85</priority>\n  </url>`,
      );
    });

    // Portfolio categories.
    categories.forEach((c: any) => {
      const lastmod = dateOnly(c.updated_at);
      urls.push(
        `  <url>\n    <loc>${SITE_URL}/portafolio/${c.slug}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`,
      );
    });

    // Posts de blog (con image:image si tiene cover)
    (postsRes.data || []).forEach((post: any) => {
      if (!isSafeSlug(post.slug)) return;
      const lastmod = dateOnly(post.updated_at);
      const imgBlock = post.cover_image
        ? `\n    <image:image>\n      <image:loc>${escapeXml(post.cover_image)}</image:loc>\n      <image:title>${escapeXml(post.title || "")}</image:title>\n    </image:image>`
        : "";
      urls.push(
        `  <url>\n    <loc>${SITE_URL}/blog/${post.slug}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>${imgBlock}\n  </url>`,
      );
    });

    // Portfolio subcategory URLs and their images. Build each route once.
    const imagesBySubcat = new Map<string, any[]>();
    (imagesRes.data || []).forEach((img: any) => {
      const arr = imagesBySubcat.get(img.subcategory_id) || [];
      arr.push(img);
      imagesBySubcat.set(img.subcategory_id, arr);
    });

    subcategories.forEach((s: any) => {
      const cat = categoryById.get(s.category_id) as any;
      if (!cat) return;
      const imgs = imagesBySubcat.get(s.id) || [];
      const imgBlocks = imgs.slice(0, 50).map((img: any) =>
        `    <image:image>\n      <image:loc>${escapeXml(img.image_url)}</image:loc>${img.title ? `\n      <image:title>${escapeXml(img.title)}</image:title>` : ""}${img.alt_text ? `\n      <image:caption>${escapeXml(img.alt_text)}</image:caption>` : ""}\n    </image:image>`
      ).join("\n");
      const lastmod = latestDate(
        s.updated_at,
        ...imgs.map((image: any) => image.updated_at),
      );
      urls.push(
        `  <url>\n    <loc>${SITE_URL}/portafolio/${cat.slug}/${s.slug}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}\n    <changefreq>weekly</changefreq>\n    <priority>${imgs.length > 0 ? "0.75" : "0.7"}</priority>${imgBlocks ? `\n${imgBlocks}` : ""}\n  </url>`,
      );
    });

    // Published case studies are indexed only when real content exists.
    const caseStudies = (caseStudiesRes.data || []).filter((item: any) =>
      isSafeSlug(item.slug)
    );
    if (caseStudies.length > 0) {
      const listLastmod = latestDate(
        ...caseStudies.map((item: any) => item.updated_at),
      );
      urls.push(
        `  <url>\n    <loc>${SITE_URL}/casos-estudio</loc>${listLastmod ? `\n    <lastmod>${listLastmod}</lastmod>` : ""}\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
      );
    }
    caseStudies.forEach((item: any) => {
      const lastmod = dateOnly(item.updated_at);
      const imageBlock = item.cover_image
        ? `\n    <image:image>\n      <image:loc>${escapeXml(item.cover_image)}</image:loc>\n      <image:title>${escapeXml(item.title || "")}</image:title>\n    </image:image>`
        : "";
      urls.push(
        `  <url>\n    <loc>${SITE_URL}/casos-estudio/${item.slug}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>${imageBlock}\n  </url>`,
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
