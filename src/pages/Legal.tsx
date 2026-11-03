import { usePublicRows } from "@/seo/PublicContent";
import SEOHead, { getSiteUrl } from "@/components/SEOHead";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

const Legal = () => {
  const { slug } = useParams<{ slug: string }>();
  const initial = usePublicRows<{slug: string; title: string; content: string}>("legal_texts").find(x => x.slug === slug);
  const [content, setContent] = useState(initial?.content || "");
  const [title, setTitle] = useState(initial?.title || "");
  const [loading, setLoading] = useState(!initial);

  useEffect(() => {
    const load = async () => {
      setLoading(!initial);
      const { data } = await supabase
        .from("legal_texts")
        .select("title, content")
        .eq("slug", slug || "")
        .eq("is_published", true)
        .maybeSingle();
      if (data) {
        setTitle(data.title);
        setContent(data.content);
      }
      setLoading(false);
    };
    load();
  }, [slug, initial]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={`${title} | Silvio Costa`} description={`${title} de Silvio Costa Photography.`} canonical={`${getSiteUrl()}/legal/${slug}`} />
      <Navbar />
      <main className="pt-28 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : content ? (
            <article
              className="prose prose-invert prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-li:text-muted-foreground prose-strong:text-foreground max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <p className="text-muted-foreground text-center py-12">
              Contenido no disponible.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Legal;
