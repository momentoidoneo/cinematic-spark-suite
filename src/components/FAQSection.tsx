import { ChevronDown, HelpCircle } from "lucide-react";
import { landingFaqItems } from "@/content/landingFaq";

const FAQSection = () => (
  <section id="preguntas-frecuentes" className="py-20 px-6">
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-5">
          <HelpCircle className="h-4 w-4" />
          Preguntas frecuentes
        </div>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
          Antes de poner en marcha tu proyecto
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Respuestas directas sobre cobertura, plazos, presupuestos y
          producción.
        </p>
      </div>

      <div className="space-y-3">
        {landingFaqItems.map((item, index) => (
          <details
            key={item.question}
            className="group rounded-2xl border border-border bg-card/70 px-5 md:px-6 open:border-primary/30"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-display font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-lg">
              <span>{item.question}</span>
              <ChevronDown className="h-5 w-5 shrink-0 text-primary transition-transform group-open:rotate-180" />
            </summary>
            <p className="pb-5 pr-8 text-sm md:text-base leading-relaxed text-muted-foreground">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </div>
  </section>
);

export default FAQSection;
