import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import FloatingCTA from "@/components/FloatingCTA";
import SEOHead, { getSiteUrl, breadcrumbSchema } from "@/components/SEOHead";
import { motion } from "framer-motion";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  price_suffix: string | null;
  features: string[];
  is_highlighted: boolean;
  show_from: boolean;
  order: number;
}

interface PricingService {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  price_suffix: string | null;
  category: string | null;
  show_from: boolean;
  order: number;
}

const Precios = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [services, setServices] = useState<PricingService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [plansRes, servicesRes] = await Promise.all([
        supabase.from("pricing_plans").select("*").eq("is_visible", true).order("order"),
        supabase.from("pricing_services").select("*").eq("is_visible", true).order("order"),
      ]);
      if (plansRes.data) setPlans(plansRes.data as Plan[]);
      if (servicesRes.data) setServices(servicesRes.data as PricingService[]);
      setLoading(false);
    };
    load();
  }, []);

  const categories = [...new Set(services.map(s => s.category).filter(Boolean))] as string[];

  return (
    <>
      <SEOHead
        title="Precios | Silvio Costa Photography"
        description="Descubre nuestros planes y tarifas de fotografía, vídeo, dron, tours virtuales y más. Precios transparentes para cada tipo de proyecto."
        canonical={`${getSiteUrl()}/precios`}
        jsonLd={[breadcrumbSchema([
          { name: "Inicio", url: getSiteUrl() },
          { name: "Precios", url: `${getSiteUrl()}/precios` },
        ])]}
      />
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative pt-32 pb-16 px-6 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent 70%)" }} />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Tarifas
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
                Nuestros <span className="text-gradient-primary italic">Precios</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Tarifas transparentes adaptadas a cada proyecto. Encuentra el plan perfecto para ti o solicita un presupuesto personalizado.
              </p>
            </motion.div>
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* Plans */}
            {plans.length > 0 && (
              <section className="px-6 pb-20">
                <div className="max-w-6xl mx-auto">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-12"
                  >
                    Planes
                  </motion.h2>
                  <div className={`grid gap-6 ${plans.length === 1 ? "max-w-md mx-auto" : plans.length === 2 ? "sm:grid-cols-2 max-w-3xl mx-auto" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
                    {plans.map((plan, i) => (
                      <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className={`rounded-2xl border p-6 md:p-8 flex flex-col ${
                          plan.is_highlighted
                            ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
                            : "bg-card/80 border-border"
                        }`}
                      >
                        <h3 className="font-display text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                        {plan.description && <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>}
                        {plan.price != null && (
                          <div className="mb-6">
                            {plan.show_from && <span className="text-sm text-muted-foreground">desde </span>}
                            <span className="text-4xl font-bold text-primary">{plan.price}€</span>
                            {plan.price_suffix && <span className="text-muted-foreground ml-1">{plan.price_suffix}</span>}
                          </div>
                        )}
                        {plan.features.length > 0 && (
                          <ul className="space-y-3 flex-1 mb-6">
                            {plan.features.map((f, fi) => (
                              <li key={fi} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        )}
                        <a
                          href="/#contacto"
                          className="w-full py-3 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                        >
                          Solicitar Presupuesto
                          <ArrowRight className="w-4 h-4" />
                        </a>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Services */}
            {services.length > 0 && (
              <section className="px-6 pb-24">
                <div className="max-w-4xl mx-auto">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-12"
                  >
                    Servicios Individuales
                  </motion.h2>

                  <div className="space-y-8">
                    {categories.map(cat => (
                      <motion.div key={cat} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">{cat}</h3>
                        <div className="rounded-2xl border border-border bg-card/80 overflow-hidden divide-y divide-border">
                          {services.filter(s => s.category === cat).map(s => (
                            <div key={s.id} className="flex items-center justify-between px-5 py-4 gap-4">
                              <div className="min-w-0">
                                <p className="font-medium text-foreground">{s.name}</p>
                                {s.description && <p className="text-sm text-muted-foreground truncate">{s.description}</p>}
                              </div>
                              {s.price != null && (
                                <p className="text-lg font-bold text-primary whitespace-nowrap">
                                  {s.show_from && <span className="text-xs font-normal text-muted-foreground">desde </span>}
                                  {s.price}€ <span className="text-xs font-normal text-muted-foreground">{s.price_suffix}</span>
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}

                    {/* Uncategorized */}
                    {services.filter(s => !s.category).length > 0 && (
                      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        {categories.length > 0 && <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Otros</h3>}
                        <div className="rounded-2xl border border-border bg-card/80 overflow-hidden divide-y divide-border">
                          {services.filter(s => !s.category).map(s => (
                            <div key={s.id} className="flex items-center justify-between px-5 py-4 gap-4">
                              <div className="min-w-0">
                                <p className="font-medium text-foreground">{s.name}</p>
                                {s.description && <p className="text-sm text-muted-foreground truncate">{s.description}</p>}
                              </div>
                              {s.price != null && (
                                <p className="text-lg font-bold text-primary whitespace-nowrap">
                                  {s.show_from && <span className="text-xs font-normal text-muted-foreground">desde </span>}
                                  {s.price}€ <span className="text-xs font-normal text-muted-foreground">{s.price_suffix}</span>
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Empty state */}
            {plans.length === 0 && services.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-lg">Próximamente publicaremos nuestras tarifas.</p>
                <a href="/#contacto" className="inline-flex items-center gap-2 mt-4 text-primary font-medium hover:underline">
                  Solicita un presupuesto personalizado <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* CTA */}
            {(plans.length > 0 || services.length > 0) && (
              <section className="px-6 pb-24">
                <div className="max-w-3xl mx-auto text-center">
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="rounded-2xl bg-primary/5 border border-primary/15 p-8 md:p-12"
                  >
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
                      ¿Necesitas algo diferente?
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Cada proyecto es único. Cuéntanos tu idea y te preparamos un presupuesto a medida.
                    </p>
                    <a
                      href="/#contacto"
                      className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
                    >
                      Solicitar Presupuesto
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </motion.div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <Footer />
      <WhatsAppButton />
      <FloatingCTA />
    </>
  );
};

export default Precios;
