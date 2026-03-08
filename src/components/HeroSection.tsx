import { motion } from "framer-motion";
import { Camera, Plane, Globe } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const services = [
{ icon: Camera, label: "FOTOGRAFÍA" },
{ icon: Plane, label: "SERVICIOS DRON" },
{ icon: Globe, label: "TOUR VIRTUAL" },
{ icon: Camera, label: "VIDEO" },
{ icon: Camera, label: "EVENTOS" },
{ icon: Camera, label: "RENDERS 3D" }];


const HeroSection = () => {
  return (
    <section id="inicio" className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="Estudio profesional" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 bg-background/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-tight">
          
          Fotografía y Producción{" "}
          <span className="text-gradient-primary italic">Audiovisual Profesional</span>
        </motion.h1>

        






        

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          
          <a
            href="#contacto"
            className="px-8 py-3.5 rounded-full bg-gradient-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity inline-flex items-center gap-2">Eleva la imagen de tu marca, servicio, empresa o evento a través de fotografía, video y producción audiovisual.


          </a>
          <a
            href="#servicios"
            className="px-8 py-3.5 rounded-full border border-border text-foreground font-semibold text-base hover:bg-secondary transition-colors">
            
            Ver Todos los Servicios
          </a>
        </motion.div>
      </div>

      {/* Service cards */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20 w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {services.map((s, i) =>
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 + i * 0.1 }}
            className="group rounded-xl bg-card/60 border border-border/50 p-6 text-center hover:border-primary/40 hover:shadow-glow transition-all cursor-pointer">
            
              <s.icon className="w-8 h-8 mx-auto text-primary mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                {s.label}
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

};

export default HeroSection;