import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Home, ShoppingBag, UtensilsCrossed, Sofa, Building2, Package,
  Shirt, Building, Camera, Megaphone, CalendarDays, Boxes,
  Video, Tv, PartyPopper, Clapperboard, Clock,
  Map, Plane as PlaneIcon, Eye, Image, Boxes as Boxes2, HomeIcon
} from "lucide-react";

import servicioFotoHero from "@/assets/servicio-foto-hero.jpg";
import servicioVideoHero from "@/assets/servicio-video-hero.jpg";
import portfolioDron from "@/assets/portfolio-dron.jpg";

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

const SectionTitle = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <div className="flex items-center gap-3 mb-8">
    <Icon className="w-6 h-6 text-primary" />
    <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground">{title}</h3>
    <div className="h-0.5 w-12 bg-gradient-primary rounded-full" />
  </div>
);

const SectionBanner = ({ image, alt, title, subtitle, reverse = false }: { image: string; alt: string; title: string; subtitle: string; reverse?: boolean }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7 }}
      className={`relative rounded-2xl overflow-hidden mb-12 flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} items-stretch min-h-[280px] md:min-h-[340px]`}
    >
      {/* Image side */}
      <div className="relative w-full md:w-1/2 min-h-[200px] md:min-h-full">
        <img
          src={image}
          alt={alt}
          title=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-card/60 to-transparent" />
      </div>
      {/* Text side */}
      <div className="relative w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12 bg-card/90 border border-border/50">
        <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">{title}</h3>
        <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-md">{subtitle}</p>
      </div>
    </motion.div>
  );
};

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
          <SectionBanner
            image={servicioFotoHero}
            alt="Fotografía profesional"
            title="Fotografía Profesional"
            subtitle="Capturamos cada detalle con la luz perfecta. Fotografía de alta calidad para arquitectura, producto, moda, gastronomía y eventos."
          />
          <SectionTitle icon={Camera} title="Servicios de Fotografía" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
            {photoServices.map((s, i) => (
              <ServiceCard key={s.title} {...s} index={i} />
            ))}
          </div>
        </div>

        {/* Video */}
        <div id="video">
          <SectionBanner
            image={servicioVideoHero}
            alt="Producción de video profesional"
            title="Producción Audiovisual"
            subtitle="Vídeos corporativos, spots publicitarios, cobertura de eventos y contenido para redes sociales con calidad cinematográfica."
            reverse
          />
          <SectionTitle icon={Video} title="Servicios de Video" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
            {videoServices.map((s, i) => (
              <ServiceCard key={s.title} {...s} index={i} />
            ))}
          </div>
        </div>

        {/* Dron */}
        <SectionBanner
          image={portfolioDron}
          alt="Servicios de dron profesional"
          title="Servicios de Dron"
          subtitle="Perspectivas aéreas espectaculares con drones de última generación. Fotografía, vídeo, fotogrametría e inspecciones en altura."
        />
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