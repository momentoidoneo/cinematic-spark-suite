import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Globe, Monitor, Zap, MapPin, Smartphone, Euro } from "lucide-react";

const features = [
  { icon: Monitor, title: "Calidad 8K HD", desc: "Resolución ultra alta para apreciar cada detalle del espacio con total nitidez." },
  { icon: Zap, title: "Movimientos fluidos", desc: "Navegación inmersiva y sin saltos, ofreciendo una experiencia realista." },
  { icon: Smartphone, title: "Carga rápida", desc: "Optimizado para visualizarse instantáneamente en cualquier dispositivo." },
  { icon: Globe, title: "Personalización AR", desc: "Integración de etiquetas, vídeos y enlaces interactivos dentro del tour." },
];

const MatterportSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section id="tour" className="py-24 px-6" ref={ref}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Tecnología{" "}
            <span className="text-gradient-accent italic">Matterport</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Utilizamos la tecnología líder en el mercado para crear gemelos digitales exactos de cualquier espacio físico. 
            Ideal para inmobiliarias, hoteles, restaurantes, comercios y espacios de eventos.
          </p>
        </motion.div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="rounded-xl bg-card border border-border/50 p-6 text-center hover:border-accent/30 transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <f.icon className="w-5 h-5 text-accent" />
              </div>
              <h4 className="font-display font-semibold text-foreground mb-2">{f.title}</h4>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Google Street View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="rounded-2xl bg-secondary/50 border border-border/50 p-10 text-center mb-16"
        >
          <MapPin className="w-10 h-10 text-accent mx-auto mb-4" />
          <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
            Compatibilidad con Google Street View
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Aumenta tu visibilidad online publicando tu tour virtual directamente en Google Maps y Google My Business. 
            Mejora tu posicionamiento SEO local y permite que los clientes te encuentren y visiten virtualmente desde el buscador más utilizado del mundo.
          </p>
        </motion.div>

        {/* Pricing CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <Euro className="w-10 h-10 text-accent mx-auto mb-4" />
          <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
            Producción de Tours 3D
          </h3>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Ofrecemos presupuestos personalizados basados en los metros cuadrados del espacio y los requerimientos específicos de personalización.
          </p>
          <a
            href="#contacto"
            className="inline-block px-8 py-3 rounded-full bg-gradient-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            Solicitar Presupuesto
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default MatterportSection;
