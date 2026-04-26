import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Camera } from "lucide-react";
import { getOptimizedImageSrcSet, getOptimizedImageUrl } from "@/lib/imageUrl";

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
  grid_row: number | null;
  grid_col: number | null;
};

const PortfolioSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    supabase
      .from("portfolio_categories")
      .select("id, name, slug, cover_image, order, grid_row, grid_col")
      .eq("is_visible", true)
      .order("order")
      .then(({ data }) => {
        if (data) setCategories(data as Category[]);
      });
  }, []);

  // Determine if grid positions are set
  const hasGridPositions = categories.some(c => c.grid_row != null && c.grid_col != null);
  const maxRow = hasGridPositions
    ? categories.reduce((max, c) => Math.max(max, c.grid_row || 0), 0)
    : 0;

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

        {hasGridPositions ? (
          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: "repeat(3, 1fr)",
              gridTemplateRows: `repeat(${maxRow}, 1fr)`,
            }}
          >
            {categories
              .filter(cat => cat.grid_row != null && cat.grid_col != null)
              .map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  style={{
                    gridRow: cat.grid_row!,
                    gridColumn: cat.grid_col!,
                  }}
                >
                  <CategoryCard cat={cat} />
                </motion.div>
              ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <CategoryCard cat={cat} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

function CategoryCard({ cat }: { cat: Category }) {
  const image = cat.cover_image || fallbackImages[cat.slug];

  return (
    <Link
      to={`/portafolio/${cat.slug}`}
      className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer block"
    >
      {image ? (
        <img
          src={getOptimizedImageUrl(image, { width: 720, height: 540, quality: 72 })}
          srcSet={getOptimizedImageSrcSet(image, [360, 540, 720, 960], { quality: 72 })}
          sizes="(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 92vw"
          alt={`Portafolio de ${cat.name} — Silvio Costa Photography`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
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
  );
}

export default PortfolioSection;
