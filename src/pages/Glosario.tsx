import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import FloatingCTA from "@/components/FloatingCTA";
import SEOHead, { getSiteUrl } from "@/components/SEOHead";
import { Search } from "lucide-react";

interface Term {
  term: string;
  category: "Fotografía" | "Vídeo" | "Dron" | "Tour 360°" | "Renders 3D";
  definition: string;
}

const terms: Term[] = [
  { term: "AESA", category: "Dron", definition: "Agencia Estatal de Seguridad Aérea. Organismo español que regula las operaciones con drones y emite las habilitaciones de operador y piloto remoto." },
  { term: "STS-ES-01 / STS-ES-02", category: "Dron", definition: "Escenarios estándar nacionales que autorizan vuelos en categoría específica sobre zona urbana o poblada bajo condiciones reglamentadas." },
  { term: "Matterport Pro3", category: "Tour 360°", definition: "Cámara profesional con sensor LiDAR que captura espacios en 3D con precisión milimétrica, generando tours navegables, dollhouse y planos de planta." },
  { term: "Dollhouse", category: "Tour 360°", definition: "Vista tridimensional desde el exterior que permite ver todas las estancias de un inmueble como si fuera una casa de muñecas, exclusiva de Matterport." },
  { term: "HDR", category: "Fotografía", definition: "High Dynamic Range. Técnica que fusiona varias exposiciones de la misma escena para conservar detalle en luces y sombras, esencial en fotografía inmobiliaria." },
  { term: "Tilt-shift", category: "Fotografía", definition: "Óptica que permite corregir la convergencia de líneas verticales en arquitectura sin recurrir a postproducción, manteniendo la perspectiva real del edificio." },
  { term: "Focal stacking", category: "Fotografía", definition: "Fusión de múltiples tomas con distinto punto de enfoque para obtener una imagen con nitidez total, frecuente en producto y joyería." },
  { term: "Color grading", category: "Vídeo", definition: "Proceso de corrección y estilización cromática del metraje en postproducción para conseguir un acabado cinematográfico coherente." },
  { term: "LUT", category: "Vídeo", definition: "Look-Up Table. Archivo de transformación de color que se aplica al material grabado para conseguir un look específico de forma consistente." },
  { term: "Log (S-Log, V-Log)", category: "Vídeo", definition: "Perfil de imagen plano que conserva el máximo rango dinámico durante la grabación, pensado para etalonaje profesional posterior." },
  { term: "Gimbal", category: "Vídeo", definition: "Estabilizador motorizado de tres ejes que permite movimientos de cámara fluidos sin trípode ni dolly." },
  { term: "Render fotorrealista", category: "Renders 3D", definition: "Imagen generada por ordenador a partir de un modelo 3D con materiales, iluminación y postproducción que la hacen indistinguible de una fotografía real." },
  { term: "Modelado BIM", category: "Renders 3D", definition: "Building Information Modeling. Modelado tridimensional que incorpora información constructiva, dimensional y de materiales del edificio." },
  { term: "Pano 360°", category: "Tour 360°", definition: "Imagen panorámica esférica que cubre 360° horizontales y 180° verticales, base de los tours virtuales navegables." },
  { term: "MTOM", category: "Dron", definition: "Maximum Take-Off Mass. Masa máxima de despegue del dron, parámetro que determina la categoría operativa y los requisitos de seguro." },
  { term: "ND filter", category: "Vídeo", definition: "Filtro de densidad neutra que reduce la luz que llega al sensor para mantener la apertura y el shutter cinematográfico (180°) en exteriores luminosos." },
];

const categories = ["Todos", "Fotografía", "Vídeo", "Dron", "Tour 360°", "Renders 3D"] as const;

const Glosario = () => {
  const siteUrl = getSiteUrl();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("Todos");

  const filtered = useMemo(() => {
    return terms.filter((t) => {
      const matchCat = category === "Todos" || t.category === category;
      const matchQuery = !query || `${t.term} ${t.definition}`.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    }).sort((a, b) => a.term.localeCompare(b.term, "es"));
  }, [query, category]);

  const definedTermSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Glosario audiovisual de Silvio Costa Photography",
    hasDefinedTerm: terms.map((t) => ({
      "@type": "DefinedTerm",
      name: t.term,
      description: t.definition,
      inDefinedTermSet: `${siteUrl}/glosario`,
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Glosario audiovisual: fotografía, vídeo, dron y tours 360° | Silvio Costa"
        description="Diccionario de términos profesionales de fotografía, vídeo cinematográfico, operaciones con dron AESA, tours Matterport y renders 3D. Glosario actualizado por Silvio Costa Photography."
        canonical={`${siteUrl}/glosario`}
        jsonLd={definedTermSchema}
      />
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        <header className="text-center mb-10">
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight">
            Glosario <span className="text-gradient-primary italic">audiovisual</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            Términos clave de fotografía, vídeo, dron, tours 360° y renders 3D, explicados sin tecnicismos inútiles. Para que entiendas lo que contratas.
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar término..."
              className="w-full pl-10 pr-4 py-3 rounded-full bg-card/60 border border-border/60 text-sm focus:outline-none focus:border-primary/60"
              aria-label="Buscar término del glosario"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-colors ${
                  category === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-card/60 border border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((t) => (
            <article
              key={t.term}
              className="rounded-xl border border-border/60 bg-card/60 p-5 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <h2 className="font-display text-lg font-semibold">{t.term}</h2>
                <span className="text-[10px] font-semibold tracking-wider text-primary uppercase">{t.category}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{t.definition}</p>
            </article>
          ))}
          {filtered.length === 0 && (
            <p className="md:col-span-2 text-center text-muted-foreground py-10">Sin resultados para tu búsqueda.</p>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
      <FloatingCTA />
    </div>
  );
};

export default Glosario;