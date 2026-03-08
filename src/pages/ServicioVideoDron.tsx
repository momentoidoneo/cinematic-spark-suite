import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { motion } from "framer-motion";
import SEOHead, { videoDronServiceSchema, breadcrumbSchema, getSiteUrl } from "@/components/SEOHead";
import {
  Video, Tv, PartyPopper, Clapperboard, Clock, Map,
  Plane as PlaneIcon, Eye, Image, Boxes, HomeIcon, CheckCircle2, ArrowRight,
  Film, Shield, Gauge, Layers
} from "lucide-react";

const videoServices = [
  { icon: Video, title: "Videos corporativos", desc: "Presenta tu empresa con profesionalismo y calidad cinematográfica que transmite confianza y solidez. Ideales para webs, presentaciones comerciales y ferias sectoriales." },
  { icon: Tv, title: "Videos publicitarios", desc: "Spots dinámicos y creativos diseñados para captar la atención y convertir a tu audiencia. Conceptualización, guion, producción y postproducción integral." },
  { icon: PartyPopper, title: "Videos de eventos", desc: "Resúmenes y coberturas completas que inmortalizan tus eventos más destacados. Desde conferencias hasta galas, con narración visual que transmite la emoción del momento." },
  { icon: Clapperboard, title: "Vídeos para redes sociales", desc: "Contenido optimizado y atractivo para maximizar el engagement en Instagram, TikTok, YouTube y LinkedIn. Formatos verticales, horizontales y cuadrados adaptados a cada plataforma." },
  { icon: Clock, title: "Timelapse de larga duración", desc: "Documenta la evolución de proyectos constructivos y artísticos a lo largo del tiempo. Instalamos cámaras fijas que graban durante semanas o meses para condensar el progreso en minutos." },
  { icon: Tv, title: "Streaming profesional", desc: "Transmisiones en directo con calidad broadcast para eventos, conferencias y presentaciones. Multicámara, grafismo en directo y conexión estable garantizada." },
];

const dronServices = [
  { icon: Map, title: "Fotogrametría", desc: "Mapeo y modelado 3D de terrenos con alta precisión para topografía, planificación urbanística y seguimiento de obras. Ortomosaicos y modelos digitales de elevación." },
  { icon: PlaneIcon, title: "Videos aéreos", desc: "Tomas espectaculares en movimiento que ofrecen perspectivas únicas e impactantes. Movimientos fluidos de cámara con estabilización profesional en 4K." },
  { icon: Eye, title: "Inspecciones en altura", desc: "Revisión segura y detallada de infraestructuras, fachadas, cubiertas y construcciones de difícil acceso. Reducción de riesgos laborales y costes de andamiaje." },
  { icon: Image, title: "Fotografía aérea", desc: "Imágenes estáticas de alta resolución desde el aire para proyectos inmobiliarios, comerciales y turísticos. Ideales para catálogos, webs y material promocional." },
  { icon: Boxes, title: "Modelos 3D de exteriores", desc: "Recreaciones tridimensionales precisas de edificios, terrenos y paisajes mediante fotogrametría aérea. Exportación compatible con software de arquitectura y diseño." },
  { icon: HomeIcon, title: "Video inmobiliario aéreo", desc: "Recorridos aéreos que muestran propiedades y su entorno de forma atractiva. Combinación de tomas aéreas y terrestres para presentaciones inmobiliarias completas." },
];

const benefits = [
  "Equipos de grabación 4K y drones de última generación",
  "Pilotos certificados con licencia oficial AESA",
  "Postproducción y edición profesional incluida",
  "Tomas aéreas y terrestres combinadas",
  "Adaptado a normativa vigente de vuelo (UE 2019/947)",
  "Entrega en múltiples formatos y resoluciones",
];

const whyVideoStats = [
  { value: "80%", label: "del tráfico web será vídeo en 2025" },
  { value: "64%", label: "más probabilidad de compra tras ver un vídeo" },
  { value: "1200%", label: "más compartidos que texto e imagen juntos" },
];

const ServiceBlock = ({ title, subtitle, items }: { title: string; subtitle: string; items: typeof videoServices }) => (
  <div className="mb-16">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-8"
    >
      <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground">{subtitle}</p>
    </motion.div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((s, i) => (
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
);

const ServicioVideoDron = () => {
  useEffect(() => {
    document.title = "Servicios de Video y Dron Profesional | Silvio Costa";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Producción audiovisual y servicios de dron profesional en Marbella: videos corporativos, aéreos, streaming, fotogrametría, timelapse y más. Calidad 4K.");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-primary font-medium text-sm tracking-widest uppercase mb-4">Producción Audiovisual</p>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Video y dron profesional<br />
              <span className="text-gradient-primary">para proyectos únicos</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed mb-4">
              Producción de video en 4K y servicios aéreos con dron para publicidad, corporativo, eventos e inmobiliaria. Perspectivas que transforman la percepción de tu proyecto.
            </p>
            <p className="text-muted-foreground text-base max-w-2xl leading-relaxed">
              El vídeo es el formato de contenido más consumido en Internet y el que genera mayor engagement. Combinado con tomas aéreas de dron, el resultado es un material audiovisual que eleva la percepción de cualquier marca, propiedad o evento a otro nivel.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 text-center"
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">El poder del vídeo en cifras</h2>
            <p className="text-muted-foreground">Los datos confirman que el contenido audiovisual es la herramienta de marketing más eficaz.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whyVideoStats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl bg-card border border-border/50 p-6 text-center"
              >
                <p className="font-display text-3xl font-bold text-gradient-primary mb-1">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Intro descriptiva video */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-card border border-border/50 p-8 md:p-10"
          >
            <div className="flex items-center gap-3 mb-4">
              <Film className="w-6 h-6 text-primary" />
              <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">Producción audiovisual integral</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Nuestro servicio de producción audiovisual cubre todas las fases del proyecto: desde la conceptualización y el guion hasta la grabación, edición y entrega final. Trabajamos con equipos de cine profesional, incluyendo cámaras 4K, estabilizadores gimbal, iluminación de estudio y sistemas de sonido de alta fidelidad.
              </p>
              <p>
                Ya sea un spot publicitario de 30 segundos, un vídeo corporativo de presentación o la cobertura completa de un evento, cada producción se aborda con la misma exigencia técnica y creativa. Nos adaptamos a tu presupuesto y objetivos para ofrecer el máximo valor.
              </p>
              <p>
                Los vídeos con tomas aéreas de dron añaden una dimensión espectacular a cualquier producción. Nuestros pilotos certificados operan drones de última generación con cámaras estabilizadas, cumpliendo toda la normativa vigente de AESA y la regulación europea de vuelo UE 2019/947.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <ServiceBlock title="Servicios de Video" subtitle="Producción audiovisual de alto nivel para cada necesidad." items={videoServices} />
          <ServiceBlock title="Servicios de Dron" subtitle="Perspectivas aéreas con tecnología de última generación y pilotos certificados." items={dronServices} />
        </div>
      </section>

      {/* Seguridad y normativa dron */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-card border border-border/50 p-8 md:p-10"
          >
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-primary" />
              <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">Seguridad y normativa de vuelo</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-muted-foreground leading-relaxed">
              <div className="space-y-3">
                <p>
                  Todos nuestros vuelos se realizan bajo estricto cumplimiento de la normativa europea de drones (UE 2019/947) y la regulación española de AESA. Nuestros pilotos cuentan con licencia oficial y seguro de responsabilidad civil específico para operaciones con aeronaves no tripuladas.
                </p>
                <p>
                  Antes de cada vuelo realizamos una evaluación de riesgos, verificamos las condiciones meteorológicas y obtenemos los permisos necesarios según la zona de operación. Tu seguridad y la de terceros es siempre nuestra prioridad.
                </p>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-3">Nuestras garantías:</h3>
                <ul className="space-y-2">
                  {[
                    "Pilotos con licencia oficial AESA",
                    "Seguro de RC para operaciones con dron",
                    "Evaluación de riesgos previa a cada vuelo",
                    "Gestión de permisos y notificaciones",
                    "Drones con sistemas anticolisión",
                    "Cumplimiento RGPD en zonas habitadas",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
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
                  Producción audiovisual sin límites
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
                  Lleva tu proyecto al siguiente nivel
                </h3>
                <p className="text-muted-foreground mb-6">
                  Cuéntanos qué necesitas y te preparamos una propuesta audiovisual a medida, sin compromiso. Respondemos en menos de 24 horas.
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
    </div>
  );
};

export default ServicioVideoDron;
