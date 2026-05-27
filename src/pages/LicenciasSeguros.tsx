import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import FloatingCTA from "@/components/FloatingCTA";
import SEOHead, { getSiteUrl } from "@/components/SEOHead";
import { ShieldCheck, Plane, FileCheck, Lock, Award, Scale } from "lucide-react";

const items = [
  {
    icon: Plane,
    title: "Licencia AESA para operaciones con dron",
    desc: "Operador UAS registrado en la Agencia Estatal de Seguridad Aérea (AESA). Habilitación STS-ES-01 y STS-ES-02 para vuelos en categoría específica sobre zona urbana y poblada. Cumplimiento del Reglamento (UE) 2019/947 y normativa nacional.",
    status: "En vigor",
  },
  {
    icon: FileCheck,
    title: "Seguro de Responsabilidad Civil aeronáutica",
    desc: "Cobertura específica para operaciones con UAS conforme al Reglamento (CE) 785/2004, con suma asegurada adaptada al MTOM de cada aeronave. Póliza vigente y verificable previa solicitud.",
    status: "En vigor",
  },
  {
    icon: ShieldCheck,
    title: "Responsabilidad Civil profesional",
    desc: "Cobertura para daños materiales o personales derivados de la actividad fotográfica y audiovisual en cualquier ubicación dentro de España y Portugal.",
    status: "En vigor",
  },
  {
    icon: Lock,
    title: "Cumplimiento RGPD y protección de imagen",
    desc: "Tratamiento de datos personales conforme al Reglamento (UE) 2016/679 y la LOPDGDD. Modelos de cesión de derechos de imagen, contratos de encargo de tratamiento y entrega de material a través de canales cifrados.",
    status: "Activo",
  },
  {
    icon: Award,
    title: "Operador Matterport Service Partner",
    desc: "Equipo Matterport Pro3 con licencia profesional activa para captura, hosting y entrega de tours 3D inmersivos con datos LiDAR y dollhouse navegable.",
    status: "En vigor",
  },
  {
    icon: Scale,
    title: "Entidad fiscal regularizada",
    desc: "Momento Idóneo LDA, entidad portuguesa con NIPC y facturación legal en España y Portugal. Cumplimiento fiscal en ambos países y facturación electrónica conforme a normativa.",
    status: "Vigente",
  },
];

const LicenciasSeguros = () => {
  const siteUrl = getSiteUrl();
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Licencias, Seguros y Cumplimiento Legal | Silvio Costa Photography"
        description="Operador AESA con licencia STS, seguros de RC aeronáutica y profesional, cumplimiento RGPD y facturación legal en España y Portugal. Trabaja con un proveedor audiovisual regulado y verificable."
        canonical={`${siteUrl}/licencias-y-seguros`}
      />
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        <header className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight">
            Licencias, seguros y <span className="text-gradient-primary italic">cumplimiento legal</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            Trabajar con un proveedor audiovisual regulado no es opcional: es la diferencia entre una entrega legal y un riesgo para tu marca. Aquí tienes nuestros certificados y coberturas.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-5">
          {items.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-primary/10 p-3 shrink-0">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h2 className="font-display text-lg font-semibold">{item.title}</h2>
                    <span className="text-xs font-semibold tracking-wider text-primary uppercase shrink-0">{item.status}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-12 rounded-2xl border border-border/60 bg-card/40 p-8 text-center">
          <h2 className="font-display text-2xl font-semibold mb-3">¿Necesitas documentación para tu proyecto?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Para licitaciones, eventos corporativos o intervenciones en espacios protegidos podemos facilitarte copia de pólizas y autorizaciones bajo NDA.
          </p>
          <a
            href="/#contacto"
            className="inline-flex px-8 py-3.5 rounded-full bg-gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            Solicitar documentación
          </a>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
      <FloatingCTA />
    </div>
  );
};

export default LicenciasSeguros;