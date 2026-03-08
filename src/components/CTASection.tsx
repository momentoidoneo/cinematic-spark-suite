import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Sparkles } from "lucide-react";

const CTASection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section className="py-24 px-6" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="max-w-4xl mx-auto text-center"
      >
        <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6">
          ¿Listo para dar vida a tu proyecto?
        </h2>
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
          Solicita un presupuesto sin compromiso y descubre cómo podemos ayudarte a alcanzar tus objetivos visuales.
        </p>
        <a
          href="#contacto"
          className="inline-flex items-center gap-2 px-10 py-4 rounded-full border-2 border-foreground/20 text-foreground font-semibold text-lg hover:bg-foreground hover:text-background transition-all duration-300"
        >
          <Sparkles className="w-5 h-5" />
          Solicitar Presupuesto Ahora
        </a>
      </motion.div>
    </section>
  );
};

export default CTASection;
