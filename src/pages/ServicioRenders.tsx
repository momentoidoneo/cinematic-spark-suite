import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import FloatingCTA from "@/components/FloatingCTA";
import { motion } from "framer-motion";
import SEOHead, { breadcrumbSchema, faqPageSchema, getSiteUrl } from "@/components/SEOHead";
import {
  Boxes, Building, Sofa, Package, Layers, Eye, Paintbrush, Clapperboard,
  CheckCircle2, ArrowRight, Star, Lightbulb, Image
} from "lucide-react";
import portfolioRenders from "@/assets/portfolio-renders.jpg";

const rendersServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${getSiteUrl()}/servicios/renders#service`,
  name: "Renders 3D y Visualización Arquitectónica",
  description: "Renders fotorrealistas, infografías 3D y visualización arquitectónica para proyectos inmobiliarios, interiorismo y producto en España y Portugal.",
  provider: { "@id": `${getSiteUrl()}/#business` },
  areaServed: [
    { "@type": "Country", name: "España" },
    { "@type": "Country", name: "Portugal" },
  ],
  serviceType: "Renders 3D y visualización",
  url: `${getSiteUrl()}/servicios/renders`,
};

const services = [
  { icon: Building, title: "Renders de arquitectura", desc: "Visualizaciones fotorrealistas de edificios, fachadas y urbanizaciones antes de su construcción. Exteriores con paisajismo, iluminación natural y ambientación estacional." },
  { icon: Sofa, title: "Renders de interiores", desc: "Infografías 3D de interiores con materiales, mobiliario y decoración hiperrealistas. Ideales para proyectos de reforma, home staging virtual y presentaciones comerciales." },
  { icon: Package, title: "Renders de producto", desc: "Imágenes 3D fotorrealistas de productos para catálogos, e-commerce y campañas publicitarias. Control total de ángulos, iluminación y acabados." },
  { icon: Layers, title: "Planos 3D y plantas", desc: "Planos de distribución en 3D con mobiliario y cotas. Herramienta clave para inmobiliarias, arquitectos y promotoras que necesitan comunicar espacios de forma clara." },
  { icon: Clapperboard, title: "Animaciones 3D y recorridos", desc: "Vídeos animados que recorren virtualmente un espacio o muestran un producto desde todos los ángulos. Perfectos para presentaciones comerciales y redes sociales." },
  { icon: Paintbrush, title: "Home staging virtual", desc: "Transformación digital de espacios vacíos: añadimos mobiliario, decoración e iluminación virtual para que las propiedades luzcan habitadas y atractivas." },
];

const useCases = [
  { icon: Building, title: "Promociones inmobiliarias", desc: "Vende sobre plano con renders que muestran cómo será el resultado final. Los compradores visualizan su futura vivienda antes de que exista." },
  { icon: Sofa, title: "Interiorismo y decoración", desc: "Presenta propuestas de diseño a tus clientes con renders que muestran exactamente cómo quedará cada espacio tras la reforma." },
  { icon: Lightbulb, title: "Concursos de arquitectura", desc: "Impresiona al jurado con visualizaciones cinematográficas que dan vida a tu proyecto y destacan sobre la competencia." },
  { icon: Image, title: "Marketing y publicidad", desc: "Imágenes 3D de impacto para campañas publicitarias, vallas, catálogos y redes sociales sin necesidad de producción fotográfica." },
];

const benefits = [
  "Calidad fotorrealista cinematográfica",
  "Iluminación y materiales hiperrealistas",
  "Revisiones incluidas hasta tu aprobación",
  "Entrega en alta resolución (hasta 8K)",
  "Compatible con planos AutoCAD, Revit y SketchUp",
  "Integración con tours virtuales Matterport",
];

const faqs = [
  { question: "¿Qué necesitáis para crear un render 3D?", answer: "Necesitamos los planos del proyecto (AutoCAD, Revit, SketchUp o PDF), referencias de materiales y acabados, y una descripción del estilo deseado. Con eso creamos una propuesta inicial que se refina con tus comentarios." },
  { question: "¿Cuánto cuesta un render 3D?", answer: "El precio varía según la complejidad del espacio, el nivel de detalle y el número de vistas. Ofrecemos presupuestos personalizados sin compromiso. Contacta con nosotros para una propuesta detallada." },
  { question: "¿Cuánto tarda la entrega de un render?", answer: "La entrega estándar es de 5-7 días laborables por vista, incluyendo 2 rondas de revisiones. Para proyectos urgentes ofrecemos servicio express con entregas en 48-72h." },
  { question: "¿Hacéis animaciones 3D y recorridos virtuales?", answer: "Sí, creamos animaciones 3D con recorridos virtuales por interiores y exteriores. Son ideales para presentaciones comerciales de promotoras inmobiliarias y proyectos de arquitectura." },
  { question: "¿Se pueden integrar los renders con tours virtuales?", answer: "Sí, podemos crear tours virtuales navegables a partir de renders 3D, permitiendo a los usuarios explorar espacios que aún no están construidos como si fueran reales." },
];

const ServicioRenders = () => {
  const siteUrl = getSiteUrl();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Renders 3D y Visualización Arquitectónica en España | Silvio Costa"
        description="Renders fotorrealistas, infografías 3D, animaciones y home staging virtual para arquitectura, inmobiliaria e interiorismo. Calidad cinematográfica en toda España y Portugal."
        canonical={`${siteUrl}/servicios/renders`}
        jsonLd={[
          rendersServiceSchema,
          breadcrumbSchema([
            { name: "Inicio", url: siteUrl },
            { name: "Servicios", url: `${siteUrl}/#servicios` },
            { name: "Renders 3D", url: `${siteUrl}/servicios/renders` },
          ]),
          faqPageSchema(faqs),
        ]}
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="max-w-6xl mx-auto relative z-10 grid md:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-primary font-medium text-sm tracking-widest uppercase mb-4">Visualización 3D</p>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Renders 3D que<br />
              <span className="text-gradient-primary">venden antes de construir</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-4">
              Visualizaciones fotorrealistas que dan vida a proyectos de arquitectura, interiorismo y producto antes de que existan.
            </p>
            <p className="text-muted-foreground text-base leading-relaxed">
              Cada render es una pieza de comunicación visual diseñada para emocionar, convencer y vender.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden md:block"
          >
            <img
              src={portfolioRenders}
              alt="Render 3D fotorrealista de arquitectura interior con iluminación cinematográfica"
              className="rounded-2xl shadow-2xl w-full h-auto object-cover aspect-[16/10]"
              loading="eager"
            />
          </motion.div>
        </div>
      </section>

      {/* Inline CTA */}
      <section className="px-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-card border border-primary/20 p-6 md:p-8"
          >
            <div>
              <h2 className="font-display text-lg md:text-xl font-bold text-foreground mb-1">¿Necesitas un render para tu proyecto?</h2>
              <p className="text-sm text-muted-foreground">Envíanos los planos y te hacemos una propuesta en 24h.</p>
            </div>
            <a
              href="/#contacto"
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-full bg-gradient-primary text-primary-foreground hover:shadow-glow hover:scale-105 transition-all"
            >
              Solicitar Presupuesto <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Servicios */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Nuestros servicios de visualización 3D</h2>
            <p className="text-muted-foreground">Soluciones de renderizado para cada necesidad y sector.</p>
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

      {/* Casos de uso */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">¿Para qué se usan los renders 3D?</h2>
            <p className="text-muted-foreground">Sectores y aplicaciones donde la visualización 3D marca la diferencia.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {useCases.map((u, i) => (
              <motion.div
                key={u.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 rounded-xl bg-card border border-border/50 p-6"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <u.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-1">{u.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{u.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Proceso */}
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
              <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">Nuestro proceso de trabajo</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">1. Recepción de planos:</strong> Recibimos tus planos en AutoCAD, Revit, SketchUp o PDF junto con las referencias de estilo y materiales deseados. Analizamos el proyecto y proponemos los mejores ángulos y encuadres.
              </p>
              <p>
                <strong className="text-foreground">2. Modelado y texturizado:</strong> Creamos el modelo 3D con detalle milimétrico, aplicando materiales fotorrealistas, mobiliario y elementos decorativos. Cada superficie, reflejo e imperfección se cuida para lograr el máximo realismo.
              </p>
              <p>
                <strong className="text-foreground">3. Iluminación y renderizado:</strong> Configuramos la iluminación (natural, artificial o mixta) y renderizamos en alta resolución. El resultado son imágenes indistinguibles de una fotografía real.
              </p>
              <p>
                <strong className="text-foreground">4. Revisión y entrega:</strong> Presentamos el resultado para tu aprobación con 2 rondas de revisiones incluidas. Entregamos en los formatos y resoluciones que necesites.
              </p>
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
                  Visualización de otro nivel
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
                  Da vida a tu proyecto
                </h3>
                <p className="text-muted-foreground mb-6">
                  Envíanos los planos de tu proyecto y te preparamos una propuesta de visualización 3D a medida. Sin compromiso.
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
      <FloatingCTA />
    </div>
  );
};

export default ServicioRenders;
