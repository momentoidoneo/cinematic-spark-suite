import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { motion } from "framer-motion";
import {
  Home, ShoppingBag, UtensilsCrossed, Sofa, Building2, Package,
  Shirt, Building, Camera, Megaphone, CalendarDays, Boxes, CheckCircle2, ArrowRight, Star, Users, Zap, Eye
} from "lucide-react";

const services = [
  { icon: Home, title: "Arquitectura e interiores", desc: "Capturamos la esencia y el diseño de cualquier espacio arquitectónico con precisión profesional y composición cuidada. Trabajamos con ópticas de alta gama para obtener líneas rectas y perspectivas impecables." },
  { icon: ShoppingBag, title: "Catálogo y e-commerce", desc: "Imágenes nítidas y atractivas que potencian tus ventas online y destacan cada detalle de tu producto. Fondos neutros, packshots y fotografía lifestyle para tiendas online de alto rendimiento." },
  { icon: UtensilsCrossed, title: "Fotografía gastronómica", desc: "Hacemos que tus platos luzcan irresistibles con iluminación y estilismo profesional. Ideal para cartas, redes sociales, plataformas de delivery y campañas publicitarias de restaurantes." },
  { icon: Sofa, title: "Fotografía de interiores", desc: "Resaltamos la decoración y el ambiente de cualquier interior con perspectivas que enamoran. Capturamos la luz natural y artificial para transmitir la atmósfera única de cada espacio." },
  { icon: Building2, title: "Fotografía de arquitectura", desc: "Perspectivas únicas que destacan la majestuosidad y el carácter de las construcciones. Fachadas, detalles constructivos y vistas panorámicas con equipos especializados." },
  { icon: Package, title: "Fotografía de producto", desc: "Detalles perfectos e iluminación controlada para que tus productos brillen en cualquier plataforma. Desde joyería hasta mobiliario, adaptamos la técnica a cada tipo de producto." },
  { icon: Shirt, title: "Fotografía de moda", desc: "Editoriales y lookbooks con estilo, elegancia y las últimas tendencias visuales. Sesiones en estudio o en exteriores con dirección artística profesional." },
  { icon: Building, title: "Fotografía inmobiliaria", desc: "Imágenes profesionales que aceleran la venta o alquiler de propiedades destacando sus mejores atributos. Fotografía HDR, home staging virtual y planos de distribución." },
  { icon: Camera, title: "Fotografía aérea con dron", desc: "Vistas espectaculares desde el aire para ofrecer una perspectiva diferente e impactante. Ideal para urbanizaciones, fincas, obras y proyectos de gran envergadura." },
  { icon: Megaphone, title: "Publicidad", desc: "Imágenes de alto impacto diseñadas para campañas publicitarias que generan resultados. Conceptualización, producción y postproducción para medios impresos y digitales." },
  { icon: CalendarDays, title: "Eventos", desc: "Cobertura completa y profesional de tus eventos más importantes, sin perder ningún momento. Desde conferencias corporativas hasta bodas y galas sociales." },
  { icon: Boxes, title: "Renders 3D", desc: "Creación de imágenes fotorrealistas y modelado 3D para arquitectura, interiorismo y producto. Visualización de proyectos antes de su construcción con calidad cinematográfica." },
];

const benefits = [
  "Equipo profesional de última generación",
  "Edición y retoque incluido",
  "Entrega en alta resolución",
  "Adaptación a tu identidad de marca",
  "Experiencia en múltiples sectores",
  "Resultados en plazos garantizados",
];

const processSteps = [
  { icon: Users, title: "Briefing inicial", desc: "Analizamos tus necesidades, objetivos y el estilo visual que mejor representa tu marca. Definimos juntos el alcance del proyecto." },
  { icon: Eye, title: "Planificación y producción", desc: "Preparamos la sesión con detalle: localización, iluminación, atrezo y dirección artística. Todo queda coordinado antes del día de la sesión." },
  { icon: Camera, title: "Sesión fotográfica", desc: "Realizamos la captura con equipos profesionales, cuidando cada encuadre, la composición y la iluminación para obtener resultados excepcionales." },
  { icon: Zap, title: "Postproducción y entrega", desc: "Selección, retoque profesional y optimización de las imágenes. Entrega en los formatos y resoluciones que necesites, listas para usar." },
];

const ServicioFotografia = () => {
  useEffect(() => {
    document.title = "Servicios de Fotografía Profesional | Silvio Costa";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Servicios de fotografía profesional en Marbella: arquitectura, producto, moda, gastronomía, eventos y más. Más de 10 especialidades. Imágenes que venden.");
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
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed mb-4">
              Más de 10 especialidades fotográficas para capturar la mejor imagen de tu marca, producto o proyecto. Calidad cinematográfica al servicio de tus objetivos comerciales.
            </p>
            <p className="text-muted-foreground text-base max-w-2xl leading-relaxed">
              En un mundo donde la imagen lo es todo, contar con fotografías profesionales marca la diferencia entre pasar desapercibido y destacar. Nuestro equipo combina creatividad, técnica y una profunda comprensión del mercado para crear imágenes que no solo se ven bien, sino que generan impacto real en tu audiencia y tus ventas.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Intro descriptiva */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-card border border-border/50 p-8 md:p-10"
          >
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-6 h-6 text-primary" />
              <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">¿Por qué invertir en fotografía profesional?</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Las estadísticas son claras: los contenidos con imágenes profesionales reciben hasta un <strong className="text-foreground">94% más de visitas</strong> que aquellos con imágenes genéricas o de baja calidad. En el sector inmobiliario, las propiedades con fotografía profesional se venden un <strong className="text-foreground">32% más rápido</strong>. En e-commerce, las imágenes de producto de calidad pueden incrementar la tasa de conversión hasta en un <strong className="text-foreground">40%</strong>.
              </p>
              <p>
                No se trata solo de hacer fotos bonitas. Se trata de comunicar el valor de lo que ofreces, generar confianza en tu público y diferenciarte de la competencia. Cada imagen que producimos está pensada para cumplir un objetivo comercial concreto, ya sea vender una propiedad, lanzar un producto o posicionar tu marca.
              </p>
              <p>
                Trabajamos en la Costa del Sol y toda España, adaptándonos a las particularidades de cada sector y cada cliente. Desde pequeños negocios locales hasta grandes promotoras inmobiliarias, nuestro compromiso con la excelencia visual es siempre el mismo.
              </p>
            </div>
          </motion.div>
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
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Nuestras especialidades fotográficas</h2>
            <p className="text-muted-foreground">Soluciones visuales profesionales para cada necesidad y sector.</p>
          </motion.div>
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

      {/* Proceso de trabajo */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Nuestro proceso de trabajo</h2>
            <p className="text-muted-foreground">Un flujo profesional pensado para que obtengas los mejores resultados con total tranquilidad.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {processSteps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 rounded-xl bg-card border border-border/50 p-6"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-primary font-semibold mb-1">Paso {i + 1}</p>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
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
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">Sectores en los que trabajamos</h2>
            <div className="grid md:grid-cols-2 gap-6 text-muted-foreground leading-relaxed">
              <div className="space-y-4">
                <p>
                  <strong className="text-foreground">Inmobiliario y construcción:</strong> Colaboramos con agencias, promotoras y arquitectos para presentar propiedades y proyectos con el máximo atractivo visual. Home staging, fotografía HDR y tomas aéreas para maximizar el impacto de cada inmueble.
                </p>
                <p>
                  <strong className="text-foreground">Hostelería y gastronomía:</strong> Restaurantes, hoteles y resorts confían en nuestras imágenes para atraer huéspedes y comensales. Fotografía de platos, ambientes y experiencias que despiertan el deseo de visitar.
                </p>
                <p>
                  <strong className="text-foreground">Moda y retail:</strong> Lookbooks, catálogos de temporada y contenido para redes sociales con estilo editorial. Cada sesión se planifica para transmitir la personalidad de la marca.
                </p>
              </div>
              <div className="space-y-4">
                <p>
                  <strong className="text-foreground">E-commerce y producto:</strong> Desde packshots sobre fondo blanco hasta fotografía lifestyle, producimos imágenes que aumentan la tasa de conversión de tu tienda online y reducen las devoluciones.
                </p>
                <p>
                  <strong className="text-foreground">Eventos corporativos y sociales:</strong> Conferencias, inauguraciones, galas, bodas y celebraciones. Cobertura discreta y profesional que captura la esencia de cada momento.
                </p>
                <p>
                  <strong className="text-foreground">Publicidad y marketing:</strong> Campañas para medios impresos y digitales con dirección artística, conceptualización y postproducción de alto nivel. Imágenes que comunican tu mensaje con fuerza.
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
                  Solicita un presupuesto sin compromiso y descubre cómo podemos mejorar la imagen de tu proyecto. Te respondemos en menos de 24 horas con una propuesta personalizada.
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
