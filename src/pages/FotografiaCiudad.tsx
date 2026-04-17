import { useEffect, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import FloatingCTA from "@/components/FloatingCTA";
import CTASection from "@/components/CTASection";
import SEOHead, { breadcrumbSchema, getSiteUrl } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Camera, MapPin, CheckCircle2, ArrowRight, Building, Home, UtensilsCrossed, Plane, Star, Clock, Award } from "lucide-react";
import heroImg from "@/assets/servicio-foto-hero.jpg";

interface CityData {
  slug: string;
  name: string;
  region: string;
  country: "España" | "Portugal";
  intro: string;
  highlights: string[];
  zones: string[];
  postal?: string;
  geo?: { lat: number; lng: number };
}

const CITIES: Record<string, CityData> = {
  madrid: {
    slug: "madrid", name: "Madrid", region: "Comunidad de Madrid", country: "España",
    intro: "Servicios de fotografía profesional en Madrid: inmobiliaria, arquitectura, gastronomía, producto y eventos. Cobertura completa en toda la Comunidad de Madrid con desplazamiento incluido en el centro urbano.",
    highlights: ["Salamanca, Chamberí, Chueca y Malasaña", "Restaurantes con estrella Michelin", "Showrooms y oficinas premium"],
    zones: ["Centro", "Salamanca", "Chamberí", "Las Rozas", "Pozuelo", "Majadahonda", "Alcobendas"],
    geo: { lat: 40.4168, lng: -3.7038 },
  },
  barcelona: {
    slug: "barcelona", name: "Barcelona", region: "Cataluña", country: "España",
    intro: "Fotografía profesional en Barcelona para hoteles, restaurantes, inmobiliarias y marcas de moda. Conocemos el Eixample, Gracia y la zona alta como nadie.",
    highlights: ["Hoteles boutique y rooftops", "Diagonal Mar y 22@", "Pisos de lujo en el Eixample"],
    zones: ["Eixample", "Gràcia", "Sarrià-Sant Gervasi", "Les Corts", "Sant Cugat", "Castelldefels", "Sitges"],
    geo: { lat: 41.3851, lng: 2.1734 },
  },
  valencia: {
    slug: "valencia", name: "Valencia", region: "Comunidad Valenciana", country: "España",
    intro: "Fotografía y vídeo profesional en Valencia: arquitectura mediterránea, restaurantes, inmuebles en la Marina, Ruzafa y Patacona.",
    highlights: ["Ciudad de las Artes y las Ciencias", "Restaurantes en Ruzafa", "Chalets en la Eliana"],
    zones: ["Centro", "Ruzafa", "Cabanyal", "L'Eliana", "Pobla de Vallbona", "Patacona"],
    geo: { lat: 39.4699, lng: -0.3763 },
  },
  sevilla: {
    slug: "sevilla", name: "Sevilla", region: "Andalucía", country: "España",
    intro: "Fotografía profesional en Sevilla con base local en Andalucía. Especialistas en patios sevillanos, hoteles con encanto, restaurantes y eventos sociales.",
    highlights: ["Cascos históricos y patios", "Hoteles boutique en Santa Cruz", "Bodegas y haciendas"],
    zones: ["Casco Antiguo", "Triana", "Nervión", "Los Remedios", "Aljarafe"],
    geo: { lat: 37.3891, lng: -5.9845 },
  },
  malaga: {
    slug: "malaga", name: "Málaga", region: "Andalucía", country: "España",
    intro: "Fotografía profesional en Málaga capital y Costa del Sol. Cobertura especializada en chiringuitos, hoteles de playa, villas de lujo y eventos.",
    highlights: ["Costa del Sol y Marbella", "Villas de lujo en Benahavís", "Restaurantes con vistas al mar"],
    zones: ["Centro", "Pedregalejo", "Torremolinos", "Fuengirola", "Mijas", "Marbella", "Estepona"],
    geo: { lat: 36.7213, lng: -4.4214 },
  },
  bilbao: {
    slug: "bilbao", name: "Bilbao", region: "País Vasco", country: "España",
    intro: "Fotografía profesional en Bilbao y Bizkaia. Especializados en arquitectura industrial reconvertida, gastronomía vasca y caseríos rehabilitados.",
    highlights: ["Casco Viejo y Abandoibarra", "Pintxos y restaurantes con estrella", "Caseríos rehabilitados"],
    zones: ["Casco Viejo", "Indautxu", "Deusto", "Getxo", "Sopela"],
    geo: { lat: 43.2630, lng: -2.9350 },
  },
  zaragoza: {
    slug: "zaragoza", name: "Zaragoza", region: "Aragón", country: "España",
    intro: "Fotografía y vídeo profesional en Zaragoza: arquitectura, comercio, restaurantes y eventos corporativos.",
    highlights: ["Casco histórico", "Centros comerciales", "Industria agroalimentaria"],
    zones: ["Centro", "Universidad", "Actur", "La Almozara", "Cuarte"],
    geo: { lat: 41.6488, lng: -0.8891 },
  },
  alicante: {
    slug: "alicante", name: "Alicante", region: "Comunidad Valenciana", country: "España",
    intro: "Fotografía profesional en Alicante y Costa Blanca: villas, segundas residencias, restaurantes de playa y hoteles.",
    highlights: ["Villas en Jávea y Moraira", "Restaurantes en el puerto", "Calpe y Altea"],
    zones: ["Centro", "Albufereta", "San Juan", "Jávea", "Moraira", "Calpe", "Altea", "Benidorm"],
    geo: { lat: 38.3452, lng: -0.4810 },
  },
  murcia: {
    slug: "murcia", name: "Murcia", region: "Región de Murcia", country: "España",
    intro: "Fotografía profesional en Murcia y La Manga del Mar Menor: agroalimentario, restaurantes y propiedades vacacionales.",
    highlights: ["La Manga del Mar Menor", "Sector agroalimentario", "Restaurantes huerta"],
    zones: ["Centro", "El Palmar", "Cartagena", "La Manga", "San Pedro del Pinatar"],
    geo: { lat: 37.9922, lng: -1.1307 },
  },
  palma: {
    slug: "palma", name: "Palma de Mallorca", region: "Islas Baleares", country: "España",
    intro: "Fotografía profesional en Palma de Mallorca y toda la isla: fincas rurales, hoteles boutique, yates y restaurantes.",
    highlights: ["Fincas rurales y agroturismos", "Hoteles 5 estrellas", "Puerto deportivo"],
    zones: ["Palma", "Sóller", "Pollença", "Andratx", "Santanyí", "Manacor"],
    geo: { lat: 39.5696, lng: 2.6502 },
  },
  granada: {
    slug: "granada", name: "Granada", region: "Andalucía", country: "España",
    intro: "Fotografía profesional en Granada: Albaicín, Sacromonte, restaurantes con vistas a la Alhambra y propiedades singulares.",
    highlights: ["Cármenes con vistas a la Alhambra", "Restaurantes en el Albaicín", "Sierra Nevada"],
    zones: ["Centro", "Albaicín", "Realejo", "Zaidín", "Sierra Nevada"],
    geo: { lat: 37.1773, lng: -3.5986 },
  },
  cordoba: {
    slug: "cordoba", name: "Córdoba", region: "Andalucía", country: "España",
    intro: "Fotografía profesional en Córdoba: patios cordobeses, hoteles con encanto, restaurantes y eventos sociales.",
    highlights: ["Patios cordobeses", "Judería y Mezquita", "Restaurantes tradicionales"],
    zones: ["Centro", "Judería", "San Basilio", "El Brillante"],
    geo: { lat: 37.8882, lng: -4.7794 },
  },
  marbella: {
    slug: "marbella", name: "Marbella", region: "Andalucía", country: "España",
    intro: "Fotografía profesional en Marbella y Costa del Sol: villas de lujo, beach clubs, hoteles 5 estrellas y eventos premium.",
    highlights: ["Villas en La Zagaleta y Sierra Blanca", "Beach clubs y restaurantes", "Puerto Banús y eventos VIP"],
    zones: ["Marbella centro", "Puerto Banús", "Nueva Andalucía", "San Pedro", "La Zagaleta", "Estepona"],
    geo: { lat: 36.5101, lng: -4.8825 },
  },
  "san-sebastian": {
    slug: "san-sebastian", name: "San Sebastián", region: "País Vasco", country: "España",
    intro: "Fotografía profesional en Donostia-San Sebastián: gastronomía con estrella Michelin, hoteles boutique y arquitectura singular.",
    highlights: ["Restaurantes con estrella Michelin", "La Concha y Zurriola", "Pintxos en la Parte Vieja"],
    zones: ["Parte Vieja", "Centro", "Gros", "Antiguo", "Igueldo"],
    geo: { lat: 43.3183, lng: -1.9812 },
  },
  tenerife: {
    slug: "tenerife", name: "Tenerife", region: "Canarias", country: "España",
    intro: "Fotografía profesional en Tenerife: hoteles de playa, villas de lujo, restaurantes con vistas al Teide y resorts.",
    highlights: ["Costa Adeje y Los Cristianos", "Villas en el norte", "Restaurantes con vistas al Teide"],
    zones: ["Santa Cruz", "La Laguna", "Costa Adeje", "Los Cristianos", "Puerto de la Cruz"],
    geo: { lat: 28.2916, lng: -16.6291 },
  },
  "las-palmas": {
    slug: "las-palmas", name: "Las Palmas de Gran Canaria", region: "Canarias", country: "España",
    intro: "Fotografía profesional en Gran Canaria: hoteles de playa, villas, restaurantes y eventos en toda la isla.",
    highlights: ["Maspalomas y Meloneras", "Hoteles 5 estrellas", "Villas en el sur"],
    zones: ["Las Palmas centro", "Maspalomas", "Meloneras", "Puerto de Mogán", "Telde"],
    geo: { lat: 28.1248, lng: -15.4300 },
  },
  lisboa: {
    slug: "lisboa", name: "Lisboa", region: "Lisboa", country: "Portugal",
    intro: "Serviços de fotografia profissional em Lisboa: imobiliário, arquitetura, restaurantes e eventos corporativos com cobertura em toda a Grande Lisboa.",
    highlights: ["Chiado, Príncipe Real e Avenida", "Hotéis boutique", "Restaurantes com vista para o Tejo"],
    zones: ["Chiado", "Príncipe Real", "Alfama", "Belém", "Cascais", "Estoril", "Sintra"],
    geo: { lat: 38.7223, lng: -9.1393 },
  },
  porto: {
    slug: "porto", name: "Porto", region: "Norte", country: "Portugal",
    intro: "Fotografia profissional no Porto e norte de Portugal: caves de vinho, hotéis boutique, restaurantes e arquitetura única.",
    highlights: ["Caves do vinho do Porto em Gaia", "Ribeira e Foz do Douro", "Hotéis com vista para o Douro"],
    zones: ["Baixa", "Ribeira", "Boavista", "Foz", "Vila Nova de Gaia", "Matosinhos"],
    geo: { lat: 41.1579, lng: -8.6291 },
  },
  faro: {
    slug: "faro", name: "Faro", region: "Algarve", country: "Portugal",
    intro: "Fotografia profissional em Faro e Algarve: villas de luxo, resorts de praia, restaurantes e eventos com cobertura em toda a costa.",
    highlights: ["Villas em Vilamoura e Quinta do Lago", "Hotéis 5 estrelas", "Restaurantes com vista para o mar"],
    zones: ["Faro", "Vilamoura", "Quinta do Lago", "Albufeira", "Lagos", "Tavira"],
    geo: { lat: 37.0194, lng: -7.9304 },
  },
};

const services = [
  { icon: Home, title: "Fotografía inmobiliaria", desc: "Imágenes profesionales para vender o alquilar más rápido." },
  { icon: Building, title: "Arquitectura e interiores", desc: "Composición cuidada con ópticas profesionales." },
  { icon: UtensilsCrossed, title: "Fotografía gastronómica", desc: "Cartas, redes y campañas para restaurantes." },
  { icon: Plane, title: "Vídeo y dron", desc: "Pilotos AESA con licencia y vuelos seguros." },
  { icon: Camera, title: "Producto y e-commerce", desc: "Packshots y lifestyle de alto rendimiento." },
  { icon: Award, title: "Tours virtuales 3D", desc: "Matterport Pro3 para visitas inmersivas." },
];

const FotografiaCiudad = () => {
  const { city } = useParams<{ city: string }>();
  const [dbCity, setDbCity] = useState<CityData | null | undefined>(undefined); // undefined = loading
  const hardcoded = city ? CITIES[city] : null;

  useEffect(() => {
    if (!city || hardcoded) { setDbCity(null); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("seo_cities" as any)
        .select("slug, name, region, country, intro, highlights, zones, postal, geo_lat, geo_lng")
        .eq("slug", city)
        .eq("is_visible", true)
        .maybeSingle();
      if (cancelled) return;
      if (!data) { setDbCity(null); return; }
      const row = data as any;
      setDbCity({
        slug: row.slug,
        name: row.name,
        region: row.region,
        country: (row.country === "Portugal" ? "Portugal" : "España") as "España" | "Portugal",
        intro: row.intro || "",
        highlights: row.highlights || [],
        zones: row.zones || [],
        postal: row.postal || undefined,
        geo: row.geo_lat != null && row.geo_lng != null ? { lat: Number(row.geo_lat), lng: Number(row.geo_lng) } : undefined,
      });
    })();
    return () => { cancelled = true; };
  }, [city, hardcoded]);

  const data = hardcoded ?? dbCity;

  if (dbCity === undefined && !hardcoded) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Cargando…</div>;
  }
  if (!data) return <Navigate to="/" replace />;

  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}/fotografia-${data.slug}`;
  const title = `Fotógrafo Profesional en ${data.name} | Silvio Costa Photography`;
  const description = `Servicios de fotografía profesional en ${data.name}: inmobiliaria, arquitectura, gastronomía, producto, eventos y tours virtuales 3D. Cobertura en toda ${data.region}.`;

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": `Silvio Costa Photography — ${data.name}`,
    "image": `${siteUrl}/og-image.jpg`,
    "url": canonical,
    "telephone": "+351-960-079-369",
    "priceRange": "€€",
    "areaServed": { "@type": "City", "name": data.name },
    ...(data.geo && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": data.geo.lat,
        "longitude": data.geo.lng,
      },
    }),
    "address": {
      "@type": "PostalAddress",
      "addressLocality": data.name,
      "addressRegion": data.region,
      "addressCountry": data.country === "España" ? "ES" : "PT",
    },
    "serviceType": [
      "Fotografía profesional",
      "Fotografía inmobiliaria",
      "Fotografía de arquitectura",
      "Fotografía gastronómica",
      "Vídeo profesional",
      "Tours virtuales 3D",
    ],
  };

  const breadcrumbs = breadcrumbSchema([
    { name: "Inicio", url: siteUrl },
    { name: "Servicios", url: `${siteUrl}/servicios/fotografia` },
    { name: `Fotografía en ${data.name}`, url: canonical },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={title}
        description={description}
        canonical={canonical}
        ogType="website"
        jsonLd={[localBusinessSchema, breadcrumbs]}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImg})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" aria-hidden="true" />
        <div className="container mx-auto px-4 relative z-10 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <MapPin className="w-4 h-4" />
              {data.country} · {data.region}
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 text-foreground">
              Fotógrafo profesional en <span className="text-primary">{data.name}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              {data.intro}
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <a href="#contacto">
                Solicitar presupuesto en {data.name}
                <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Highlights locales */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            Lo que mejor conocemos de {data.name}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {data.highlights.map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border"
              >
                <Star className="w-6 h-6 text-primary mb-3" />
                <p className="text-foreground">{h}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            Servicios disponibles en {data.name}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Cobertura completa con desplazamiento incluido en el área urbana.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl bg-card border border-border hover:border-primary/40 transition-colors"
              >
                <s.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2 text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Zonas cubiertas */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="font-display text-3xl font-bold mb-6 text-foreground">
            Zonas que cubrimos en {data.region}
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {data.zones.map((z) => (
              <span key={z} className="px-4 py-2 rounded-full bg-card border border-border text-sm text-foreground">
                <MapPin className="inline w-3 h-3 mr-1 text-primary" />{z}
              </span>
            ))}
          </div>
          <p className="text-muted-foreground mt-8 text-sm flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" /> Respuesta en menos de 24 horas
          </p>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-3xl font-bold text-center mb-10 text-foreground">
            ¿Por qué elegirnos en {data.name}?
          </h2>
          <ul className="space-y-4">
            {[
              `Fotógrafo profesional con experiencia en ${data.name} y ${data.region}`,
              "Equipo de última generación: cámaras full-frame, ópticas tilt-shift, dron AESA y Matterport Pro3",
              "Edición y retoque profesional incluido",
              "Entrega en alta resolución en 48-72h",
              "Adaptación a tu identidad de marca",
              `Sin coste de desplazamiento dentro del área metropolitana de ${data.name}`,
            ].map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-foreground">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Cross-link a otras ciudades */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-display text-2xl font-bold text-center mb-6 text-foreground">
            Otras ciudades donde trabajamos
          </h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {Object.values(CITIES)
              .filter((c) => c.slug !== data.slug)
              .slice(0, 12)
              .map((c) => (
                <Link
                  key={c.slug}
                  to={`/fotografia-${c.slug}`}
                  className="px-3 py-1.5 rounded-full bg-card border border-border text-xs text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                >
                  Fotografía en {c.name}
                </Link>
              ))}
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
      <WhatsAppButton />
      <FloatingCTA />
    </div>
  );
};

export default FotografiaCiudad;
