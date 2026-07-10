import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Boxes,
  Camera,
  Eye,
  Home,
  Plane,
  Video,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getOptimizedImageSrcSet, getOptimizedImageUrl } from "@/lib/imageUrl";

import fotoCover from "@/assets/servicio-foto-landing.avif";
import videoCover from "@/assets/banner-video-landing.avif";
import dronCover from "@/assets/banner-dron-landing.avif";
import tourCover from "@/assets/matterport-landing.avif";
import eventosCover from "@/assets/portfolio-eventos-landing.avif";
import rendersCover from "@/assets/portfolio-renders-landing.avif";

type CategoryCover = {
  slug: string;
  cover_image: string | null;
};

const serviceDefinitions = [
  {
    slug: "fotografia",
    title: "Fotografía profesional",
    description:
      "Inmobiliaria, arquitectura, producto, gastronomía, retrato y comunicación corporativa.",
    href: "/servicios/fotografia",
    icon: Camera,
    fallback: fotoCover,
  },
  {
    slug: "video",
    title: "Vídeo y producción",
    description:
      "Vídeo corporativo, publicidad, eventos, contenido social, podcast y streaming.",
    href: "/servicios/video-dron",
    icon: Video,
    fallback: videoCover,
  },
  {
    slug: "dron",
    title: "Servicios de dron",
    description:
      "Fotografía y vídeo aéreo, inspecciones, fotogrametría y apoyo a producciones.",
    href: "/servicios/video-dron",
    icon: Plane,
    fallback: dronCover,
  },
  {
    slug: "tours-virtuales",
    title: "Tours virtuales 360°",
    description:
      "Recorridos Matterport y publicación en Google Street View para espacios que necesitan venderse a distancia.",
    href: "/servicios/tour-virtual",
    icon: Eye,
    fallback: tourCover,
  },
  {
    slug: "eventos",
    title: "Cobertura de eventos",
    description:
      "Fotografía, vídeo, streaming y sonido coordinados para una cobertura completa.",
    href: "/servicios/eventos",
    icon: Home,
    fallback: eventosCover,
  },
  {
    slug: "renders",
    title: "Renders 3D",
    description:
      "Visualización fotorrealista de arquitectura, interiorismo y producto antes de construir o producir.",
    href: "/servicios/renders",
    icon: Boxes,
    fallback: rendersCover,
  },
];

const ServicesSection = () => {
  const [covers, setCovers] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase
      .from("portfolio_categories")
      .select("slug,cover_image")
      .eq("is_visible", true)
      .then(({ data }) => {
        const next: Record<string, string> = {};
        (data as CategoryCover[] | null)?.forEach((category) => {
          if (category.cover_image) next[category.slug] = category.cover_image;
        });
        setCovers(next);
      });
  }, []);

  return (
    <section id="servicios" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary mb-3">
              Servicios
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">
              Todo lo necesario para presentar mejor tu proyecto
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Un único equipo para coordinar fotografía, vídeo, dron, espacios
              360° y visualización 3D.
            </p>
          </div>
          <Link
            to="/precios"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Consultar precios <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div
          className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-4 -mx-6 px-6 md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible"
          aria-label="Áreas de servicio"
        >
          {serviceDefinitions.map((service) => {
            const image = covers[service.slug] || service.fallback;
            const srcSet = covers[service.slug]
              ? getOptimizedImageSrcSet(image, [480, 720, 960], {
                  height: 600,
                  quality: 68,
                })
              : undefined;

            return (
              <article
                key={service.slug}
                className="group min-w-[82vw] max-w-[340px] snap-start rounded-2xl border border-border bg-card overflow-hidden md:min-w-0 md:max-w-none"
              >
                <Link
                  to={service.href}
                  className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                  aria-label={`${service.title}: ver servicio`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={
                        covers[service.slug]
                          ? getOptimizedImageUrl(image, {
                              width: 720,
                              height: 450,
                              quality: 68,
                            })
                          : image
                      }
                      srcSet={srcSet}
                      sizes="(min-width: 1024px) 31vw, (min-width: 768px) 48vw, 92vw"
                      alt={`${service.title} de Silvio Costa Photography`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      loading="lazy"
                      decoding="async"
                      width={720}
                      height={450}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  </div>
                  <div className="p-6">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <service.icon
                        className="h-5 w-5 text-primary"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="font-display text-xl font-bold text-foreground mb-2">
                      {service.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground mb-5">
                      {service.description}
                    </p>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      Ver servicio{" "}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
