import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import FloatingCTA from "@/components/FloatingCTA";
import { motion } from "framer-motion";
import SEOHead, { breadcrumbSchema, faqPageSchema, getSiteUrl } from "@/components/SEOHead";
import {
  PartyPopper, Camera, Video, Music, Mic, Users, CalendarDays,
  CheckCircle2, ArrowRight, Star, Headphones, Radio, MonitorPlay
} from "lucide-react";
import portfolioEventos from "@/assets/portfolio-eventos.jpg";

const eventosServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${getSiteUrl()}/servicios/eventos#service`,
  name: "Cobertura Profesional de Eventos",
  description: "Cobertura integral de eventos con fotografía, vídeo, streaming y sonido profesional en España y Portugal.",
  provider: { "@id": `${getSiteUrl()}/#business` },
  areaServed: [
    { "@type": "Country", name: "España" },
    { "@type": "Country", name: "Portugal" },
  ],
  serviceType: "Cobertura de eventos",
  url: `${getSiteUrl()}/servicios/eventos`,
};

const services = [
  { icon: Camera, title: "Fotografía de eventos", desc: "Cobertura fotográfica completa que captura cada momento clave: ponentes, networking, detalles de organización y emociones de los asistentes. Entrega en 48-72h." },
  { icon: Video, title: "Vídeo de eventos", desc: "Grabación multicámara en 4K con edición profesional. Resúmenes, after movies y piezas para redes sociales que inmortalizan tu evento." },
  { icon: MonitorPlay, title: "Streaming en directo", desc: "Retransmisión profesional con calidad broadcast, grafismo en directo, múltiples cámaras y conexión estable garantizada en YouTube, Vimeo o plataformas privadas." },
  { icon: Headphones, title: "Sonido profesional", desc: "Sistemas de PA, microfonía inalámbrica, mezcla en directo y grabación multipista. Desde conferencias íntimas hasta eventos de gran formato." },
  { icon: Music, title: "DJ y ambientación musical", desc: "Servicio de DJ profesional con equipo de sonido e iluminación para crear la atmósfera perfecta en galas, cenas de empresa y celebraciones." },
  { icon: Radio, title: "Producción técnica integral", desc: "Coordinación completa del apartado técnico: iluminación escénica, pantallas LED, videomapping y dirección técnica para eventos complejos." },
];

const eventTypes = [
  { icon: Users, title: "Corporativos", desc: "Conferencias, convenciones, presentaciones de producto, team buildings y juntas de accionistas con cobertura audiovisual profesional." },
  { icon: PartyPopper, title: "Sociales y galas", desc: "Bodas, aniversarios, galas benéficas y fiestas privadas documentadas con elegancia y discreción." },
  { icon: CalendarDays, title: "Ferias y exposiciones", desc: "Cobertura de stands, demos en vivo, entrevistas a visitantes y resúmenes dinámicos para redes sociales." },
  { icon: Mic, title: "Conciertos y espectáculos", desc: "Grabación multicámara, sonido profesional y streaming en directo para eventos musicales y artísticos." },
];

const benefits = [
  "Cobertura foto + vídeo + streaming integrada",
  "Equipo técnico propio de última generación",
  "Coordinación completa del apartado audiovisual",
  "Entrega rápida: resúmenes en 24-48h",
  "Adaptación a cualquier formato y escala",
  "Experiencia en +200 eventos profesionales",
];

const faqs = [
  { question: "¿Qué incluye la cobertura de un evento?", answer: "Ofrecemos paquetes personalizados que pueden incluir fotografía, vídeo multicámara, streaming en directo, sonido profesional y producción técnica. Cada propuesta se adapta al tipo de evento, número de asistentes y necesidades específicas." },
  { question: "¿Cuánto cuesta la cobertura de un evento?", answer: "El precio depende de la duración del evento, los servicios contratados y la complejidad técnica. Ofrecemos presupuestos personalizados sin compromiso. Contacta con nosotros para una propuesta detallada." },
  { question: "¿Podéis hacer streaming en directo del evento?", answer: "Sí, ofrecemos retransmisión en directo con calidad broadcast, múltiples cámaras, grafismo en tiempo real y conexión estable garantizada. Compatible con YouTube, Vimeo, LinkedIn Live y plataformas privadas." },
  { question: "¿En cuánto tiempo se entregan las fotos y vídeos?", answer: "Las fotografías editadas se entregan en 48-72 horas. Los vídeos resumen están disponibles en 5-7 días laborables. Ofrecemos servicio express para highlights en redes sociales disponibles en 24h." },
  { question: "¿Cubríis eventos fuera de la Costa del Sol?", answer: "Sí, nos desplazamos a cualquier punto de España y Portugal. Hemos cubierto eventos en Madrid, Barcelona, Lisboa, Sevilla y muchas otras ciudades." },
];

const ServicioEventos = () => {
  const siteUrl = getSiteUrl();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Cobertura Profesional de Eventos en España y Portugal | Silvio Costa"
        description="Cobertura integral de eventos: fotografía, vídeo 4K, streaming en directo y sonido profesional. Corporativos, bodas, galas y conciertos en toda España y Portugal."
        canonical={`${siteUrl}/servicios/eventos`}
        jsonLd={[
          eventosServiceSchema,
          breadcrumbSchema([
            { name: "Inicio", url: siteUrl },
            { name: "Servicios", url: `${siteUrl}/#servicios` },
            { name: "Eventos", url: `${siteUrl}/servicios/eventos` },
          ]),
          faqPageSchema(faqs),
        ]}
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="max-w-6xl mx-auto relative z-10 grid md:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-primary font-medium text-sm tracking-widest uppercase mb-4">Cobertura de Eventos</p>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Eventos que se<br />
              <span className="text-gradient-primary">recuerdan siempre</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-4">
              Cobertura audiovisual integral para que cada momento de tu evento quede documentado con calidad cinematográfica.
            </p>
            <p className="text-muted-foreground text-base leading-relaxed">
              Fotografía, vídeo, streaming y sonido profesional coordinados para que tú solo te preocupes de disfrutar.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden md:block"
          >
            <img
              src={portfolioEventos}
              alt="Cobertura profesional de evento corporativo con fotografía y vídeo"
              className="rounded-2xl shadow-2xl w-full h-auto object-cover aspect-[16/10]"
              loading="eager"
            />
          </motion.div>
        </div>
      </section>

      {/* Inline CTA */}
      <section className="px-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-card border border-primary/20 p-6 md:p-8"
          >
            <div>
              <h2 className="font-display text-lg md:text-xl font-bold text-foreground mb-1">¿Tienes un evento próximo?</h2>
              <p className="text-sm text-muted-foreground">Cuéntanos los detalles y te enviamos propuesta en 24h.</p>
            </div>
            <a
              href="/#contacto"
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-full bg-gradient-primary text-primary-foreground hover:shadow-glow hover:scale-105 transition-all"
            >
              Solicitar Presupuesto <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Servicios */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Nuestros servicios para eventos</h2>
            <p className="text-muted-foreground">Todo lo que necesitas para una cobertura audiovisual completa.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="group rounded-xl bg-card border border-border/50 p-6 hover:border-primary/30 hover:shadow-glow transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tipos de eventos */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Tipos de eventos que cubrimos</h2>
            <p className="text-muted-foreground">Experiencia demostrada en todo tipo de formatos y escalas.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {eventTypes.map((e, i) => (
              <motion.div
                key={e.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 rounded-xl bg-card border border-border/50 p-6"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <e.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-1">{e.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{e.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Por qué elegirnos */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-card border border-border/50 p-8 md:p-10"
          >
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-6 h-6 text-primary" />
              <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">¿Por qué confiar en nosotros?</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Con más de <strong className="text-foreground">200 eventos</strong> cubiertos en toda España y Portugal, sabemos que cada evento es único. Por eso adaptamos nuestro equipo, estilo y enfoque a las necesidades específicas de cada cliente.
              </p>
              <p>
                Nuestro enfoque integral nos permite coordinar fotografía, vídeo, streaming y sonido como un único equipo, eliminando la complejidad de gestionar múltiples proveedores y garantizando una cobertura coherente y de máxima calidad.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits + CTA */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-card border border-border/50 p-8 md:p-12"
          >
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
                  Cobertura audiovisual completa
                </h2>
                <ul className="space-y-3">
                  {benefits.map((b) => (
                    <li key={b} className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-center md:text-left">
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  Haz de tu evento algo memorable
                </h3>
                <p className="text-muted-foreground mb-6">
                  Cuéntanos qué tienes en mente y te preparamos una propuesta a medida. Respondemos en menos de 24 horas.
                </p>
                <a
                  href="/#contacto"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Solicitar Presupuesto <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
      <FloatingCTA />
    </div>
  );
};

export default ServicioEventos;
