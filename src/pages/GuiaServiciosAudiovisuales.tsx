import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEOHead, {
  breadcrumbSchema,
  faqPageSchema,
  getSiteUrl,
  localBusinessSchema,
  personSchema,
  serviceCatalogSchema,
} from "@/components/SEOHead";
import { ArrowRight, Camera, Clock, Euro, MapPin, MessageCircle, Sparkles, Video } from "lucide-react";
import guideHero from "@/assets/hero-bg.jpg";

const faqs = [
  {
    question: "¿Qué servicio audiovisual necesito para vender o alquilar una propiedad?",
    answer: "Para una propiedad estándar suele bastar con fotografía inmobiliaria profesional. Para inmuebles premium, hoteles, promociones o espacios singulares conviene añadir vídeo, dron y tour virtual Matterport para aumentar confianza y filtrar visitas poco cualificadas.",
  },
  {
    question: "¿Cuánto cuesta una producción audiovisual profesional?",
    answer: "Depende del servicio, alcance, localización y urgencia. Como referencia, una sesión fotográfica puede empezar alrededor de 180-280 euros para inmuebles estándar; un vídeo corporativo suele requerir una producción más amplia; y un tour Matterport se calcula según superficie y entregables.",
  },
  {
    question: "¿Cuánto tarda la entrega?",
    answer: "Fotografía y tours virtuales suelen entregarse en 48-72 horas. Vídeo, dron, streaming o renders 3D dependen de la edición y complejidad, normalmente entre varios días y dos semanas.",
  },
  {
    question: "¿Trabajáis fuera de Málaga o Andalucía?",
    answer: "Sí. Silvio Costa Photography trabaja en toda España y Portugal, con desplazamiento para inmobiliarias, arquitectura, hoteles, restaurantes, eventos y empresas.",
  },
];

const serviceBlocks = [
  {
    icon: Camera,
    title: "Fotografía profesional",
    useCase: "Inmobiliaria, arquitectura, producto, gastronomía, retrato corporativo y eventos.",
    outcome: "Imágenes listas para web, portales, campañas, catálogos y redes.",
    url: "/servicios/fotografia",
  },
  {
    icon: Video,
    title: "Vídeo, dron y streaming",
    useCase: "Vídeos corporativos, piezas para redes, visitas aéreas, eventos y campañas.",
    outcome: "Mayor contexto visual, narrativa de marca y contenido reutilizable.",
    url: "/servicios/video-dron",
  },
  {
    icon: MapPin,
    title: "Tour virtual Matterport",
    useCase: "Inmuebles, hoteles, comercios, restaurantes, museos, coworkings y espacios de eventos.",
    outcome: "Recorridos 360, gemelos digitales, planos y mediciones para visitas remotas.",
    url: "/servicios/tour-virtual",
  },
];

const decisionRows = [
  ["Necesito vender o alquilar rápido", "Fotografía inmobiliaria + opción de dron si el exterior aporta valor."],
  ["El espacio es premium o turístico", "Fotografía + vídeo + Matterport para enseñar experiencia y recorrido."],
  ["Quiero explicar una empresa o servicio", "Vídeo corporativo con guion, rodaje y edición orientada a conversión."],
  ["Tengo un proyecto aún no construido", "Renders 3D fotorrealistas y visualización de interiores/exteriores."],
  ["Necesito cubrir un evento", "Fotografía, vídeo resumen, streaming o multicámara según audiencia y uso posterior."],
];

const GuiaServiciosAudiovisuales = () => {
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}/guia-servicios-audiovisuales`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${canonical}#article`,
    headline: "Guía de servicios audiovisuales profesionales para empresas, inmobiliarias y espacios",
    description: "Qué servicio audiovisual contratar, qué incluye, cuánto puede costar y cuándo elegir fotografía, vídeo, dron, Matterport, eventos o renders 3D.",
    url: canonical,
    image: `${siteUrl}/og-image.jpg`,
    datePublished: "2026-04-29",
    dateModified: "2026-04-29",
    author: { "@id": `${siteUrl}/#person` },
    publisher: { "@id": `${siteUrl}/#business` },
    mainEntityOfPage: canonical,
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Guía de servicios audiovisuales: fotografía, vídeo, dron y Matterport"
        description="Guía rápida para elegir entre fotografía profesional, vídeo, dron, tour virtual Matterport, eventos o renders 3D. Precios orientativos, plazos, entregables y recomendación por caso."
        canonical={canonical}
        jsonLd={[
          localBusinessSchema,
          personSchema,
          articleSchema,
          serviceCatalogSchema,
          faqPageSchema(faqs),
          breadcrumbSchema([
            { name: "Inicio", url: siteUrl },
            { name: "Guía de servicios audiovisuales", url: canonical },
          ]),
        ]}
      />
      <Navbar />

      <main>
        <section className="relative min-h-[74vh] pt-28 pb-12 px-6 overflow-hidden flex items-end">
          <img
            src={guideHero}
            alt="Producción audiovisual profesional con fotografía, vídeo y dron"
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-background/75" />
          <div className="relative z-10 max-w-5xl mx-auto w-full">
            <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-4">
              Guía para elegir bien
            </p>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight max-w-4xl">
              Qué servicio audiovisual contratar según tu objetivo
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-3xl">
              Una referencia clara para decidir entre fotografía profesional, vídeo, dron, tour virtual Matterport,
              cobertura de eventos, streaming o renders 3D en proyectos de empresa, inmobiliaria, arquitectura,
              hostelería y espacios comerciales.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/#contacto"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Solicitar recomendación <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/precios"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-5 py-3 text-sm font-semibold text-foreground hover:border-primary/50 transition-colors"
              >
                Ver precios orientativos
              </a>
            </div>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-4">
              {serviceBlocks.map((service) => (
                <a
                  key={service.title}
                  href={service.url}
                  className="rounded-lg border border-border bg-card p-5 hover:border-primary/50 transition-colors"
                >
                  <service.icon className="h-6 w-6 text-primary mb-4" />
                  <h2 className="font-display text-xl font-bold text-foreground mb-3">{service.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{service.useCase}</p>
                  <p className="text-sm text-foreground/85 leading-relaxed">{service.outcome}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-16 bg-card/40 border-y border-border">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-[0.8fr_1.2fr] gap-10">
            <div>
              <Sparkles className="h-7 w-7 text-primary mb-4" />
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                Recomendación rápida por necesidad
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Las búsquedas actuales son más conversacionales. Esta tabla resume la respuesta que normalmente
                necesita un cliente antes de pedir presupuesto.
              </p>
            </div>
            <div className="space-y-3">
              {decisionRows.map(([need, recommendation]) => (
                <div key={need} className="rounded-lg border border-border bg-background/60 p-4">
                  <p className="text-sm font-semibold text-foreground mb-1">{need}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-6">
            <div className="rounded-lg border border-border bg-card p-5">
              <Euro className="h-6 w-6 text-primary mb-4" />
              <h2 className="font-display text-xl font-bold text-foreground mb-3">Precio</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                El presupuesto depende de alcance, desplazamiento, número de entregables, derechos de uso,
                urgencia y nivel de postproducción. El cotizador IA puede dar una primera estimación.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <Clock className="h-6 w-6 text-primary mb-4" />
              <h2 className="font-display text-xl font-bold text-foreground mb-3">Plazo</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fotografía y Matterport suelen estar listos en 48-72 horas. Vídeo, eventos y renders requieren
                más planificación, edición y revisión.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <MessageCircle className="h-6 w-6 text-primary mb-4" />
              <h2 className="font-display text-xl font-bold text-foreground mb-3">Siguiente paso</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Para acertar, conviene enviar ubicación, objetivo, fecha, superficie o duración, referencias visuales
                y dónde se usará el material.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 pb-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground mb-8">Preguntas frecuentes</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <article key={faq.question} className="rounded-lg border border-border bg-card p-5">
                  <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default GuiaServiciosAudiovisuales;
