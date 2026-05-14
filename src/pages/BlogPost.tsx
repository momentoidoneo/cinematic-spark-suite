import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { ArrowLeft, Calendar } from "lucide-react";
import SEOHead, { blogPostSchema, breadcrumbSchema, getSiteUrl } from "@/components/SEOHead";
import { getOptimizedImageSrcSet, getOptimizedImageUrl } from "@/lib/imageUrl";

interface BlogPost {
  title: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
  created_at: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("blog_posts")
        .select("title, content, excerpt, cover_image, published_at, created_at")
        .eq("slug", slug || "")
        .eq("status", "published")
        .maybeSingle();
      setPost(data as BlogPost | null);
      setLoading(false);
    };
    load();
  }, [slug]);

  const siteUrl = getSiteUrl();

  return (
    <div className="min-h-screen bg-background">
      {post && (
        <SEOHead
          title={`${post.title} | Silvio Costa`.slice(0, 60)}
          description={(() => {
            const base = (post.excerpt || post.title || "").trim();
            const padded = base.length < 50
              ? `${base} — Silvio Costa Photography, fotografía y audiovisual profesional en España y Portugal.`.slice(0, 160)
              : base;
            return padded.length > 160 ? padded.slice(0, 157).trimEnd() + "..." : padded;
          })()}
          canonical={`${siteUrl}/blog/${slug}`}
          ogImage={post.cover_image || undefined}
          ogType="article"
          jsonLd={[
            blogPostSchema({
              title: post.title,
              slug: slug || "",
              excerpt: post.excerpt || undefined,
              coverImage: post.cover_image || undefined,
              publishedAt: post.published_at || undefined,
            }),
            breadcrumbSchema([
              { name: "Inicio", url: siteUrl },
              { name: "Blog", url: `${siteUrl}/blog` },
              { name: post.title, url: `${siteUrl}/blog/${slug}` },
            ]),
          ]}
        />
      )}
      <Navbar />
      <main className="pt-28 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al blog
          </Link>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : post ? (
            <article>
              {post.cover_image && (
                <img
                  src={getOptimizedImageUrl(post.cover_image, { width: 1200, height: 675, quality: 78 })}
                  srcSet={getOptimizedImageSrcSet(post.cover_image, [640, 960, 1200, 1600], { quality: 78 })}
                  sizes="(min-width: 768px) 768px, 100vw"
                  alt={post.title}
                  className="w-full rounded-xl mb-8 aspect-video object-cover"
                  loading="eager"
                  decoding="async"
                />
              )}
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                <Calendar className="w-4 h-4" />
                {new Date(post.published_at || post.created_at).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                {post.title}
              </h1>
              <div
                className="prose prose-invert prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-li:text-muted-foreground prose-strong:text-foreground max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </article>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Artículo no encontrado.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default BlogPost;
