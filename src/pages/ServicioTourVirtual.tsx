import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { motion } from "framer-motion";
import {
  Rotate3D, Building, Home, Store, Hotel, Landmark, CheckCircle2, ArrowRight,
  Scan, Ruler, MapPin, Smartphone, Globe, Layers, Box, FileText
} from "lucide-react";

const tourServices = [
  { icon: Building, title: "Tour virtual inmobiliario", desc: "Permite a los compradores recorrer propiedades desde cualquier parte del mundo, acelerando la toma de decisiones. Las propiedades con tour virtual reciben hasta un 49% más de consultas cualificadas." },
  { icon: Home, title: "Tour de interiores", desc: "Experiencia inmersiva 360° que muestra cada rincón de un espacio con máximo detalle y realismo. Navegación fluida entre estancias con puntos de interés personalizados." },
  { icon: Store, title: "Tour para comercios", desc: "Permite que tus clientes conozcan tu tienda, restaurante u oficina antes de visitarte presencialmente. Integrable directamente en Google Maps y tu ficha de Google Business." },
  { icon: Hotel, title: "Tour para hostelería", desc: "Hoteles, resorts y alojamientos turísticos que se muestran con experiencias interactivas memorables. Los huéspedes pueden explorar habitaciones, zonas comunes y servicios antes de reservar." },
  { icon: Landmark, title: "Tour para eventos y espacios", desc: "Espacios para eventos, salas de conferencias y venues que se presentan de forma inmersiva. Los organizadores pueden evaluar el espacio sin desplazarse, agilizando la contratación." },
  { icon: Rotate3D, title: "Modelado 3D con Matterport", desc: "Escaneado profesional con tecnología Matterport Pro3 para crear gemelos digitales de alta precisión. Resolución 8K, medición automática de espacios y exportación BIM." },
];

const benefits = [
  "Tecnología Matterport Pro3 de última generación",
  "Compatibilidad con Google Street View",
  "Integración en webs, portales y redes sociales",
  "Medición de espacios con precisión de ±1%",
  "Plano de planta automático en 2D y 3D",
  "Accesible desde cualquier dispositivo",
  "Experiencia de realidad virtual compatible con Meta Quest",
  "Etiquetas interactivas y recorridos guiados",
];

const stats = [
  { value: "300%", label: "Más interacción que fotos estáticas" },
  { value: "49%", label: "Más tiempo en página web" },
  { value: "95%", label: "De clientes quieren tours virtuales" },
  { value: "32%", label: "Más rápido se venden las propiedades" },
];

const matterportFeatures = [
  { icon: Scan, title: "Gemelo digital de alta fidelidad", desc: "Matterport crea una réplica virtual exacta de cualquier espacio físico. Utilizando una combinación de fotogrametría, escaneo láser y software de IA avanzado, transforma las capturas en un modelo tridimensional navegable con resolución 8K." },
  { icon: Ruler, title: "Medición precisa de espacios", desc: "Mide cualquier elemento del espacio directamente desde el modelo 3D con precisión de ±1%. Comprueba si los muebles o equipamiento caben, calcula superficies y planifica reformas sin necesidad de visitas presenciales." },
  { icon: MapPin, title: "Integración con Google Street View", desc: "Publica tu tour virtual directamente en Google Maps y tu ficha de Google Business Profile. Los usuarios pueden explorar tu espacio desde el propio buscador, mejorando tu visibilidad local y generando más visitas cualificadas." },
  { icon: FileText, title: "Planos de planta automáticos", desc: "Obtén planos de planta en 2D listos para usar a partir del escaneo 3D. Disponibles en formatos PNG, PDF y SVG en apenas 48 horas. Ideales para fichas inmobiliarias, proyectos de reforma y documentación técnica." },
  { icon: Box, title: "Exportación BIM y nubes de puntos", desc: "Exporta nubes de puntos, archivos OBJ y e57 compatibles con Autodesk Revit, AutoCAD, ReCap y 3ds Max. Perfecto para arquitectos, ingenieros y profesionales de la construcción que necesitan datos precisos del estado actual del edificio." },
  { icon: Layers, title: "Etiquetas y recorridos guiados", desc: "Añade etiquetas interactivas con texto, imágenes o vídeos para destacar puntos de interés. Crea recorridos guiados con narrativa para ofrecer una experiencia personalizada a cada tipo de visitante." },
  { icon: Smartphone, title: "Acceso universal y multiplataforma", desc: "Los tours son accesibles desde cualquier navegador, en ordenador, tablet o smartphone, sin necesidad de instalar aplicaciones. También compatibles con visores de realidad virtual Meta Quest para una inmersión total." },
  { icon: Globe, title: "Property Intelligence con IA", desc: "La inteligencia artificial de Matterport analiza propiedades y carteras completas para generar información estratégica automatizada. Desde evaluación del estado de la propiedad hasta análisis de accesibilidad y cumplimiento normativo." },
];

const ServicioTourVirtual = () => {
  useEffect(() => {
    document.title = "Tour Virtual 360° y Matterport | Silvio Costa";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Tours virtuales 360° con tecnología Matterport Pro3 en Marbella. Gemelos digitales, planos de planta, medición de espacios y Google Street View para inmobiliarias, hostelería y comercios.");
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
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed mb-4">
              Recorridos interactivos de alta definición con tecnología Matterport. Permite que tus clientes visiten cualquier espacio desde su dispositivo, en cualquier momento.
            </p>
            <p className="text-muted-foreground text-base max-w-2xl leading-relaxed">
              Un gemelo digital es una réplica virtual exacta de un espacio físico que se puede navegar en tres dimensiones. Matterport combina fotogrametría, escaneo láser y algoritmos de inteligencia artificial para transformar capturas del mundo real en modelos 3D interactivos de resolución 8K, ofreciendo una experiencia inmersiva que supera con creces la fotografía tradicional.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 text-center"
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Resultados que hablan por sí solos</h2>
            <p className="text-muted-foreground">Los datos demuestran el impacto de los tours virtuales en la experiencia del cliente y las ventas.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl bg-card border border-border/50 p-5 text-center"
              >
                <p className="font-display text-2xl md:text-3xl font-bold text-gradient-primary mb-1">{s.value}</p>
                <p className="text-xs md:text-sm text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ¿Qué es Matterport? */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-card border border-border/50 p-8 md:p-10"
          >
            <div className="flex items-center gap-3 mb-4">
              <Rotate3D className="w-6 h-6 text-primary" />
              <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">¿Qué es Matterport y cómo funciona?</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Matterport</strong> es la plataforma líder mundial en la creación de gemelos digitales 3D. Su tecnología permite escanear cualquier espacio físico —desde un pequeño apartamento hasta un edificio completo— y convertirlo en un modelo tridimensional interactivo de alta fidelidad que se puede explorar desde cualquier dispositivo.
              </p>
              <p>
                El proceso comienza con la captura del espacio utilizando la cámara <strong className="text-foreground">Matterport Pro3</strong>, que combina sensores LiDAR de alta precisión con fotografía HDR de 8K. La cámara escanea el entorno desde múltiples posiciones, capturando millones de puntos de datos que se procesan mediante algoritmos de inteligencia artificial para generar un modelo 3D preciso y visualmente impactante.
              </p>
              <p>
                El resultado es un <strong className="text-foreground">gemelo digital</strong> completo: un recorrido virtual navegable con vista "casa de muñecas" (vista cenital del modelo completo), planos de planta en 2D, herramientas de medición integradas, etiquetas interactivas y la posibilidad de experimentar el espacio en realidad virtual. Todo accesible a través de un simple enlace, sin instalaciones ni plugins.
              </p>
              <p>
                Los gemelos digitales de Matterport no son simples fotos 360°. Son modelos tridimensionales reales que contienen información dimensional precisa, permitiendo medir distancias, calcular superficies, generar planos arquitectónicos y exportar datos compatibles con software BIM como Autodesk Revit y AutoCAD.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Funcionalidades Matterport */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Funcionalidades de la plataforma Matterport</h2>
            <p className="text-muted-foreground">Herramientas avanzadas que van mucho más allá de un simple tour virtual.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {matterportFeatures.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group rounded-xl bg-card border border-border/50 p-5 hover:border-primary/30 hover:shadow-glow transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-base font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
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
            <p className="text-muted-foreground">Soluciones inmersivas adaptadas a cada sector y necesidad.</p>
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

      {/* Sectores */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-card border border-border/50 p-8 md:p-10"
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">¿Quién se beneficia de los tours virtuales?</h2>
            <div className="grid md:grid-cols-2 gap-6 text-muted-foreground leading-relaxed">
              <div className="space-y-4">
                <p>
                  <strong className="text-foreground">Sector inmobiliario:</strong> Las agencias inmobiliarias y promotoras que integran tours virtuales Matterport reducen las visitas físicas innecesarias y atraen compradores internacionales que pueden explorar las propiedades desde cualquier parte del mundo. Las propiedades con tour virtual se venden un 32% más rápido.
                </p>
                <p>
                  <strong className="text-foreground">Hostelería y turismo:</strong> Hoteles, resorts, casas rurales y restaurantes que muestran sus instalaciones con tours inmersivos generan mayor confianza en la reserva. Los huéspedes pueden ver exactamente lo que van a encontrar, reduciendo las expectativas no cumplidas y mejorando las valoraciones.
                </p>
                <p>
                  <strong className="text-foreground">Comercio y retail:</strong> Tiendas, showrooms y centros comerciales que ofrecen una experiencia de visita virtual permiten a los clientes familiarizarse con el espacio antes de acudir, aumentando la probabilidad de visita y compra presencial.
                </p>
              </div>
              <div className="space-y-4">
                <p>
                  <strong className="text-foreground">Arquitectura y construcción:</strong> Arquitectos, ingenieros y constructores utilizan los gemelos digitales como documentación del estado actual de edificios, para planificación de reformas y como herramienta de comunicación con clientes. La exportación BIM permite integrar los datos directamente en software profesional.
                </p>
                <p>
                  <strong className="text-foreground">Cultura y educación:</strong> Museos, galerías, universidades y espacios culturales democratizan el acceso a su patrimonio permitiendo visitas virtuales desde cualquier lugar del mundo. Una herramienta poderosa para educación a distancia y difusión cultural.
                </p>
                <p>
                  <strong className="text-foreground">Eventos y venues:</strong> Salones de eventos, centros de convenciones y espacios singulares facilitan la contratación mostrando sus instalaciones de forma inmersiva. Los organizadores pueden evaluar y comparar espacios sin desplazarse.
                </p>
              </div>
            </div>
          </motion.div>
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
                  Solicita tu tour virtual y ofrece a tus clientes una experiencia inmersiva que convierte visitas en ventas. Te enviamos presupuesto personalizado en menos de 24 horas.
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
