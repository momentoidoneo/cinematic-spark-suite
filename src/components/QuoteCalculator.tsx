import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calculator } from "lucide-react";

interface Option {
  id: string;
  category: string;
  label: string;
  description: string | null;
  option_type: string;
  base_price: number;
  unit: string | null;
  min_qty: number;
  max_qty: number;
  multiplier: number;
}

const QuoteCalculator = () => {
  const [opts, setOpts] = useState<Option[]>([]);
  const [category, setCategory] = useState<string>("");
  const [selected, setSelected] = useState<Record<string, number>>({});

  useEffect(() => {
    supabase.from("quote_calculator_options").select("*").eq("is_visible", true).order("category").order("order").then(({ data }) => {
      if (data) {
        setOpts(data as Option[]);
        const first = (data as Option[])[0]?.category;
        if (first) setCategory(first);
      }
    });
  }, []);

  const cats = useMemo(() => Array.from(new Set(opts.map(o => o.category))), [opts]);
  const catOpts = useMemo(() => opts.filter(o => o.category === category), [opts, category]);

  const total = useMemo(() => {
    let sum = 0;
    let mult = 1;
    for (const o of catOpts) {
      const v = selected[o.id];
      if (!v) continue;
      if (o.option_type === "base" || o.option_type === "addon") sum += o.base_price * (v || 1);
      else if (o.option_type === "quantity") sum += o.base_price * v;
      else if (o.option_type === "multiplier") mult *= o.multiplier;
    }
    return Math.round(sum * mult);
  }, [catOpts, selected]);

  const toggle = (o: Option, val?: number) => {
    setSelected(s => {
      const next = { ...s };
      if (val === undefined) {
        if (next[o.id]) delete next[o.id]; else next[o.id] = 1;
      } else {
        if (val <= 0) delete next[o.id]; else next[o.id] = val;
      }
      return next;
    });
  };

  if (opts.length === 0) return null;

  return (
    <section className="py-16 px-6 bg-card/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs uppercase tracking-widest mb-3">
            <Calculator className="w-3.5 h-3.5" /> Calculadora orientativa
          </div>
          <h2 className="font-display text-3xl md:text-4xl text-foreground">Estima tu presupuesto</h2>
          <p className="text-sm text-muted-foreground mt-2">Configura tu proyecto y obtén una estimación inmediata. El presupuesto final se confirma tras la consulta.</p>
        </div>

        <div className="rounded-2xl bg-card border border-border p-6 md:p-8">
          {cats.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {cats.map(c => (
                <button key={c} onClick={() => { setCategory(c); setSelected({}); }} className={`px-4 py-2 rounded-full text-sm capitalize transition-colors ${category === c ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-accent/20"}`}>{c}</button>
              ))}
            </div>
          )}

          <div className="space-y-3 mb-6">
            {catOpts.map(o => (
              <div key={o.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-background/50 border border-border">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{o.label}</p>
                  {o.description && <p className="text-xs text-muted-foreground mt-0.5">{o.description}</p>}
                  <p className="text-xs text-primary mt-0.5">
                    {o.base_price > 0 && `€${o.base_price}`}{o.unit && ` / ${o.unit}`}
                    {o.option_type === "multiplier" && ` · ×${o.multiplier}`}
                  </p>
                </div>
                {o.option_type === "quantity" ? (
                  <input type="number" min={0} max={o.max_qty} value={selected[o.id] || 0} onChange={e => toggle(o, Number(e.target.value))} className="w-20 px-2 py-1.5 rounded bg-secondary border border-border text-sm text-center" />
                ) : (
                  <button onClick={() => toggle(o)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${selected[o.id] ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-accent/20"}`}>
                    {selected[o.id] ? "Incluido" : "Añadir"}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-border">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Estimación</p>
              <p className="font-display text-4xl text-foreground">desde <span className="text-primary">€{total}</span></p>
            </div>
            <a href="/#contacto" className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90">Solicitar presupuesto</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuoteCalculator;