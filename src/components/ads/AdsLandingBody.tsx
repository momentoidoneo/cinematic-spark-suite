import type { ComponentType, ReactNode, SVGProps } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock3,
  MapPin,
  Play,
  ShieldCheck,
} from "lucide-react";
import CTASection from "@/components/CTASection";
import { trackEvent } from "@/lib/trackingEvents";

type LandingIcon = ComponentType<
  SVGProps<SVGSVGElement> & { className?: string }
>;

export type AdsLandingProof = {
  title: string;
  description: string;
  image: string;
  alt: string;
  href?: string;
};

export type AdsLandingOutcome = {
  icon: LandingIcon;
  title: string;
  description: string;
  bullets: string[];
};

export type AdsLandingFaq = {
  question: string;
  answer: string;
};

export type AdsLandingConfig = {
  trackingLabel: string;
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  heroImage: string;
  heroAlt: string;
  primaryCta: string;
  defaultService: string;
  trust: [string, string, string, string];
  proofHeading: string;
  proofDescription: string;
  proof: [AdsLandingProof, AdsLandingProof, AdsLandingProof];
  outcomesHeading: string;
  outcomesDescription: string;
  outcomes: [AdsLandingOutcome, AdsLandingOutcome, AdsLandingOutcome];
  deliverablesHeading: string;
  deliverables: string[];
  priceEyebrow: string;
  priceTitle: string;
  priceDescription: string;
  showreel?: {
    youtubeId: string;
    title: string;
    description: string;
  };
  faqs: AdsLandingFaq[];
};

const trustIcons = [Award, Clock3, MapPin, ShieldCheck] as const;

const scrollToContact = (trackingLabel: string, placement: string) => {
  trackEvent("cta_click", {
    event_category: "landing",
    event_label: `${trackingLabel}_${placement}`,
  });
};

const AdsLandingBody = ({
  config,
  afterContact,
}: {
  config: AdsLandingConfig;
  afterContact?: ReactNode;
}) => (
  <>
    <main>
      <section className="relative overflow-hidden border-b border-border/60 px-5 pb-12 pt-24 md:px-6 md:pb-16 md:pt-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,hsl(var(--primary)/0.10),transparent_34%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="order-2 lg:order-1"
          >
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {config.eyebrow}
            </p>
            <h1 className="font-display text-[2.45rem] font-bold leading-[1.04] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {config.title}{" "}
              <span className="text-primary">{config.titleAccent}</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {config.description}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href="#contacto"
                onClick={() => scrollToContact(config.trackingLabel, "hero")}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {config.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#trabajos"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-card/80 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-secondary"
              >
                Ver trabajos reales
              </a>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Respuesta en menos de 24 h · Presupuesto sin compromiso
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="order-1 overflow-hidden rounded-2xl border border-border bg-card shadow-card lg:order-2"
          >
            <img
              src={config.heroImage}
              alt={config.heroAlt}
              className="aspect-[4/3] h-full w-full object-cover sm:aspect-[16/10]"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </motion.div>
        </div>
      </section>

      <section aria-label="Garantías del servicio" className="border-b border-border/60 bg-card/35 px-5 py-5 md:px-6">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 md:grid-cols-4 md:gap-0">
          {config.trust.map((item, index) => {
            const Icon = trustIcons[index];
            return (
              <div
                key={item}
                className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-background/45 p-3 md:rounded-none md:border-y-0 md:border-l-0 md:border-r md:bg-transparent md:px-5 md:py-1 md:last:border-r-0"
              >
                <Icon className="h-4 w-4 shrink-0 text-accent" />
                <span className="text-xs font-medium leading-snug text-foreground/85 sm:text-sm">
                  {item}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section id="trabajos" className="scroll-mt-20 px-5 py-16 md:px-6 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Trabajo real
            </p>
            <h2 className="font-display text-3xl font-bold text-foreground md:text-5xl">
              {config.proofHeading}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {config.proofDescription}
            </p>
          </div>

          {config.showreel && (
            <article className="mb-8 grid overflow-hidden rounded-2xl border border-primary/25 bg-card lg:grid-cols-[1.45fr_0.55fr]">
              <div className="aspect-video bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${config.showreel.youtubeId}?rel=0`}
                  title={config.showreel.title}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              <div className="flex flex-col justify-center p-6 md:p-8">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary/12 text-primary">
                  <Play className="h-5 w-5 fill-current" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  {config.showreel.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {config.showreel.description}
                </p>
              </div>
            </article>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            {config.proof.map((item) => {
              const content = (
                <>
                  <img
                    src={item.image}
                    alt={item.alt}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </>
              );

              return item.href ? (
                <a
                  key={item.title}
                  href={item.href}
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/45"
                >
                  {content}
                </a>
              ) : (
                <article
                  key={item.title}
                  className="group overflow-hidden rounded-2xl border border-border bg-card"
                >
                  {content}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/25 px-5 py-16 md:px-6 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-5xl">
              {config.outcomesHeading}
            </h2>
            <p className="mt-4 text-muted-foreground">
              {config.outcomesDescription}
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {config.outcomes.map((outcome) => (
              <article
                key={outcome.title}
                className="rounded-2xl border border-border bg-background/70 p-6"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <outcome.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">
                  {outcome.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {outcome.description}
                </p>
                <ul className="mt-5 space-y-2.5">
                  {outcome.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-2 text-sm text-foreground/80"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:px-6 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <article className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Entrega clara
            </p>
            <h2 className="font-display text-2xl font-bold text-foreground md:text-4xl">
              {config.deliverablesHeading}
            </h2>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {config.deliverables.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2.5 rounded-xl bg-secondary/50 p-3.5"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-sm leading-relaxed text-foreground/85">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <aside className="flex flex-col justify-between rounded-2xl border border-accent/35 bg-accent/[0.055] p-6 md:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                {config.priceEyebrow}
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-foreground">
                {config.priceTitle}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {config.priceDescription}
              </p>
            </div>
            <a
              href="#contacto"
              onClick={() => scrollToContact(config.trackingLabel, "offer")}
              className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Pedir propuesta
              <ArrowRight className="h-4 w-4" />
            </a>
          </aside>
        </div>
      </section>

      <CTASection
        defaultService={config.defaultService}
        eyebrow="Presupuesto"
        title="Cuéntanos tu proyecto"
        titleAccent="y recibe una propuesta clara"
        description="Te respondemos en menos de 24 horas con disponibilidad, alcance recomendado y presupuesto orientativo."
        trackingLabel={config.trackingLabel}
      />

      <section className="border-t border-border/60 px-5 py-16 md:px-6 md:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-9 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Preguntas frecuentes
            </p>
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Lo importante antes de reservar
            </h2>
          </div>
          <div className="space-y-3">
            {config.faqs.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-border bg-card/70 px-5 open:border-primary/35"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-display font-semibold text-foreground">
                  <span>{item.question}</span>
                  <span className="text-xl font-normal text-primary transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="pb-5 pr-7 text-sm leading-relaxed text-muted-foreground md:text-base">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>

    {afterContact}
  </>
);

export default AdsLandingBody;
