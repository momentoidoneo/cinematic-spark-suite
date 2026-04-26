import { motion } from "framer-motion";
import { Camera, Plane, Globe, Video, PartyPopper, Boxes, Clock, MapPin, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import logo from "@/assets/logo.png";

const services = [
  { icon: Camera, label: "FOTOGRAFÍA", href: "/servicios/fotografia" },
  { icon: Plane, label: "SERVICIOS DRON", href: "/servicios/video-dron" },
  { icon: Globe, label: "TOUR VIRTUAL", href: "/servicios/tour-virtual" },
  { icon: Video, label: "VIDEO", href: "/servicios/video-dron" },
  { icon: PartyPopper, label: "EVENTOS", href: "/servicios/eventos" },
  { icon: Boxes, label: "RENDERS 3D", href: "/servicios/renders" },
];

const trustSignals = [
  { icon: Clock, label: "Respuesta en 24h" },
  { icon: MapPin, label: "España y Portugal" },
  { icon: ShieldCheck, label: "+500 proyectos realizados" },
];

const HeroSection = () => {
  return (
    <section id="inicio" className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="Estudio de fotografía y producción audiovisual profesional Silvio Costa" className="w-full h-full object-cover" loading="eager" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 bg-background/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <img src={logo} alt="Silvio Costa Photography — Logotipo del estudio de fotografía profesional" className="h-28 md:h-36 lg:h-44 w-auto mx-auto drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-tight"
        >
          Fotografía, vídeo y tours 360{" "}
          <span className="text-gradient-primary italic">para vender mejor tus espacios</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground"
        >
          Producción visual profesional para inmobiliarias, arquitectura, hoteles, restaurantes, eventos y marcas que necesitan generar confianza antes de la primera llamada.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-6 flex flex-wrap justify-center gap-3"
        >
          {trustSignals.map((signal) => (
            <div
              key={signal.label}
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/45 px-4 py-2 text-sm text-foreground/85 backdrop-blur-sm"
            >
              <signal.icon className="h-4 w-4 text-primary" />
              <span>{signal.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-8 flex flex-col items-center gap-4"
        >
          <a
            href="#contacto"
            className="px-8 py-3.5 rounded-full bg-gradient-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity"
          >
            Pedir presupuesto en 24h
          </a>
          <a
            href="#servicios"
            className="px-8 py-3.5 rounded-full border border-border text-foreground font-semibold text-base hover:bg-secondary transition-colors"
          >
            Ver Todos los Servicios
          </a>
        </motion.div>
      </div>

      {/* Service cards */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20 w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {services.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 + i * 0.1 }}
            >
              <Link
                to={s.href}
                className="group rounded-xl bg-card/60 border border-border/50 p-6 text-center hover:border-primary/40 hover:shadow-glow transition-all cursor-pointer block"
              >
                <s.icon className="w-8 h-8 mx-auto text-primary mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                  {s.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
