import { useState } from "react";
import { ArrowRight, CheckCircle, Maximize, Play } from "lucide-react";
import { Link } from "react-router-dom";
import matterportPreviewFallback from "@/assets/matterport-landing.avif";

const MATTERPORT_MODEL_ID = "buNhXbQW5V6";
const MATTERPORT_TOUR_URL = `https://my.matterport.com/show/?m=${MATTERPORT_MODEL_ID}`;
const matterportPreviewUrl = (width: number, height: number) =>
  `https://my.matterport.com/api/v2/player/models/${MATTERPORT_MODEL_ID}/thumb/?width=${width}&height=${height}&fit=crop&disable=upscale`;

const benefits = [
  "Visita disponible las 24 horas desde cualquier dispositivo",
  "Medición, etiquetas y contenido interactivo dentro del espacio",
  "Publicación compatible con Google Maps y Street View",
];

const MatterportSection = () => {
  const [showTour, setShowTour] = useState(false);

  return (
    <section id="tour" className="py-20 px-6">
      <div className="max-w-6xl mx-auto rounded-3xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-7 sm:p-10 lg:p-12 flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent mb-3">
              Tecnología Matterport
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Permite visitar tu espacio antes de desplazarse
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Creamos gemelos digitales para inmobiliarias, hoteles,
              restaurantes, comercios y espacios de eventos que necesitan
              mostrar cada detalle a distancia.
            </p>
            <ul className="space-y-3 mb-7">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-2.5 text-sm text-foreground/80"
                >
                  <CheckCircle
                    className="h-4 w-4 text-accent mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/servicios/tour-virtual"
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline self-start"
            >
              Ver el servicio completo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative min-h-[300px] sm:min-h-[420px] lg:min-h-full bg-secondary">
            {showTour ? (
              <iframe
                src={MATTERPORT_TOUR_URL}
                title="Tour virtual Matterport 360°"
                className="absolute inset-0 h-full w-full border-0"
                allow="fullscreen; xr-spatial-tracking"
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <>
                <img
                  src={matterportPreviewUrl(1200, 900)}
                  srcSet={`${matterportPreviewUrl(640, 480)} 640w, ${matterportPreviewUrl(960, 720)} 960w, ${matterportPreviewUrl(1200, 900)} 1200w`}
                  sizes="(min-width: 1024px) 576px, calc(100vw - 3rem)"
                  alt="Vista previa del gemelo digital Matterport de una vivienda"
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                  width={1200}
                  height={900}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.removeAttribute("srcset");
                    event.currentTarget.src = matterportPreviewFallback;
                  }}
                />
                <div className="absolute inset-0 bg-background/35" />
                <button
                  type="button"
                  onClick={() => setShowTour(true)}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
                  aria-label="Cargar y explorar la demostración 3D"
                >
                  <span className="h-16 w-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-xl transition-transform hover:scale-105">
                    <Play
                      className="h-6 w-6 ml-1"
                      fill="currentColor"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="rounded-full bg-background/75 border border-foreground/15 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                    Explorar demostración 3D
                  </span>
                </button>
                <Maximize
                  className="absolute bottom-4 right-4 h-5 w-5 text-foreground/70"
                  aria-hidden="true"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MatterportSection;
