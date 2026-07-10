import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getOptimizedImageSrcSet, getOptimizedImageUrl } from "@/lib/imageUrl";

import portfolioFoto from "@/assets/portfolio-foto.jpg";
import portfolioDron from "@/assets/portfolio-dron.jpg";
import portfolioTour from "@/assets/portfolio-tour.jpg";
import portfolioVideo from "@/assets/portfolio-video.jpg";
import portfolioEventos from "@/assets/portfolio-eventos.jpg";
import portfolioRenders from "@/assets/portfolio-renders.jpg";

const fallbackImages: Record<string, string> = {
  fotografia: portfolioFoto,
  dron: portfolioDron,
  "tours-virtuales": portfolioTour,
  video: portfolioVideo,
  eventos: portfolioEventos,
  renders: portfolioRenders,
};

type Category = {
  id: string;
  name: string;
  slug: string;
  cover_image: string | null;
};

type FeaturedWork = {
  id: string;
  title: string | null;
  alt_text: string | null;
  image_url: string;
  thumbnail_url: string | null;
  portfolio_subcategories: {
    name: string;
    slug: string;
    portfolio_categories: {
      name: string;
      slug: string;
    } | null;
  } | null;
};

const PortfolioSection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<FeaturedWork[]>([]);

  useEffect(() => {
    Promise.all([
      supabase
        .from("portfolio_categories")
        .select("id,name,slug,cover_image")
        .eq("is_visible", true)
        .order("order"),
      supabase
        .from("portfolio_images")
        .select(
          "id,title,alt_text,image_url,thumbnail_url,portfolio_subcategories(name,slug,portfolio_categories(name,slug))",
        )
        .eq("is_featured", true)
        .eq("media_type", "image")
        .order("order")
        .limit(6),
    ]).then(([categoryResult, featuredResult]) => {
      setCategories((categoryResult.data as Category[]) || []);
      setFeatured((featuredResult.data as unknown as FeaturedWork[]) || []);
    });
  }, []);

  const hasFeaturedWork = featured.length > 0;

  return (
    <section
      id="portafolio"
      className="py-20 px-6 bg-card/20 border-y border-border/40"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent mb-3">
              Trabajo real
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">
              {hasFeaturedWork
                ? "Una selección de proyectos"
                : "Explora nuestro portafolio"}
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              {hasFeaturedWork
                ? "Proyectos seleccionados de fotografía y producción audiovisual para empresas, espacios y eventos."
                : "Entra en cada especialidad para ver galerías, entregables y trabajos completos."}
            </p>
          </div>
          <Link
            to="/portafolio"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
          >
            Ver portafolio completo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {hasFeaturedWork ? (
          <div className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-4 -mx-6 px-6 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible">
            {featured.map((work) => {
              const subcategory = work.portfolio_subcategories;
              const category = subcategory?.portfolio_categories;
              const src = work.thumbnail_url || work.image_url;
              const href =
                category && subcategory
                  ? `/portafolio/${category.slug}/${subcategory.slug}`
                  : "/portafolio";
              const label =
                work.title && !/\.(jpe?g|png|webp)$/i.test(work.title)
                  ? work.title
                  : subcategory?.name ||
                    category?.name ||
                    "Proyecto audiovisual";
              const alt =
                work.alt_text && !/\.(jpe?g|png|webp)$/i.test(work.alt_text)
                  ? work.alt_text
                  : `${label} — Silvio Costa Photography`;

              return (
                <Link
                  key={work.id}
                  to={href}
                  className="group relative min-w-[82vw] max-w-[340px] snap-start aspect-[4/3] rounded-2xl overflow-hidden border border-border sm:min-w-0 sm:max-w-none"
                >
                  <img
                    src={getOptimizedImageUrl(src, {
                      width: 720,
                      height: 540,
                      quality: 72,
                    })}
                    srcSet={getOptimizedImageSrcSet(src, [360, 540, 720, 960], {
                      height: 720,
                      quality: 72,
                    })}
                    sizes="(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 92vw"
                    alt={alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    loading="lazy"
                    decoding="async"
                    width={720}
                    height={540}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                  <div className="absolute inset-x-5 bottom-5">
                    <p className="font-display text-xl font-bold text-foreground">
                      {label}
                    </p>
                    {category && (
                      <p className="text-xs text-foreground/70 mt-1">
                        {category.name}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-4 -mx-6 px-6 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const CategoryCard = ({ category }: { category: Category }) => {
  const image = category.cover_image || fallbackImages[category.slug];

  return (
    <Link
      to={`/portafolio/${category.slug}`}
      className="group relative min-w-[82vw] max-w-[340px] snap-start aspect-[4/3] rounded-2xl overflow-hidden border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:min-w-0 sm:max-w-none"
    >
      {image ? (
        <img
          src={getOptimizedImageUrl(image, {
            width: 720,
            height: 540,
            quality: 72,
          })}
          srcSet={getOptimizedImageSrcSet(image, [360, 540, 720, 960], {
            height: 720,
            quality: 72,
          })}
          sizes="(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 92vw"
          alt={`Portafolio de ${category.name} — Silvio Costa Photography`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          loading="lazy"
          decoding="async"
          width={720}
          height={540}
        />
      ) : (
        <div className="w-full h-full bg-secondary flex items-center justify-center">
          <Camera
            className="w-12 h-12 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />
      <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3">
        <h3 className="font-display text-xl md:text-2xl font-bold text-foreground">
          {category.name}
        </h3>
        <ArrowRight
          className="h-5 w-5 text-accent transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
};

export default PortfolioSection;
