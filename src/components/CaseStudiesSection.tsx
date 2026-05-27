import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, TrendingUp } from "lucide-react";

interface Metric { label: string; value: string; }
interface CaseStudy {
  id: string; title: string; slug: string; client: string | null; summary: string | null;
  cover_image: string | null; metrics: Metric[] | null; services: string[] | null; location: string | null;
}

const CaseStudiesSection = () => {
  const [items, setItems] = useState<CaseStudy[]>([]);

  useEffect(() => {
    supabase.from("case_studies")
      .select("id, title, slug, client, summary, cover_image, metrics, services, location")
      .eq("is_published", true).eq("is_featured", true)
      .order("order").limit(3)
      .then(({ data }) => { if (data) setItems(data as unknown as CaseStudy[]); });
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-widest text-primary">Resultados reales</span>
          <h2 className="font-display text-3xl md:text-4xl text-foreground mt-3">Casos de estudio</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">Cómo transformamos proyectos con audiovisual de alto impacto.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map(c => (
            <a key={c.id} href={`/casos-estudio/${c.slug}`} className="group rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/50 transition-all hover:-translate-y-1">
              {c.cover_image && (
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={c.cover_image} alt={c.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-5">
                {c.client && <p className="text-xs uppercase tracking-wider text-primary">{c.client}{c.location && ` · ${c.location}`}</p>}
                <h3 className="font-display text-xl text-foreground mt-2 group-hover:text-primary transition-colors">{c.title}</h3>
                {c.summary && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{c.summary}</p>}
                {c.metrics && c.metrics.length > 0 && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                    {c.metrics.slice(0, 3).map((m, i) => (
                      <div key={i} className="flex-1">
                        <p className="font-display text-2xl text-accent flex items-center gap-1">{m.value}<TrendingUp className="w-3 h-3" /></p>
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 inline-flex items-center gap-1 text-sm text-primary group-hover:gap-2 transition-all">
                  Ver caso <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </a>
          ))}
        </div>
        <div className="text-center mt-10">
          <a href="/casos-estudio" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-secondary text-foreground hover:bg-accent/20 transition-colors">
            Ver todos los casos <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;