import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
  id: string;
  author_name: string;
  author_role: string | null;
  author_company: string | null;
  content: string;
  rating: number;
  avatar_url: string | null;
  service_tag: string | null;
}

const TestimonialsSection = () => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    supabase.from("testimonials").select("id, author_name, author_role, author_company, content, rating, avatar_url, service_tag").eq("is_visible", true).order("order").then(({ data }) => {
      if (data) setItems(data as Testimonial[]);
    });
  }, []);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setIdx(i => (i + 1) % items.length), 7000);
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) return null;
  const t = items[idx];

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-background to-card/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-widest text-primary">Lo que dicen los clientes</span>
          <h2 className="font-display text-3xl md:text-4xl text-foreground mt-3">Testimonios</h2>
        </div>
        <div className="relative rounded-2xl bg-card/60 backdrop-blur-sm border border-border p-8 md:p-12">
          <Quote className="absolute top-6 left-6 w-10 h-10 text-primary/20" />
          <div className="flex justify-center mb-4">
            {Array.from({length: t.rating}).map((_,i) => <Star key={i} className="w-4 h-4 fill-accent text-accent" />)}
          </div>
          <p className="text-lg md:text-xl text-foreground/90 text-center leading-relaxed italic">"{t.content}"</p>
          <div className="flex items-center justify-center gap-3 mt-8">
            {t.avatar_url ? (
              <img src={t.avatar_url} alt={t.author_name} className="w-12 h-12 rounded-full object-cover border-2 border-primary/30" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold">{t.author_name[0]}</div>
            )}
            <div className="text-left">
              <p className="font-semibold text-foreground">{t.author_name}</p>
              {(t.author_role || t.author_company) && (
                <p className="text-xs text-muted-foreground">{[t.author_role, t.author_company].filter(Boolean).join(" · ")}</p>
              )}
            </div>
          </div>
          {items.length > 1 && (
            <>
              <button onClick={() => setIdx(i => (i - 1 + items.length) % items.length)} aria-label="Anterior" className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/60 hover:bg-background border border-border">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setIdx(i => (i + 1) % items.length)} aria-label="Siguiente" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/60 hover:bg-background border border-border">
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="flex justify-center gap-1.5 mt-6">
                {items.map((_, i) => (
                  <button key={i} aria-label={`Ir al testimonio ${i + 1}`} onClick={() => setIdx(i)} className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/40"}`} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;