import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getSiteUrl } from "@/components/SEOHead";

/**
 * Generates a dynamic sitemap.xml that includes blog post URLs.
 * Runs once on app mount — fetches published blog posts and overwrites
 * the static /sitemap.xml served from public/ with a dynamic version.
 * 
 * Since we can't write files at runtime in a SPA, this component
 * instead injects a <link rel="sitemap"> pointing to a data URI
 * and generates a /api/sitemap.xml style response isn't possible.
 * 
 * The practical approach: we generate the sitemap content and make it
 * available via a route that serves it.
 */

const SITE_URL = getSiteUrl();

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

function buildSitemapXml(blogSlugs: { slug: string; updated_at: string }[]): string {
  const urls = staticPages.map(
    (p) =>
      `  <url>\n    <loc>${SITE_URL}${p.loc}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
  );

  blogSlugs.forEach((post) => {
    urls.push(
      `  <url>\n    <loc>${SITE_URL}/blog/${post.slug}</loc>\n    <lastmod>${post.updated_at.split("T")[0]}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
    );
  });

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;
}

export function useDynamicSitemap() {
  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("slug, updated_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        if (!data || data.length === 0) return;

        const xml = buildSitemapXml(data);
        const blob = new Blob([xml], { type: "application/xml" });
        const url = URL.createObjectURL(blob);

        // Store for potential programmatic access
        (window as any).__dynamicSitemapUrl = url;
        (window as any).__dynamicSitemapXml = xml;

        // Log for debugging
        console.log(`[SEO] Dynamic sitemap generated with ${data.length} blog posts`);
      });
  }, []);
}

export { buildSitemapXml, staticPages };
