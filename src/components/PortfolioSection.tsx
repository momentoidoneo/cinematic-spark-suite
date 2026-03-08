import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import portfolioFoto from "@/assets/portfolio-foto.jpg";
import portfolioDron from "@/assets/portfolio-dron.jpg";
import portfolioTour from "@/assets/portfolio-tour.jpg";
import portfolioVideo from "@/assets/portfolio-video.jpg";
import portfolioEventos from "@/assets/portfolio-eventos.jpg";
import portfolioRenders from "@/assets/portfolio-renders.jpg";

const categories = [
  { title: "Fotografía", slug: "fotografia", image: portfolioFoto },
  { title: "Dron", slug: "dron", image: portfolioDron },
  { title: "Tours Virtuales", slug: "tours-virtuales", image: portfolioTour },
  { title: "Video", slug: "video", image: portfolioVideo },
  { title: "Eventos", slug: "eventos", image: portfolioEventos },
  { title: "Renders", slug: "renders", image: portfolioRenders },
];

const PortfolioSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

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
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <Link
                to={`/portafolio/${cat.slug}`}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer block"
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="font-display text-2xl font-bold text-foreground">{cat.title}</h3>
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
