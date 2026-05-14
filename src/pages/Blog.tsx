import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Calendar, ArrowRight } from "lucide-react";
import SEOHead, { breadcrumbSchema, getSiteUrl } from "@/components/SEOHead";
import { getOptimizedImageSrcSet, getOptimizedImageUrl } from "@/lib/imageUrl";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
  created_at: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, cover_image, published_at, created_at")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      setPosts((data as BlogPost[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  const siteUrl = getSiteUrl();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Blog de Fotografía y Audiovisual | Silvio Costa"
        description="Artículos sobre fotografía profesional, drones, tours virtuales Matterport, vídeo corporativo y tendencias del sector audiovisual en España y Portugal."
        canonical={`${siteUrl}/blog`}
        jsonLd={breadcrumbSchema([
          { name: "Inicio", url: siteUrl },
          { name: "Blog", url: `${siteUrl}/blog` },
        ])}
      />
      <Navbar />
      <main className="pt-28 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">Blog</h1>
          <p className="text-muted-foreground mb-12 max-w-xl">
            Artículos sobre fotografía, vídeo, drones y el mundo audiovisual.
          </p>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-xl bg-card border border-border p-12 text-center">
              <p className="text-muted-foreground">Aún no hay artículos publicados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group rounded-xl bg-card border border-border overflow-hidden hover:border-primary/30 transition-colors"
                >
                  {post.cover_image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={getOptimizedImageUrl(post.cover_image, { width: 640, height: 360, quality: 74 })}
                        srcSet={getOptimizedImageSrcSet(post.cover_image, [320, 480, 640, 960], { quality: 74 })}
                        sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.published_at || post.created_at).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    <h2 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{post.excerpt}</p>
                    )}
                    <span className="inline-flex items-center gap-1 text-sm text-primary font-medium">
                      Leer más <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Blog;
