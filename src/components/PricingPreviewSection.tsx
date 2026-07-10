import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  LANDING_PRICING_SETTING_KEY,
  parseLandingPricingPlanIds,
  resolveLandingPricingPlans,
} from "@/lib/landingPricing";

type PricingPlan = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  price_suffix: string | null;
  features: string[] | null;
  is_highlighted: boolean;
  is_visible: boolean;
  show_from: boolean;
  order: number;
};

const PricingPreviewSection = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [configuredPlanIds, setConfiguredPlanIds] = useState<string[] | null>(
    null,
  );

  useEffect(() => {
    const load = async () => {
      const [plansResult, settingResult] = await Promise.all([
        supabase
          .from("pricing_plans")
          .select(
            "id,name,description,price,price_suffix,features,is_highlighted,is_visible,show_from,order",
          )
          .eq("is_visible", true)
          .not("price", "is", null)
          .order("order"),
        supabase
          .from("site_settings")
          .select("value")
          .eq("key", LANDING_PRICING_SETTING_KEY)
          .maybeSingle(),
      ]);

      setPlans((plansResult.data as PricingPlan[]) || []);
      setConfiguredPlanIds(
        parseLandingPricingPlanIds(settingResult.data?.value),
      );
    };

    void load();
  }, []);

  const featuredPlans = resolveLandingPricingPlans(plans, configuredPlanIds);

  if (featuredPlans.length === 0) return null;

  const openQuoter = () =>
    window.dispatchEvent(new CustomEvent("open-smart-quoter"));

  return (
    <section id="precios-home" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary mb-3">
              Precios orientativos
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">
              Una referencia antes de hablar
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Consulta precios de partida y utiliza el cotizador para estimar el
              alcance de tu proyecto.
            </p>
          </div>
          <Link
            to="/precios"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Ver todos los precios <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div
          className={`flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-4 -mx-6 px-6 md:px-0 md:pb-0 md:grid md:overflow-visible ${
            featuredPlans.length === 1
              ? "md:grid-cols-1 md:max-w-sm md:mx-auto"
              : featuredPlans.length === 2
                ? "md:grid-cols-2 md:max-w-3xl md:mx-auto"
                : "md:grid-cols-3 md:mx-0"
          }`}
        >
          {featuredPlans.map((plan) => (
            <article
              key={plan.id}
              className={`min-w-[82vw] max-w-[340px] snap-start rounded-2xl border p-6 flex flex-col md:min-w-0 md:max-w-none ${
                plan.is_highlighted
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-card/75"
              }`}
            >
              {plan.is_highlighted && (
                <span className="self-start rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4">
                  Recomendado
                </span>
              )}
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                {plan.name}
              </h3>
              {plan.description && (
                <p className="text-sm text-muted-foreground mb-5">
                  {plan.description}
                </p>
              )}
              <p className="mb-5">
                {plan.show_from && (
                  <span className="text-sm text-muted-foreground">desde </span>
                )}
                <span className="font-display text-3xl font-bold text-primary">
                  {Number(plan.price).toLocaleString("es-ES", {
                    maximumFractionDigits: 2,
                  })}
                  €
                </span>
                {plan.price_suffix && (
                  <span className="text-sm text-muted-foreground ml-1">
                    {plan.price_suffix}
                  </span>
                )}
              </p>
              <ul className="space-y-2.5 mb-6 flex-1">
                {(plan.features || []).slice(0, 4).map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#contacto"
                className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
              >
                Pedir propuesta →
              </a>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="font-display font-bold text-foreground">
              ¿Tu proyecto no encaja en un pack?
            </p>
            <p className="text-sm text-muted-foreground">
              Calcula una horquilla orientativa y deja la solicitud registrada.
            </p>
          </div>
          <button
            type="button"
            onClick={openQuoter}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/40 px-5 py-3 text-sm font-semibold text-foreground hover:bg-primary/10 transition-colors"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            Abrir Cotizador IA
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Precios orientativos. La propuesta final detalla desplazamientos,
          permisos, derechos de uso e impuestos aplicables.
        </p>
      </div>
    </section>
  );
};

export default PricingPreviewSection;
