import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Camera } from "lucide-react";

// Static fallbacks
import portfolioFoto from "@/assets/portfolio-foto.jpg";
import portfolioDron from "@/assets/portfolio-dron.jpg";
import portfolioTour from "@/assets/portfolio-tour.jpg";
import portfolioVideo from "@/assets/portfolio-video.jpg";
import portfolioEventos from "@/assets/portfolio-eventos.jpg";
import portfolioRenders from "@/assets/portfolio-renders.jpg";

const fallbackImages: Record<string, string> = {
  fotografia: portfolioFoto,
  dron: portfolioDron,
  "tours-virtuales": portfolioTour,
  video: portfolioVideo,
  eventos: portfolioEventos,
  renders: portfolioRenders,
};

type Category = {
  id: string;
  name: string;
  slug: string;
  cover_image: string | null;
  order: number;
};

const PortfolioSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    supabase
      .from("portfolio_categories")
      .select("id, name, slug, cover_image, order")
      .order("order")
      .then(({ data }) => {
        if (data) setCategories(data);
      });
  }, []);

  return (
    <section id="portafolio" className="py-24 px-6" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Nuestro{" "}
            <span className="text-gradient-accent italic">Portafolio</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Selecciona una categoría para explorar nuestros proyectos y descubrir la calidad de nuestro trabajo audiovisual.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <Link
                to={`/portafolio/${cat.slug}`}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer block"
              >
                {(cat.cover_image || fallbackImages[cat.slug]) ? (
                  <img
                    src={cat.cover_image || fallbackImages[cat.slug]}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center">
                    <Camera className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="font-display text-2xl font-bold text-foreground">{cat.name}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
