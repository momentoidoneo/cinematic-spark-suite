import { useEffect, useState } from "react";
import { ArrowRight, Clock, MapPin, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getOptimizedImageSrcSet, getOptimizedImageUrl } from "@/lib/imageUrl";
import heroBg from "@/assets/hero-bg.jpg";
import heroBgAvif from "@/assets/hero-bg-optimized.avif";
import heroBgMobileAvif from "@/assets/hero-bg-mobile.avif";

// React 18 forwards the standards-compliant lowercase attribute without
// emitting the development warning produced by the camelCase prop.
const highPriorityImageProps = { fetchpriority: "high" };
import logo from "@/assets/logo.png";

const trustSignals = [
  { icon: Clock, label: "Respuesta en menos de 24h" },
  { icon: MapPin, label: "España y Portugal" },
  { icon: Sparkles, label: "Foto · vídeo · dron · 360° · 3D" },
];

const HeroSection = () => {
  const [customHero, setCustomHero] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "hero_bg")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setCustomHero(data.value);
      });
  }, []);

  return (
    <section
      id="inicio"
      className="relative min-h-[760px] sm:min-h-[820px] lg:min-h-screen flex items-center overflow-hidden"
    >
      <div className="absolute inset-0" aria-hidden="true">
        {customHero ? (
          <img
            src={getOptimizedImageUrl(customHero, {
              width: 1600,
              height: 1000,
              quality: 70,
            })}
            srcSet={getOptimizedImageSrcSet(
              customHero,
              [720, 1200, 1600, 1920],
              { height: 1200, quality: 70 },
            )}
            sizes="100vw"
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
            {...highPriorityImageProps}
            width={1920}
            height={1080}
          />
        ) : (
          <picture>
            <source
              media="(max-width: 640px)"
              srcSet={heroBgMobileAvif}
              type="image/avif"
            />
            <source srcSet={heroBgAvif} type="image/avif" />
            <img
              src={heroBg}
              alt=""
              className="w-full h-full object-cover"
              loading="eager"
              {...highPriorityImageProps}
              width={1920}
              height={1080}
            />
          </picture>
        )}
        <div
          className="absolute inset-0"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="absolute inset-0 bg-background/45" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-24 pb-14 text-center">
        <img
          src={logo}
          alt="Silvio Costa Photography"
          className="hidden sm:block h-24 lg:h-32 w-auto mx-auto mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.25)]"
          width={556}
          height={432}
          decoding="async"
        />

        <p className="inline-flex items-center rounded-full border border-primary/25 bg-background/55 px-4 py-2 text-xs sm:text-sm font-semibold tracking-wide text-foreground backdrop-blur-sm mb-5">
          Fotografía y producción audiovisual para empresas
        </p>

        <h1 className="font-display text-[2.55rem] sm:text-6xl lg:text-7xl font-bold leading-[1.04] tracking-[-0.035em] text-foreground max-w-5xl mx-auto">
          Imágenes que ayudan a vender{" "}
          <span className="text-gradient-primary italic">
            espacios, marcas y experiencias
          </span>
        </h1>

        <p className="mt-6 max-w-3xl mx-auto text-base sm:text-lg lg:text-xl leading-relaxed text-foreground/75">
          Fotografía, vídeo, dron, Matterport y renders 3D en España y Portugal.
          Te proponemos el alcance adecuado y un presupuesto orientativo en
          menos de 24 horas.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <a
            href="#contacto"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-primary px-7 py-3.5 font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-opacity"
          >
            Cuéntame tu proyecto
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#portafolio"
            className="inline-flex items-center justify-center rounded-full border border-foreground/20 bg-background/45 px-7 py-3.5 font-semibold text-foreground backdrop-blur-sm hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
          >
            Ver trabajos
          </a>
        </div>

        <ul
          className="mt-7 flex flex-wrap justify-center gap-2.5"
          aria-label="Información principal del servicio"
        >
          {trustSignals.map((signal) => (
            <li
              key={signal.label}
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/55 px-3.5 py-2 text-xs sm:text-sm text-foreground/80 backdrop-blur-sm"
            >
              <signal.icon
                className="h-4 w-4 text-primary"
                aria-hidden="true"
              />
              <span>{signal.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default HeroSection;
