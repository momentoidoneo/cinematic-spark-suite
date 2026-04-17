import { useEffect, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import FloatingCTA from "@/components/FloatingCTA";
import CTASection from "@/components/CTASection";
import SEOHead, { breadcrumbSchema, getSiteUrl, personSchema, aggregateRatingSchema } from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Camera, MapPin, CheckCircle2, ArrowRight, Star, Award, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/servicio-foto-hero.jpg";

/**
 * Long-tail SEO landing: /{servicio}-{ciudad}
 * Examples:
 *  - /fotografia-inmobiliaria-madrid
 *  - /tour-virtual-barcelona
 *  - /video-dron-marbella
 *
 * The page resolves the servicio + ciudad from the URL slug and renders dynamic content.
 */

const SERVICES: Record<string, { title: string; desc: string; bullets: string[]; cta: string }> = {
  "fotografia-inmobiliaria": {
    title: "Fotografía Inmobiliaria",
    desc: "Sesiones HDR profesionales para venta y alquiler. Edición Sky-Replacement, verticales corregidas y entrega en 48h.",
    bullets: ["20-40 fotos finales en 1920px", "HDR 5 exposiciones por encuadre", "Plano 2D opcional", "Entrega en 24-48h"],
    cta: "Reservar sesión inmobiliaria",
  },
  "fotografia-arquitectura": {
    title: "Fotografía de Arquitectura",
    desc: "Capturamos la esencia de tu proyecto: edificios, interiorismo y obras finalizadas con técnica tilt-shift y composición editorial.",
    bullets: ["Tilt-shift y verticales perfectas", "Hora dorada y blue hour", "Aerial views con dron", "Licencia de uso editorial"],
    cta: "Solicitar dossier de arquitectura",
  },
  "fotografia-gastronomia": {
    title: "Fotografía Gastronómica",
    desc: "Fotografía de plato, bebidas y ambiente para restaurantes, hoteles y marcas. Foodstyling cuidado y luz natural o flash continuo.",
    bullets: ["Plato individual y mesa puesta", "Bebidas y cócteles", "Ambiente y staff", "Carta digital lista para web"],
    cta: "Pedir cotización gastronómica",
  },
  "fotografia-producto": {
    title: "Fotografía de Producto",
    desc: "Sesión en estudio o en localización. Producto packshot fondo blanco, lifestyle y detalle macro para e-commerce.",
    bullets: ["Packshot fondo blanco PNG", "Lifestyle contextualizado", "Macro y detalle", "Optimizado para Amazon/Shopify"],
    cta: "Cotizar packshot",
  },
  "fotografia-eventos": {
    title: "Fotografía de Eventos",
    desc: "Cobertura editorial de bodas, corporativos, lanzamientos y conferencias. Galería online en 72h con descarga ilimitada.",
    bullets: ["Reportaje completo", "Retratos de invitados", "Galería online privada", "Entrega 72h"],
    cta: "Reservar evento",
  },
  "tour-virtual": {
    title: "Tour Virtual 360° Matterport",
    desc: "Recorridos 3D con Matterport Pro3: doble la conversión de leads en inmobiliaria y hostelería. Embed en tu web y compatible Google Street View.",
    bullets: ["Matterport Pro3 (LiDAR)", "Plano 2D y 3D Dollhouse", "Embed iframe responsive", "Hosting incluido 1 año"],
    cta: "Cotizar tour virtual",
  },
  "video-dron": {
    title: "Vídeo con Dron",
    desc: "Grabación aérea cinematográfica con piloto AESA certificado. Operativa STS-01 y A1/A3 en zona urbana. Entregamos vídeo 4K editado.",
    bullets: ["Piloto AESA certificado", "Drones DJI Mavic 3 / Inspire", "Edición y color grading", "Vídeo 4K hasta 60fps"],
    cta: "Reservar grabación dron",
  },
};

interface CityRecord {
  slug: string;
  name: string;
  region: string;
  country: string;
  intro: string;
  highlights: string[];
  zones: string[];
  geo_lat?: number | null;
  geo_lng?: number | null;
}

const HARDCODED_CITIES: Record<string, CityRecord> = {
  madrid: { slug: "madrid", name: "Madrid", region: "Comunidad de Madrid", country: "España", intro: "", highlights: [], zones: ["Centro", "Salamanca", "Chamberí", "Las Rozas", "Pozuelo"], geo_lat: 40.4168, geo_lng: -3.7038 },
  barcelona: { slug: "barcelona", name: "Barcelona", region: "Cataluña", country: "España", intro: "", highlights: [], zones: ["Eixample", "Gràcia", "Sarrià"], geo_lat: 41.3851, geo_lng: 2.1734 },
  valencia: { slug: "valencia", name: "Valencia", region: "Comunidad Valenciana", country: "España", intro: "", highlights: [], zones: ["Centro", "Ruzafa", "Cabanyal"], geo_lat: 39.4699, geo_lng: -0.3763 },
  sevilla: { slug: "sevilla", name: "Sevilla", region: "Andalucía", country: "España", intro: "", highlights: [], zones: ["Casco Antiguo", "Triana", "Nervión"], geo_lat: 37.3891, geo_lng: -5.9845 },
  malaga: { slug: "malaga", name: "Málaga", region: "Andalucía", country: "España", intro: "", highlights: [], zones: ["Centro", "Marbella", "Estepona"], geo_lat: 36.7213, geo_lng: -4.4214 },
  bilbao: { slug: "bilbao", name: "Bilbao", region: "País Vasco", country: "España", intro: "", highlights: [], zones: ["Casco Viejo", "Abando", "Indautxu"], geo_lat: 43.2630, geo_lng: -2.9350 },
  marbella: { slug: "marbella", name: "Marbella", region: "Andalucía", country: "España", intro: "", highlights: [], zones: ["Puerto Banús", "Nueva Andalucía", "Golden Mile"], geo_lat: 36.5101, geo_lng: -4.8825 },
  lisboa: { slug: "lisboa", name: "Lisboa", region: "Lisboa", country: "Portugal", intro: "", highlights: [], zones: ["Chiado", "Príncipe Real", "Cascais"], geo_lat: 38.7223, geo_lng: -9.1393 },
  porto: { slug: "porto", name: "Porto", region: "Norte", country: "Portugal", intro: "", highlights: [], zones: ["Ribeira", "Foz", "Boavista"], geo_lat: 41.1579, geo_lng: -8.6291 },
  faro: { slug: "faro", name: "Faro", region: "Algarve", country: "Portugal", intro: "", highlights: [], zones: ["Centro", "Vilamoura", "Albufeira"], geo_lat: 37.0194, geo_lng: -7.9304 },
};

export default function ServicioCiudad() {
  const params = useParams();
  // Route: /:slug — slug = "{servicio}-{ciudad}" e.g. "fotografia-inmobiliaria-madrid"
  const slug = (params["*"] || params.slug || "") as string;

  const [city, setCity] = useState<CityRecord | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Parse: try longest-match service prefix
  const serviceKeys = Object.keys(SERVICES).sort((a, b) => b.length - a.length);
  const matchedServiceKey = serviceKeys.find(k => slug.startsWith(k + "-"));
  const citySlug = matchedServiceKey ? slug.slice(matchedServiceKey.length + 1) : "";
  const service = matchedServiceKey ? SERVICES[matchedServiceKey] : null;

  useEffect(() => {
    if (!citySlug) { setLoaded(true); return; }
    const local = HARDCODED_CITIES[citySlug];
    if (local) { setCity(local); setLoaded(true); return; }
    supabase.from("seo_cities").select("*").eq("slug", citySlug).eq("is_visible", true).maybeSingle()
      .then(({ data }) => {
        if (data) setCity(data as CityRecord);
        setLoaded(true);
      });
  }, [citySlug]);

  if (!loaded) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Cargando…</div>;
  }
  if (!service || !city) return <Navigate to="/" replace />;

  const SITE = getSiteUrl();
  const url = `${SITE}/${slug}`;
  const title = `${service.title} en ${city.name} | Silvio Costa`;
  const description = `${service.desc.slice(0, 110)} Cobertura local en ${city.name}, ${city.region}.`;

  const jsonLd: Record<string, any>[] = [
    breadcrumbSchema([
      { name: "Inicio", url: SITE },
      { name: "Servicios", url: `${SITE}/servicios/fotografia` },
      { name: `${service.title} en ${city.name}`, url },
    ]),
    personSchema,
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `${service.title} en ${city.name}`,
      description,
      provider: { "@id": `${SITE}/#business` },
      areaServed: {
        "@type": "City",
        name: city.name,
        address: { "@type": "PostalAddress", addressRegion: city.region, addressCountry: city.country },
        ...(city.geo_lat && city.geo_lng ? { geo: { "@type": "GeoCoordinates", latitude: city.geo_lat, longitude: city.geo_lng } } : {}),
      },
      aggregateRating: aggregateRatingSchema,
      url,
    },
  ];

  // Related cities for internal linking
  const relatedCities = Object.values(HARDCODED_CITIES)
    .filter(c => c.slug !== citySlug && c.country === city.country)
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={title} description={description} canonical={url} ogType="website" jsonLd={jsonLd} />
      <Navbar />
      <FloatingCTA />

      {/* Hero */}
      <section className="relative h-[60vh] min-h-[420px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt={`${service.title} en ${city.name}`} className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
          <div className="mb-3 flex justify-center">
            <Breadcrumbs items={[
              { label: "Servicios", href: "/servicios/fotografia" },
              { label: `${service.title} ${city.name}` },
            ]} />
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium mb-4">
              <MapPin className="h-3 w-3" /> {city.name}, {city.region}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              {service.title}<br /><span className="text-primary">en {city.name}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">{service.desc}</p>
            <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <a href="#contacto">{service.cta} <ArrowRight className="ml-2 h-4 w-4" /></a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Bullets + Trust */}
      <section className="py-16 container mx-auto px-4 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Qué incluye</h2>
            <ul className="space-y-2">
              {service.bullets.map(b => (
                <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /> {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-5 w-5 text-primary fill-primary" />
              <span className="font-semibold">4.9/5 en 47 proyectos</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div><Award className="h-5 w-5 mx-auto text-primary mb-1" /><div className="text-xs text-muted-foreground">+10 años</div></div>
              <div><Camera className="h-5 w-5 mx-auto text-primary mb-1" /><div className="text-xs text-muted-foreground">Equipo Sony</div></div>
              <div><Clock className="h-5 w-5 mx-auto text-primary mb-1" /><div className="text-xs text-muted-foreground">Entrega 48h</div></div>
            </div>
            {city.zones.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="text-xs text-muted-foreground mb-2">Zonas cubiertas en {city.name}:</div>
                <div className="flex flex-wrap gap-1">
                  {city.zones.map(z => <span key={z} className="text-xs px-2 py-0.5 rounded bg-muted">{z}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Internal linking: other services in this city */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-xl font-bold mb-4">Otros servicios en {city.name}</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(SERVICES).filter(([k]) => k !== matchedServiceKey).map(([key, s]) => (
              <Link key={key} to={`/${key}-${citySlug}`} className="block p-4 bg-card border border-border rounded-lg hover:border-primary transition-colors">
                <div className="text-sm font-semibold">{s.title}</div>
                <div className="text-xs text-muted-foreground mt-1">en {city.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Internal linking: related cities */}
      {relatedCities.length > 0 && (
        <section className="py-12 container mx-auto px-4 max-w-5xl">
          <h2 className="text-xl font-bold mb-4">{service.title} en otras ciudades</h2>
          <div className="grid sm:grid-cols-3 md:grid-cols-6 gap-2">
            {relatedCities.map(c => (
              <Link key={c.slug} to={`/${matchedServiceKey}-${c.slug}`} className="text-center p-3 bg-card border border-border rounded-lg hover:border-primary transition-colors text-sm">
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <CTASection />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
