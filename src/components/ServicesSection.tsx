import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Home, ShoppingBag, UtensilsCrossed, Sofa, Building2, Package,
  Shirt, Building, Camera, Megaphone, CalendarDays, Boxes,
  Video, Tv, PartyPopper, Clapperboard, Clock,
  Map, Plane as PlaneIcon, Eye, Image, Boxes as Boxes2, HomeIcon
} from "lucide-react";

const photoServices = [
  { icon: Home, title: "Arquitectura e interiores", desc: "Capturamos la esencia y el diseño de cualquier espacio arquitectónico con precisión." },
  { icon: ShoppingBag, title: "Catálogo y e-commerce", desc: "Imágenes nítidas y atractivas para potenciar tus ventas online." },
  { icon: UtensilsCrossed, title: "Fotografía gastronómica", desc: "Hacemos que tus platos luzcan irresistibles y apetecibles." },
  { icon: Sofa, title: "Fotografía de interiores", desc: "Resaltamos la decoración y el ambiente de cualquier interior." },
  { icon: Building2, title: "Fotografía de arquitectura", desc: "Perspectivas únicas que destacan la majestuosidad de las construcciones." },
  { icon: Package, title: "Fotografía de producto", desc: "Detalles perfectos e iluminación ideal para destacar tus productos." },
  { icon: Shirt, title: "Fotografía de Moda", desc: "Editoriales y lookbooks con estilo, elegancia y tendencia." },
  { icon: Building, title: "Fotografía inmobiliarias", desc: "Imágenes profesionales para acelerar la venta o alquiler de propiedades." },
  { icon: Camera, title: "Fotografía aérea - DRON", desc: "Vistas espectaculares desde el aire para una perspectiva diferente." },
  { icon: Megaphone, title: "Publicidad", desc: "Imágenes de alto impacto diseñadas para campañas publicitarias exitosas." },
  { icon: CalendarDays, title: "Eventos", desc: "Cobertura completa y profesional de tus eventos más importantes." },
  { icon: Boxes, title: "Renders 3D", desc: "Creación de imágenes fotorrealistas y modelado 3D para arquitectura y producto." },
];

const videoServices = [
  { icon: Video, title: "Videos corporativos", desc: "Presenta tu empresa con profesionalismo y calidad cinematográfica." },
  { icon: Tv, title: "Videos de publicidad", desc: "Spots publicitarios dinámicos para captar la atención de tu audiencia." },
  { icon: PartyPopper, title: "Videos de eventos", desc: "Resúmenes y coberturas completas de tus eventos más destacados." },
  { icon: Clapperboard, title: "Vídeos sociales", desc: "Contenido optimizado y atractivo para tus redes sociales." },
  { icon: Clock, title: "Timelapse de larga duración", desc: "Documenta la evolución de proyectos a lo largo del tiempo." },
  { icon: Tv, title: "Streaming", desc: "Transmisiones en directo con calidad profesional para eventos, conferencias y más." },
];

const dronServices = [
  { icon: Map, title: "Fotogrametría", desc: "Mapeo y modelado 3D de terrenos con alta precisión." },
  { icon: PlaneIcon, title: "Videos aéreos", desc: "Tomas espectaculares en movimiento desde perspectivas únicas." },
  { icon: Eye, title: "Inspecciones en altura", desc: "Revisión segura y detallada de infraestructuras de difícil acceso." },
  { icon: Image, title: "Fotografía Aérea", desc: "Imágenes estáticas de alta resolución desde el aire." },
  { icon: Boxes2, title: "Modelos 3D de exteriores", desc: "Recreaciones tridimensionales de edificios y paisajes." },
  { icon: HomeIcon, title: "Video inmobiliarias", desc: "Recorridos aéreos para mostrar propiedades y su entorno." },
];

const ServiceCard = ({ icon: Icon, title, desc, index }: { icon: any; title: string; desc: string; index: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group rounded-xl bg-card border border-border/50 p-6 hover:border-primary/30 hover:shadow-glow transition-all"
    >
      <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h4 className="font-display text-lg font-semibold text-foreground mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </motion.div>
  );
};

const SectionTitle = ({ icon: Icon, title, gradient }: { icon: any; title: string; gradient?: boolean }) => (
  <div className="flex items-center gap-3 mb-8">
    <Icon className={`w-6 h-6 ${gradient ? "text-primary" : "text-primary"}`} />
    <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground">{title}</h3>
    <div className="h-0.5 w-12 bg-gradient-primary rounded-full" />
  </div>
);

const ServicesSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section id="servicios" className="pt-12 pb-24 px-6" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Servicios de{" "}
            <span className="text-gradient-primary italic">Fotografía</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Especialistas en capturar la mejor imagen para tu negocio, producto o evento.
          </p>
        </motion.div>

        {/* Photography */}
        <div id="fotografia">
          <SectionTitle icon={Camera} title="Servicios de Fotografía" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
            {photoServices.map((s, i) => (
              <ServiceCard key={s.title} {...s} index={i} />
            ))}
          </div>
        </div>

        {/* Video */}
        <div id="video">
          <SectionTitle icon={Video} title="Servicios de Video" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
            {videoServices.map((s, i) => (
              <ServiceCard key={s.title} {...s} index={i} />
            ))}
          </div>
        </div>

        {/* Dron */}
        <SectionTitle icon={PlaneIcon} title="Servicios de Dron" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dronServices.map((s, i) => (
            <ServiceCard key={s.title} {...s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
