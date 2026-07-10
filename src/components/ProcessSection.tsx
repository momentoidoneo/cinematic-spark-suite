import { ClipboardCheck, Camera, Send } from "lucide-react";

const steps = [
  {
    icon: ClipboardCheck,
    number: "01",
    title: "Objetivo y alcance",
    description:
      "Nos cuentas qué necesitas y te recomendamos el formato, los entregables y el calendario adecuados.",
  },
  {
    icon: Camera,
    number: "02",
    title: "Producción coordinada",
    description:
      "Planificamos permisos, localización, equipo y rodaje para que el proyecto avance sin improvisaciones.",
  },
  {
    icon: Send,
    number: "03",
    title: "Entrega lista para usar",
    description:
      "Recibes el material editado y preparado para web, portales, campañas, redes o presentación comercial.",
  },
];

const ProcessSection = () => (
  <section className="py-20 px-6 border-y border-border/50 bg-card/25">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary mb-3">
          Cómo trabajamos
        </p>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
          Un proceso claro, de la idea a la entrega
        </h2>
      </div>
      <ol className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-4 -mx-6 px-6 md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-3 md:overflow-visible">
        {steps.map((step) => (
          <li
            key={step.number}
            className="relative min-w-[82vw] max-w-[340px] snap-start rounded-2xl border border-border bg-card p-6 md:min-w-0 md:max-w-none md:p-7"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="font-display text-3xl font-bold text-muted-foreground">
                {step.number}
              </span>
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              {step.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

export default ProcessSection;
