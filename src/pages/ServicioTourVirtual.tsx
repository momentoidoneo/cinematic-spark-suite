import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { motion } from "framer-motion";
import { Rotate3D, Building, Home, Store, Hotel, Landmark, CheckCircle2, ArrowRight } from "lucide-react";

const tourServices = [
  { icon: Building, title: "Tour virtual inmobiliario", desc: "Permite a los compradores recorrer propiedades desde cualquier parte del mundo, acelerando la toma de decisiones." },
  { icon: Home, title: "Tour de interiores", desc: "Experiencia inmersiva 360° que muestra cada rincón de un espacio con máximo detalle y realismo." },
  { icon: Store, title: "Tour para comercios", desc: "Permite que tus clientes conozcan tu tienda, restaurante u oficina antes de visitarte presencialmente." },
  { icon: Hotel, title: "Tour para hostelería", desc: "Hoteles, resorts y alojamientos turísticos que se muestran con experiencias interactivas memorables." },
  { icon: Landmark, title: "Tour para eventos y espacios", desc: "Espacios para eventos, salas de conferencias y venues que se presentan de forma inmersiva." },
  { icon: Rotate3D, title: "Modelado 3D con Matterport", desc: "Escaneado profesional con tecnología Matterport para crear gemelos digitales de alta precisión." },
];

const benefits = [
  "Tecnología Matterport de última generación",
  "Compatibilidad con Google Street View",
  "Integración en webs y redes sociales",
  "Medición de espacios incluida",
  "Plano de planta automático",
  "Accesible desde cualquier dispositivo",
];

const stats = [
  { value: "300%", label: "Más interacción que fotos estáticas" },
  { value: "49%", label: "Más tiempo en página web" },
  { value: "95%", label: "De clientes quieren tours virtuales" },
];

const ServicioTourVirtual = () => {
  useEffect(() => {
    document.title = "Tour Virtual 360° y Matterport | Silvio Costa";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Tours virtuales 360° con tecnología Matterport en Marbella. Experiencias inmersivas para inmobiliarias, hostelería, comercios y eventos.");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-primary font-medium text-sm tracking-widest uppercase mb-4">Experiencia Inmersiva</p>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Tours virtuales 360°<br />
              <span className="text-gradient-primary">que venden por ti</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed">
              Recorridos interactivos de alta definición con tecnología Matterport. Permite que tus clientes visiten cualquier espacio desde su dispositivo, en cualquier momento.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl bg-card border border-border/50 p-6 text-center"
              >
                <p className="font-display text-3xl font-bold text-gradient-primary mb-1">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Nuestros servicios de tour virtual</h2>
            <p className="text-muted-foreground">Soluciones inmersivas adaptadas a cada sector.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tourServices.map((s, i) => (
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
                  Tecnología que marca la diferencia
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
                  Haz que tus espacios hablen
                </h3>
                <p className="text-muted-foreground mb-6">
                  Solicita tu tour virtual y ofrece a tus clientes una experiencia inmersiva que convierte visitas en ventas.
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

export default ServicioTourVirtual;
