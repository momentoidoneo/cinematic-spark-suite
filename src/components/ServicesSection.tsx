import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Camera, Video, Plane as PlaneIcon, Eye, Home, Boxes,
} from "lucide-react";

import servicioFotoHero from "@/assets/servicio-foto-hero.jpg";
import bannerVideo from "@/assets/banner-video.jpg";
import bannerDron from "@/assets/banner-dron.jpg";
import matterportStreetview from "@/assets/matterport-streetview.jpg";
import portfolioEventos from "@/assets/portfolio-eventos.jpg";
import portfolioRenders from "@/assets/portfolio-renders.jpg";

type Category = { id: string; name: string; slug: string };
type Subcategory = { id: string; name: string; category_id: string };

const categoryBanners: Record<string, { image: string; title: string; subtitle: string }> = {
  fotografia: {
    image: servicioFotoHero,
    title: "Fotografía Profesional",
    subtitle: "Capturamos cada detalle con la luz perfecta. Fotografía de alta calidad para arquitectura, producto, moda, gastronomía y eventos.",
  },
  video: {
    image: bannerVideo,
    title: "Producción Audiovisual",
    subtitle: "Vídeos corporativos, spots publicitarios, cobertura de eventos y contenido para redes sociales con calidad cinematográfica.",
  },
  dron: {
    image: bannerDron,
    title: "Servicios de Dron",
    subtitle: "Perspectivas aéreas espectaculares con drones de última generación. Fotografía, vídeo, fotogrametría e inspecciones en altura.",
  },
  "tours-virtuales": {
    image: matterportStreetview,
    title: "Tours Virtuales 3D",
    subtitle: "Recorridos inmersivos con tecnología Matterport para que tus clientes exploren cada rincón desde cualquier lugar.",
  },
  eventos: {
    image: portfolioEventos,
    title: "Cobertura de Eventos",
    subtitle: "Cobertura integral con fotografía, vídeo, streaming y sonido profesional para tus eventos más importantes.",
  },
  renders: {
    image: portfolioRenders,
    title: "Renders 3D",
    subtitle: "Visualizaciones fotorrealistas y modelado 3D para arquitectura, interiorismo y producto.",
  },
};

const categoryIcons: Record<string, React.ElementType> = {
  fotografia: Camera,
  video: Video,
  dron: PlaneIcon,
  "tours-virtuales": Eye,
  eventos: Home,
  renders: Boxes,
};

const ServiceCard = ({ name, catSlug, index }: { name: string; catSlug: string; index: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        to={`/portafolio/${catSlug}`}
        className="group rounded-xl bg-card border border-border/50 p-6 hover:border-primary/30 hover:shadow-glow transition-all block h-full"
      >
        <h4 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {name}
        </h4>
        <span className="text-xs text-primary mt-2 inline-block opacity-0 group-hover:opacity-100 transition-opacity">
          Ver portafolio →
        </span>
      </Link>
    </motion.div>
  );
};

const SectionBanner = ({ image, title, subtitle, reverse = false }: { image: string; title: string; subtitle: string; reverse?: boolean }) => {
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
      <div className="relative w-full md:w-1/2 min-h-[200px] md:min-h-full">
        <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-card/60 to-transparent" />
      </div>
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from("portfolio_categories").select("id, name, slug").order("order"),
      supabase.from("portfolio_subcategories").select("id, name, category_id").order("order"),
    ]).then(([catRes, subRes]) => {
      if (catRes.data) setCategories(catRes.data as Category[]);
      if (subRes.data) setSubcategories(subRes.data as Subcategory[]);
    });
  }, []);

  return (
    <section id="servicios" className="pt-12 pb-24 px-6" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Nuestros{" "}
            <span className="text-gradient-primary italic">Servicios</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Especialistas en capturar la mejor imagen para tu negocio, producto o evento.
          </p>
        </motion.div>

        {categories.map((cat, catIndex) => {
          const subs = subcategories.filter(s => s.category_id === cat.id);
          const banner = categoryBanners[cat.slug];
          const Icon = categoryIcons[cat.slug] || Camera;
          const isReverse = catIndex % 2 !== 0;

          return (
            <div key={cat.id} id={cat.slug} className="mb-20 last:mb-0">
              {banner && (
                <SectionBanner
                  image={banner.image}
                  title={banner.title}
                  subtitle={banner.subtitle}
                  reverse={isReverse}
                />
              )}

              <div className="flex items-center gap-3 mb-8">
                <Icon className="w-6 h-6 text-primary" />
                <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground">{cat.name}</h3>
                <div className="h-0.5 w-12 bg-gradient-primary rounded-full" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subs.map((sub, i) => (
                  <ServiceCard key={sub.id} name={sub.name} catSlug={cat.slug} index={i} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ServicesSection;
