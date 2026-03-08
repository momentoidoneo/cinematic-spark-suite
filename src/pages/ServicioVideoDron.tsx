import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { motion } from "framer-motion";
import {
  Video, Tv, PartyPopper, Clapperboard, Clock, Map,
  Plane as PlaneIcon, Eye, Image, Boxes, HomeIcon, CheckCircle2, ArrowRight
} from "lucide-react";

const videoServices = [
  { icon: Video, title: "Videos corporativos", desc: "Presenta tu empresa con profesionalismo y calidad cinematográfica que transmite confianza y solidez." },
  { icon: Tv, title: "Videos publicitarios", desc: "Spots dinámicos y creativos diseñados para captar la atención y convertir a tu audiencia." },
  { icon: PartyPopper, title: "Videos de eventos", desc: "Resúmenes y coberturas completas que inmortalizan tus eventos más destacados." },
  { icon: Clapperboard, title: "Vídeos para redes sociales", desc: "Contenido optimizado y atractivo para maximizar el engagement en todas tus plataformas." },
  { icon: Clock, title: "Timelapse de larga duración", desc: "Documenta la evolución de proyectos constructivos y artísticos a lo largo del tiempo." },
  { icon: Tv, title: "Streaming profesional", desc: "Transmisiones en directo con calidad broadcast para eventos, conferencias y presentaciones." },
];

const dronServices = [
  { icon: Map, title: "Fotogrametría", desc: "Mapeo y modelado 3D de terrenos con alta precisión para topografía y planificación." },
  { icon: PlaneIcon, title: "Videos aéreos", desc: "Tomas espectaculares en movimiento que ofrecen perspectivas únicas e impactantes." },
  { icon: Eye, title: "Inspecciones en altura", desc: "Revisión segura y detallada de infraestructuras y construcciones de difícil acceso." },
  { icon: Image, title: "Fotografía aérea", desc: "Imágenes estáticas de alta resolución desde el aire para proyectos inmobiliarios y comerciales." },
  { icon: Boxes, title: "Modelos 3D de exteriores", desc: "Recreaciones tridimensionales precisas de edificios, terrenos y paisajes." },
  { icon: HomeIcon, title: "Video inmobiliario aéreo", desc: "Recorridos aéreos que muestran propiedades y su entorno de forma atractiva." },
];

const benefits = [
  "Equipos de grabación 4K y drones de última generación",
  "Pilotos certificados con licencia oficial",
  "Postproducción y edición profesional incluida",
  "Tomas aéreas y terrestres combinadas",
  "Adaptado a normativa vigente de vuelo",
  "Entrega en múltiples formatos y resoluciones",
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
    if (meta) meta.setAttribute("content", "Producción audiovisual y servicios de dron profesional en Marbella: videos corporativos, aéreos, streaming, fotogrametría y más.");
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
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed">
              Producción de video en 4K y servicios aéreos con dron para publicidad, corporativo, eventos e inmobiliaria. Perspectivas que transforman la percepción de tu proyecto.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <ServiceBlock title="Servicios de Video" subtitle="Producción audiovisual de alto nivel para cada necesidad." items={videoServices} />
          <ServiceBlock title="Servicios de Dron" subtitle="Perspectivas aéreas con tecnología de última generación." items={dronServices} />
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
                  Cuéntanos qué necesitas y te preparamos una propuesta audiovisual a medida, sin compromiso.
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
