import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Camera,
  CheckCircle2,
  Clapperboard,
  Cuboid,
  MapPin,
  Plane,
  ScanLine,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import CTASection from "@/components/CTASection";
import SEOHead, {
  breadcrumbSchema,
  faqPageSchema,
  getSiteUrl,
} from "@/components/SEOHead";
import {
  regionalCoverage,
  type RegionalCoverageKey,
} from "@/content/regionalCoverage";

const services = [
  {
    icon: Camera,
    title: "Fotografía profesional",
    description:
      "Inmobiliaria, arquitectura, producto, gastronomía, industria, retrato corporativo y eventos.",
    href: "/servicios/fotografia",
  },
  {
    icon: Clapperboard,
    title: "Vídeo y contenido corporativo",
    description:
      "Vídeos de empresa, campañas, entrevistas, espacios, procesos, piezas para web y redes.",
    href: "/servicios/video-dron",
  },
  {
    icon: Plane,
    title: "Fotografía y vídeo con dron",
    description:
      "Tomas aéreas condicionadas al estudio previo del espacio aéreo, la ubicación y los permisos.",
    href: "/servicios/video-dron",
  },
  {
    icon: ScanLine,
    title: "Matterport y tours 360°",
    description:
      "Gemelos digitales, recorridos remotos, planos y medición para vender o documentar espacios.",
    href: "/servicios/tour-virtual",
  },
  {
    icon: Cuboid,
    title: "Renders y visualización 3D",
    description:
      "Imágenes fotorrealistas para arquitectura, promociones, interiorismo y producto antes de producir.",
    href: "/servicios/renders",
  },
];

const regionalFaqs = (regionName: string) => [
  {
    question: `¿Qué servicios realizáis en ${regionName}?`,
    answer:
      "Fotografía profesional, vídeo corporativo, contenido con dron cuando la operación es viable, tours virtuales Matterport, cobertura de eventos, streaming y renders 3D. El alcance se adapta al objetivo y a los canales donde se utilizará el material.",
  },
  {
    question: "¿El desplazamiento está incluido?",
    answer:
      "Se calcula según la localización y la producción necesaria. Antes de confirmar recibirás una propuesta que separa claramente producción, desplazamiento, permisos, derechos de uso e impuestos aplicables.",
  },
  {
    question: "¿Podéis combinar fotografía, vídeo, dron y Matterport?",
    answer:
      "Sí. Cuando varios formatos aportan valor, los coordinamos dentro de una misma planificación para aprovechar la localización, reducir tiempos y obtener entregables coherentes.",
  },
  {
    question: "¿Cuánto tarda la propuesta?",
    answer:
      "La respuesta inicial y la recomendación de alcance se preparan normalmente en menos de 24 horas laborables cuando disponemos de ubicación, fecha, objetivo y entregables aproximados.",
  },
];

type CoberturaRegionalProps = {
  region: RegionalCoverageKey;
};

export default function CoberturaRegional({
  region,
}: CoberturaRegionalProps) {
  const content = regionalCoverage[region];
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}${content.path}`;
  const faqs = regionalFaqs(content.name);
  const otherRegion =
    region === "madrid"
      ? regionalCoverage["castilla-la-mancha"]
      : regionalCoverage.madrid;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${canonical}#service`,
    name: `Servicios audiovisuales en ${content.name}`,
    description: content.description,
    url: canonical,
    provider: { "@id": `${siteUrl}/#business` },
    serviceType:
      "Fotografía, vídeo, dron, Matterport, eventos y visualización 3D",
    areaServed: {
      "@type": "AdministrativeArea",
      name: content.areaServed.name,
      containedInPlace: {
        "@type": "Country",
        name: content.areaServed.containedInPlace,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={content.title}
        description={content.description}
        canonical={canonical}
        jsonLd={[
          serviceSchema,
          breadcrumbSchema([
            { name: "Inicio", url: siteUrl },
            { name: "Servicios", url: `${siteUrl}/#servicios` },
            { name: content.shortName, url: canonical },
          ]),
          faqPageSchema(faqs),
        ]}
      />
      <Navbar />

      <main>
        <section className="relative overflow-hidden px-6 pb-20 pt-32">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
          <div className="relative mx-auto max-w-5xl text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              {content.eyebrow}
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight text-foreground md:text-6xl">
              {content.headline}
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              {content.lead}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="#contacto"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Solicitar propuesta
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/portafolio"
                className="inline-flex items-center justify-center rounded-full border border-border bg-card px-7 py-3.5 font-semibold text-foreground transition-colors hover:border-primary/50"
              >
                Ver trabajos
              </Link>
            </div>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Un único equipo
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">
                Servicios coordinados según el objetivo del proyecto
              </h2>
              <p className="mt-4 text-muted-foreground">
                No añadimos formatos por añadir. Recomendamos fotografía,
                vídeo, dron, 360° o 3D según el tipo de cliente, el canal de
                publicación y la decisión que debe facilitar el contenido.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <Link
                  key={service.title}
                  to={service.href}
                  className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
                >
                  <service.icon className="h-6 w-6 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Ver servicio
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-card/50 px-6 py-16">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
            <div>
              <div className="flex items-center gap-2 text-primary">
                <Building2 className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">
                  Sectores habituales
                </span>
              </div>
              <h2 className="mt-3 font-display text-3xl font-bold text-foreground">
                Producción pensada para uso comercial
              </h2>
              <ul className="mt-6 space-y-3">
                {content.sectors.map((sector) => (
                  <li
                    key={sector}
                    className="flex items-start gap-3 text-muted-foreground"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    {sector}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-2 text-primary">
                <MapPin className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">
                  Área de cobertura
                </span>
              </div>
              <h2 className="mt-3 font-display text-3xl font-bold text-foreground">
                Cobertura en {content.name}
              </h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {content.zones.map((zone) => (
                  <div
                    key={zone}
                    className="rounded-xl border border-border bg-background p-4 text-sm text-foreground/85"
                  >
                    {zone}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Planificación eficiente
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-foreground">
                Alcance claro antes de movilizar recursos
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {content.operations}
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                La propuesta final detalla qué se produce, cuántas piezas se
                entregan, en qué formatos, el calendario previsto y cualquier
                condicionante operativo. Así puedes comparar el coste con el
                uso real que tendrá el contenido.
              </p>
            </div>
            <div className="rounded-2xl border border-primary/25 bg-primary/5 p-6">
              <h3 className="text-xl font-semibold text-foreground">
                ¿También necesitas cobertura en {otherRegion.name}?
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Es nuestra otra zona prioritaria. Podemos coordinar proyectos
                independientes o una producción que cubra ambas comunidades.
              </p>
              <Link
                to={otherRegion.path}
                className="mt-5 inline-flex items-center gap-2 font-semibold text-primary"
              >
                Ver cobertura en {otherRegion.shortName}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-card/40 px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center font-display text-3xl font-bold text-foreground">
              Preguntas frecuentes sobre la cobertura
            </h2>
            <div className="mt-8 space-y-4">
              {faqs.map((faq) => (
                <article
                  key={faq.question}
                  className="rounded-xl border border-border bg-background p-6"
                >
                  <h3 className="font-semibold text-foreground">
                    {faq.question}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
