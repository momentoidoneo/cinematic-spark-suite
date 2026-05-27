import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead, { getSiteUrl } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, ArrowLeft } from "lucide-react";

interface Metric { label: string; value: string; }
interface CaseStudy {
  id: string; title: string; slug: string; client: string | null; summary: string | null;
  content: string; cover_image: string | null; before_image: string | null; after_image: string | null;
  metrics: Metric[] | null; services: string[] | null; location: string | null;
}

const CasoEstudio = () => {
  const { slug } = useParams();
  const [item, setItem] = useState<CaseStudy | null>(null);
  const [loading, setLoading] = useState(true);
  const siteUrl = getSiteUrl();

  useEffect(() => {
    if (!slug) return;
    supabase.from("case_studies").select("*").eq("slug", slug).eq("is_published", true).maybeSingle().then(({ data }) => {
      setItem(data as unknown as CaseStudy);
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-background" />;
  if (!item) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20 px-6 text-center">
        <h1 className="font-display text-3xl">Caso no encontrado</h1>
        <a href="/casos-estudio" className="text-primary mt-4 inline-block">← Volver</a>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${item.title} | Caso de estudio`}
        description={item.summary || item.title}
        canonical={`${siteUrl}/casos-estudio/${item.slug}`}
        ogImage={item.cover_image || undefined}
      />
      <Navbar />
      <main className="pt-28 pb-20">
        <article className="max-w-4xl mx-auto px-6">
          <a href="/casos-estudio" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> Casos de estudio</a>
          {item.client && <p className="text-xs uppercase tracking-wider text-primary">{item.client}{item.location && ` · ${item.location}`}</p>}
          <h1 className="font-display text-4xl md:text-5xl text-foreground mt-3">{item.title}</h1>
          {item.summary && <p className="text-lg text-muted-foreground mt-4">{item.summary}</p>}

          {item.cover_image && <img src={item.cover_image} alt={item.title} className="w-full rounded-2xl mt-8 aspect-video object-cover" />}

          {item.metrics && item.metrics.length > 0 && (
            <div className="grid sm:grid-cols-3 gap-4 mt-10">
              {item.metrics.map((m, i) => (
                <div key={i} className="p-5 rounded-xl bg-card border border-border text-center">
                  <p className="font-display text-3xl text-accent flex items-center justify-center gap-1">{m.value}<TrendingUp className="w-4 h-4" /></p>
                  <p className="text-sm text-muted-foreground mt-1">{m.label}</p>
                </div>
              ))}
            </div>
          )}

          {item.before_image && item.after_image && (
            <div className="grid sm:grid-cols-2 gap-4 mt-10">
              <figure>
                <img src={item.before_image} alt="Antes" className="w-full aspect-[4/3] object-cover rounded-xl" />
                <figcaption className="text-xs text-center text-muted-foreground mt-2 uppercase tracking-widest">Antes</figcaption>
              </figure>
              <figure>
                <img src={item.after_image} alt="Después" className="w-full aspect-[4/3] object-cover rounded-xl" />
                <figcaption className="text-xs text-center text-primary mt-2 uppercase tracking-widest">Después</figcaption>
              </figure>
            </div>
          )}

          {item.content && (
            <div className="prose prose-invert max-w-none mt-10 text-foreground/90" dangerouslySetInnerHTML={{ __html: item.content }} />
          )}

          {item.services && item.services.length > 0 && (
            <div className="mt-10 pt-6 border-t border-border">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Servicios</p>
              <div className="flex flex-wrap gap-2">
                {item.services.map(s => <span key={s} className="px-3 py-1 rounded-full bg-secondary text-sm">{s}</span>)}
              </div>
            </div>
          )}

          <div className="mt-12 p-6 rounded-2xl bg-card border border-border text-center">
            <p className="font-display text-2xl text-foreground">¿Tienes un proyecto similar?</p>
            <a href="/#contacto" className="inline-block mt-4 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium">Solicitar presupuesto</a>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default CasoEstudio;