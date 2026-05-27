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
  // Fotografía
  { term: "Apertura (f-stop)", category: "Fotografía", definition: "Tamaño del diafragma del objetivo. Controla la cantidad de luz y la profundidad de campo: f/1.4 da fondo desenfocado, f/11 mantiene toda la escena nítida." },
  { term: "ISO", category: "Fotografía", definition: "Sensibilidad del sensor a la luz. ISO bajo (100) da máxima calidad; ISO alto (6400+) permite grabar con poca luz a costa de más ruido." },
  { term: "Shutter speed", category: "Fotografía", definition: "Velocidad de obturación. Tiempos rápidos (1/1000) congelan el movimiento; tiempos lentos (1s) permiten estelas de luz o agua sedosa." },
  { term: "RAW", category: "Fotografía", definition: "Formato de archivo sin compresión que conserva toda la información capturada por el sensor, permitiendo edición avanzada sin pérdida de calidad." },
  { term: "Bracketing", category: "Fotografía", definition: "Disparo automático de varias tomas con distinta exposición, base para fusiones HDR en interiores con ventanas o exteriores con cielo." },
  { term: "Balance de blancos", category: "Fotografía", definition: "Ajuste cromático que neutraliza la dominante de color de cada fuente de luz para que los blancos se vean realmente blancos." },
  { term: "Profundidad de campo", category: "Fotografía", definition: "Zona de la escena que aparece enfocada. Determinante en retrato (fondo desenfocado) y producto (todo nítido)." },
  { term: "Bokeh", category: "Fotografía", definition: "Calidad estética del desenfoque del fondo, valorada en retrato y producto premium por su carácter cinematográfico." },
  { term: "Flash estroboscópico", category: "Fotografía", definition: "Flash de estudio de alta potencia y recuperación rápida, usado en producto, moda y retrato corporativo profesional." },
  { term: "Carta de color", category: "Fotografía", definition: "Patrón de referencia (X-Rite, ColorChecker) fotografiado al inicio de cada sesión para calibrar el color en postproducción." },
  { term: "Stitching", category: "Fotografía", definition: "Unión digital de varias fotografías para crear panorámicas o imágenes de gran resolución, habitual en arquitectura e interiorismo." },
  { term: "Twilight shot", category: "Fotografía", definition: "Toma exterior a la hora azul (atardecer) con luces interiores encendidas. Imagen estrella en inmobiliaria premium y hoteles." },
  // Vídeo
  { term: "Frame rate (fps)", category: "Vídeo", definition: "Número de fotogramas por segundo. 24 fps da look cine, 25/30 fps es estándar broadcast, 60+ fps permite cámara lenta fluida." },
  { term: "Bitrate", category: "Vídeo", definition: "Cantidad de datos por segundo de vídeo. A mayor bitrate, más calidad y mayor peso de archivo. Determina el margen de edición." },
  { term: "Codec (H.264, H.265, ProRes)", category: "Vídeo", definition: "Algoritmo de compresión del vídeo. H.264 es universal, H.265 pesa menos, ProRes mantiene máxima calidad para edición profesional." },
  { term: "Croma 4:2:2 / 4:2:0", category: "Vídeo", definition: "Submuestreo de color. 4:2:2 conserva más información cromática (ideal para grading), 4:2:0 es estándar en cámaras de consumo." },
  { term: "B-roll", category: "Vídeo", definition: "Imágenes complementarias (detalles, ambiente, recursos) que se intercalan con la toma principal para dar ritmo y contexto narrativo." },
  { term: "Storyboard", category: "Vídeo", definition: "Guión visual con bocetos secuenciales de cada plano. Herramienta de preproducción imprescindible en vídeo corporativo y publicitario." },
  { term: "Slow motion", category: "Vídeo", definition: "Efecto de cámara lenta logrado grabando a alta velocidad (60-240 fps) y reproduciendo a 24/25 fps." },
  { term: "Timelapse", category: "Vídeo", definition: "Secuencia de fotografías tomadas a intervalos regulares y reproducidas a velocidad normal, comprimiendo horas o días en segundos." },
  { term: "Hyperlapse", category: "Vídeo", definition: "Timelapse con movimiento de cámara entre tomas. Genera transiciones espectaculares de recorridos urbanos o arquitectónicos." },
  { term: "Estabilización en post", category: "Vídeo", definition: "Suavizado del movimiento de cámara en edición mediante software (Warp Stabilizer, Resolve), útil cuando no hay gimbal disponible." },
  { term: "Multicámara", category: "Vídeo", definition: "Grabación simultánea desde varios ángulos y montaje sincronizado, estándar en eventos, conferencias y entrevistas." },
  { term: "Streaming RTMP", category: "Vídeo", definition: "Protocolo de transmisión en directo a plataformas como YouTube, Twitch o Vimeo Livestream desde codificador hardware o software." },
  { term: "Lavalier", category: "Vídeo", definition: "Micrófono de solapa discreto, cableado o inalámbrico, usado en entrevistas, vídeo corporativo y testimoniales." },
  // Dron
  { term: "Categoría Abierta / Específica", category: "Dron", definition: "Marcos operativos europeos. Abierta para vuelos de bajo riesgo con limitaciones; Específica para operaciones autorizadas previa evaluación (SORA, STS)." },
  { term: "A1/A2/A3", category: "Dron", definition: "Subcategorías de la categoría Abierta según proximidad a personas y entorno: A1 (sobrevuelo limitado), A2 (cerca de personas), A3 (lejos)." },
  { term: "SORA", category: "Dron", definition: "Specific Operations Risk Assessment. Metodología de evaluación de riesgos exigida por AESA para operaciones de dron en categoría específica." },
  { term: "Operador UAS", category: "Dron", definition: "Persona física o jurídica registrada en AESA como responsable de las operaciones con dron, distinto del piloto remoto que opera." },
  { term: "Seguro RC dron", category: "Dron", definition: "Seguro de responsabilidad civil obligatorio para todo operador de dron en España y Portugal, con cobertura mínima según peso y operación." },
  { term: "NOTAM", category: "Dron", definition: "Notice to Airmen. Aviso oficial a navegantes aéreos que comunica restricciones, eventos o cambios temporales en el espacio aéreo." },
  { term: "Zona geográfica UAS", category: "Dron", definition: "Áreas definidas por AESA con condiciones especiales para vuelo de drones: prohibidas, restringidas o requieren autorización previa." },
  { term: "Fotogrametría", category: "Dron", definition: "Técnica que reconstruye un modelo 3D a partir de cientos de fotografías aéreas solapadas, usada en topografía, fachadas y patrimonio." },
  // Tour 360 / Matterport
  { term: "LiDAR", category: "Tour 360°", definition: "Light Detection and Ranging. Sensor que mide distancias con láser, base de la precisión milimétrica de Matterport Pro3 y los planos automáticos." },
  { term: "Mattertag", category: "Tour 360°", definition: "Etiqueta interactiva dentro de un tour Matterport que añade texto, enlaces, fotos o vídeos en puntos específicos del recorrido." },
  { term: "Floor plan", category: "Tour 360°", definition: "Plano de planta 2D generado automáticamente por Matterport a partir del escaneo, con medidas y distribución del espacio." },
  { term: "Schematic view", category: "Tour 360°", definition: "Vista esquemática cenital del tour Matterport, útil para orientarse y navegar entre estancias en inmuebles grandes." },
  { term: "Google Street View interior", category: "Tour 360°", definition: "Publicación de panorámicas 360° del interior de un negocio en Google Maps, posicionando la ficha frente a la competencia." },
  { term: "Tiny planet", category: "Tour 360°", definition: "Proyección esférica que convierte una panorámica 360° en una imagen circular tipo planeta, recurso visual creativo." },
  // Renders 3D
  { term: "V-Ray / Corona / Lumion", category: "Renders 3D", definition: "Motores de renderizado profesional usados en arquitectura e interiorismo para conseguir imágenes fotorrealistas a partir de modelos 3D." },
  { term: "Path tracing", category: "Renders 3D", definition: "Algoritmo de render que simula físicamente el comportamiento de la luz rebotando en la escena, base del fotorrealismo actual." },
  { term: "PBR (Physically Based Rendering)", category: "Renders 3D", definition: "Sistema de materiales basado en propiedades físicas reales (reflectancia, rugosidad, metalicidad) para resultados creíbles bajo cualquier iluminación." },
  { term: "HDRI", category: "Renders 3D", definition: "Imagen panorámica de alto rango dinámico usada como iluminación de entorno en escenas 3D, aportando reflejos y luz realistas." },
  { term: "Polígono / Mesh", category: "Renders 3D", definition: "Unidad geométrica básica del modelado 3D. Más polígonos implica más detalle pero mayor tiempo de cálculo del render." },
  { term: "Postproducción de render", category: "Renders 3D", definition: "Retoque final del render en Photoshop: ajuste de luces, atmósfera, integración de personas, vegetación y corrección de color." },
  { term: "Walkthrough 3D", category: "Renders 3D", definition: "Vídeo animado que recorre un espacio modelado en 3D, alternativa al tour Matterport cuando el inmueble todavía no está construido." },
  // Fotografía (ampliación)
  { term: "Regla de los tercios", category: "Fotografía", definition: "Principio de composición que divide la imagen en 9 partes iguales; los puntos de interés se sitúan en las intersecciones para crear equilibrio visual." },
  { term: "Hora dorada", category: "Fotografía", definition: "Franja de luz cálida y suave durante la primera hora tras el amanecer y la previa al ocaso, ideal para exteriores e inmobiliaria premium." },
  { term: "Hora azul", category: "Fotografía", definition: "Periodo crepuscular en el que el cielo adquiere un azul intenso. Imprescindible para twilight shots de hoteles, restaurantes y arquitectura." },
  { term: "Distancia focal", category: "Fotografía", definition: "Longitud del objetivo expresada en mm. Gran angular (14-24mm) para interiores, estándar (35-50mm) para producto, tele (85-200mm) para retrato." },
  { term: "Full frame", category: "Fotografía", definition: "Sensor del tamaño de una película 35mm. Ofrece mejor rendimiento en poca luz, mayor rango dinámico y desenfoque más cinematográfico." },
  { term: "Crop factor", category: "Fotografía", definition: "Factor de recorte de sensores menores que full frame (APS-C 1.5x, MFT 2x), que multiplica la focal equivalente del objetivo." },
  { term: "Rango dinámico", category: "Fotografía", definition: "Capacidad del sensor para capturar detalle simultáneo en sombras y luces. Determinante en escenas de alto contraste como interiores con ventanas." },
  { term: "Histograma", category: "Fotografía", definition: "Gráfico que muestra la distribución tonal de la imagen, herramienta clave para evaluar exposición sin depender de la pantalla." },
  { term: "Flat lay", category: "Fotografía", definition: "Composición fotografiada en plano cenital con los objetos dispuestos sobre una superficie. Habitual en gastronomía, producto y editorial." },
  { term: "Light painting", category: "Fotografía", definition: "Técnica de larga exposición en la que se pinta con fuentes de luz móviles para crear trazos luminosos en la escena." },
  { term: "Retouching", category: "Fotografía", definition: "Retoque digital avanzado de piel, producto o arquitectura: eliminación de imperfecciones, dodge & burn, frequency separation." },
  { term: "Frequency separation", category: "Fotografía", definition: "Técnica de retoque que separa textura y color en capas independientes, permitiendo suavizar piel sin perder detalle natural." },
  // Vídeo (ampliación)
  { term: "Regla del 180° (shutter)", category: "Vídeo", definition: "Convención cinematográfica de fijar la velocidad de obturación al doble del frame rate (1/50 a 25fps) para conseguir motion blur natural." },
  { term: "Eje de los 180°", category: "Vídeo", definition: "Línea imaginaria entre dos personajes que no debe cruzarse para mantener la coherencia espacial entre planos en una conversación." },
  { term: "Plano secuencia", category: "Vídeo", definition: "Toma continua sin cortes que recorre la acción de principio a fin. Recurso narrativo de alto impacto en publicidad e inmobiliaria premium." },
  { term: "Jump cut", category: "Vídeo", definition: "Corte entre dos planos muy similares que rompe la continuidad temporal. Estándar en vídeo para redes y vlogs por su ritmo ágil." },
  { term: "Match cut", category: "Vídeo", definition: "Transición entre dos planos unidos por similitud visual, sonora o de movimiento. Aporta elegancia narrativa al montaje." },
  { term: "Cinemagraph", category: "Vídeo", definition: "Fotografía con un único elemento en movimiento en bucle. Formato híbrido muy usado en hostelería, moda y campañas digitales." },
  { term: "Aerial b-roll", category: "Vídeo", definition: "Recursos aéreos grabados con dron que aportan contexto y escala, intercalados en vídeo corporativo, turismo e inmobiliaria." },
  { term: "Drone reveal", category: "Vídeo", definition: "Movimiento de dron que descubre progresivamente un sujeto u objeto, recurso muy efectivo en aperturas de vídeos corporativos." },
  { term: "Proxies", category: "Vídeo", definition: "Versiones de baja resolución del metraje original que aceleran la edición en equipos modestos sin perder el master en alta calidad." },
  { term: "DCP", category: "Vídeo", definition: "Digital Cinema Package. Formato profesional de entrega para proyección en salas de cine y festivales." },
  { term: "Subtítulos SRT", category: "Vídeo", definition: "Archivo de texto con tiempos sincronizados para subtitular vídeo, fundamental para SEO en YouTube y accesibilidad." },
  { term: "Aspect ratio (16:9, 9:16, 1:1)", category: "Vídeo", definition: "Relación de aspecto del vídeo. 16:9 web/YouTube, 9:16 Reels/TikTok/Stories, 1:1 feed cuadrado de Instagram." },
  { term: "Chroma key", category: "Vídeo", definition: "Técnica de incrustación que sustituye un fondo verde o azul por otra imagen o vídeo en postproducción." },
  // Dron (ampliación)
  { term: "RID (Remote ID)", category: "Dron", definition: "Identificación remota electrónica obligatoria en la UE para drones clase C1-C6, que emite en tiempo real datos de la aeronave y operador." },
  { term: "Clase C0-C6", category: "Dron", definition: "Marcado europeo que clasifica los drones por peso y prestaciones (C0 <250g hasta C6 profesional) y determina dónde y cómo se pueden volar." },
  { term: "RPAS", category: "Dron", definition: "Remotely Piloted Aircraft System. Término técnico oficial para sistemas de aeronaves pilotadas a distancia, equivalente a 'dron profesional'." },
  { term: "STS-01 / STS-02", category: "Dron", definition: "Escenarios estándar europeos: STS-01 vuelo VLOS sobre zona controlada en suelo poblado, STS-02 BVLOS en zona poco poblada." },
  { term: "VLOS / BVLOS", category: "Dron", definition: "Visual Line of Sight (vuelo dentro del campo visual del piloto) y Beyond VLOS (fuera). BVLOS requiere autorización específica y equipamiento adicional." },
  { term: "GeoZone / U-Space", category: "Dron", definition: "Zonas geográficas digitales para drones y futuro espacio aéreo automatizado para vuelos urbanos coordinados a baja altura." },
  { term: "RTH (Return to Home)", category: "Dron", definition: "Función automática que devuelve el dron al punto de despegue ante pérdida de señal, batería baja o activación manual del piloto." },
  { term: "ATTI mode", category: "Dron", definition: "Modo de vuelo sin asistencia GPS, en el que el dron solo mantiene altitud. Reservado a pilotos experimentados ante interferencias." },
  // Tour 360 / Matterport (ampliación)
  { term: "Cube map", category: "Tour 360°", definition: "Formato de proyección 360° en 6 caras de un cubo, usado internamente por motores de tours virtuales y videojuegos." },
  { term: "Equirectangular", category: "Tour 360°", definition: "Proyección plana 2:1 de una imagen 360° esférica, formato estándar para subir panorámicas a Facebook, Google y plataformas VR." },
  { term: "Punto de interés (POI)", category: "Tour 360°", definition: "Marcador interactivo dentro de un tour 360° que muestra información adicional, vídeo, audio o navegación entre escenas." },
  { term: "Nadir", category: "Tour 360°", definition: "Zona inferior de una panorámica 360° (apuntando al suelo), donde suele aparecer el trípode y se reemplaza por un logo en postproducción." },
  { term: "Zenit", category: "Tour 360°", definition: "Zona superior de una panorámica 360° (apuntando al cielo o techo), opuesta al nadir." },
  { term: "VR ready", category: "Tour 360°", definition: "Tour 360° optimizado para visualización con gafas de realidad virtual (Meta Quest, Vision Pro), con calidad y proyección compatibles." },
  { term: "Embed iframe", category: "Tour 360°", definition: "Código HTML para insertar el tour Matterport o 360° dentro de una web o portal inmobiliario, manteniendo todas sus funciones." },
  // Renders 3D (ampliación)
  { term: "UV mapping", category: "Renders 3D", definition: "Proceso de desplegar la superficie de un modelo 3D en 2D para aplicar texturas con precisión sin deformaciones." },
  { term: "Topología", category: "Renders 3D", definition: "Estructura y distribución de los polígonos en un modelo 3D. Una buena topología permite animar y subdividir sin artefactos." },
  { term: "Subdivisión (SubD)", category: "Renders 3D", definition: "Técnica que suaviza un modelo de baja resolución generando geometría adicional automáticamente para obtener superficies curvas perfectas." },
  { term: "Displacement / Bump", category: "Renders 3D", definition: "Mapas que simulan relieve en superficies sin añadir polígonos: displacement deforma la geometría real, bump solo simula sombras." },
  { term: "Caustics", category: "Renders 3D", definition: "Patrones de luz refractada o reflejada (cristal, agua, piscinas) que generan dibujos luminosos característicos en superficies cercanas." },
  { term: "Global illumination (GI)", category: "Renders 3D", definition: "Iluminación indirecta que simula los rebotes de luz entre superficies, esencial para el realismo de interiores arquitectónicos." },
  { term: "Denoiser", category: "Renders 3D", definition: "Algoritmo (OptiX, Intel Open Image Denoise) que limpia el ruido del render reduciendo drásticamente el tiempo de cálculo." },
  { term: "Render pass / AOV", category: "Renders 3D", definition: "Capas independientes del render (difuso, especular, sombras, profundidad) que se combinan en postproducción para máximo control creativo." },
  { term: "Render farm", category: "Renders 3D", definition: "Conjunto de servidores que renderizan en paralelo escenas pesadas o animaciones, reduciendo días de cálculo a horas." },
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