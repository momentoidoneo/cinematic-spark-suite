import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { motion } from "framer-motion";
import {
  Home, ShoppingBag, UtensilsCrossed, Sofa, Building2, Package,
  Shirt, Building, Camera, Megaphone, CalendarDays, Boxes, CheckCircle2, ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  { icon: Home, title: "Arquitectura e interiores", desc: "Capturamos la esencia y el diseño de cualquier espacio arquitectónico con precisión profesional y composición cuidada." },
  { icon: ShoppingBag, title: "Catálogo y e-commerce", desc: "Imágenes nítidas y atractivas que potencian tus ventas online y destacan cada detalle de tu producto." },
  { icon: UtensilsCrossed, title: "Fotografía gastronómica", desc: "Hacemos que tus platos luzcan irresistibles con iluminación y estilismo profesional." },
  { icon: Sofa, title: "Fotografía de interiores", desc: "Resaltamos la decoración y el ambiente de cualquier interior con perspectivas que enamoran." },
  { icon: Building2, title: "Fotografía de arquitectura", desc: "Perspectivas únicas que destacan la majestuosidad y el carácter de las construcciones." },
  { icon: Package, title: "Fotografía de producto", desc: "Detalles perfectos e iluminación controlada para que tus productos brillen en cualquier plataforma." },
  { icon: Shirt, title: "Fotografía de moda", desc: "Editoriales y lookbooks con estilo, elegancia y las últimas tendencias visuales." },
  { icon: Building, title: "Fotografía inmobiliaria", desc: "Imágenes profesionales que aceleran la venta o alquiler de propiedades destacando sus mejores atributos." },
  { icon: Camera, title: "Fotografía aérea con dron", desc: "Vistas espectaculares desde el aire para ofrecer una perspectiva diferente e impactante." },
  { icon: Megaphone, title: "Publicidad", desc: "Imágenes de alto impacto diseñadas para campañas publicitarias que generan resultados." },
  { icon: CalendarDays, title: "Eventos", desc: "Cobertura completa y profesional de tus eventos más importantes, sin perder ningún momento." },
  { icon: Boxes, title: "Renders 3D", desc: "Creación de imágenes fotorrealistas y modelado 3D para arquitectura, interiorismo y producto." },
];

const benefits = [
  "Equipo profesional de última generación",
  "Edición y retoque incluido",
  "Entrega en alta resolución",
  "Adaptación a tu identidad de marca",
  "Experiencia en múltiples sectores",
  "Resultados en plazos garantizados",
];

const ServicioFotografia = () => {
  useEffect(() => {
    document.title = "Servicios de Fotografía Profesional | Silvio Costa";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Servicios de fotografía profesional en Marbella: arquitectura, producto, moda, gastronomía, eventos y más. Imágenes que venden.");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-primary font-medium text-sm tracking-widest uppercase mb-4">Servicios Profesionales</p>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Fotografía profesional<br />
              <span className="text-gradient-primary">que impulsa tu negocio</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed">
              Más de 10 especialidades fotográficas para capturar la mejor imagen de tu marca, producto o proyecto. Calidad cinematográfica al servicio de tus objetivos comerciales.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="group rounded-xl bg-card border border-border/50 p-6 hover:border-primary/30 hover:shadow-glow transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits + CTA */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-card border border-border/50 p-8 md:p-12"
          >
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
                  ¿Por qué elegir nuestros servicios?
                </h2>
                <ul className="space-y-3">
                  {benefits.map((b) => (
                    <li key={b} className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-center md:text-left">
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  ¿Listo para dar el siguiente paso?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Solicita un presupuesto sin compromiso y descubre cómo podemos mejorar la imagen de tu proyecto.
                </p>
                <a
                  href="/#contacto"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Solicitar Presupuesto <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default ServicioFotografia;
