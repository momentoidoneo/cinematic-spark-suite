import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead, { getSiteUrl } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, TrendingUp } from "lucide-react";

interface Metric { label: string; value: string; }
interface CaseStudy {
  id: string; title: string; slug: string; client: string | null; summary: string | null;
  cover_image: string | null; metrics: Metric[] | null; services: string[] | null; location: string | null;
}

const CasosEstudio = () => {
  const [items, setItems] = useState<CaseStudy[]>([]);
  const siteUrl = getSiteUrl();

  useEffect(() => {
    supabase.from("case_studies").select("id, title, slug, client, summary, cover_image, metrics, services, location").eq("is_published", true).order("order").then(({ data }) => {
      if (data) setItems(data as unknown as CaseStudy[]);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Casos de estudio | Silvio Costa Photography"
        description="Proyectos audiovisuales reales con resultados medibles: inmobiliaria, hotelero, arquitectura y eventos."
        canonical={`${siteUrl}/casos-estudio`}
      />
      <Navbar />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-12">
            <span className="text-xs uppercase tracking-widest text-primary">Portfolio comercial</span>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mt-3">Casos de estudio</h1>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">Proyectos completos con contexto, proceso y resultados.</p>
          </header>
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">Próximamente publicaremos los primeros casos.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(c => (
                <a key={c.id} href={`/casos-estudio/${c.slug}`} className="group rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/50 transition-all">
                  {c.cover_image && <div className="aspect-[4/3] overflow-hidden"><img src={c.cover_image} alt={c.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>}
                  <div className="p-5">
                    {c.client && <p className="text-xs uppercase tracking-wider text-primary">{c.client}</p>}
                    <h2 className="font-display text-xl text-foreground mt-2">{c.title}</h2>
                    {c.summary && <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{c.summary}</p>}
                    {c.metrics && c.metrics.length > 0 && (
                      <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                        {c.metrics.slice(0, 3).map((m, i) => (
                          <div key={i} className="flex-1">
                            <p className="font-display text-xl text-accent flex items-center gap-1">{m.value}<TrendingUp className="w-3 h-3" /></p>
                            <p className="text-xs text-muted-foreground">{m.label}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <span className="inline-flex items-center gap-1 text-sm text-primary mt-4">Ver caso <ArrowRight className="w-4 h-4" /></span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CasosEstudio;