import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { X, ChevronLeft, ChevronRight, Play, Globe, Maximize2 } from "lucide-react";
import SEOHead, { breadcrumbSchema, getSiteUrl } from "@/components/SEOHead";

type Category = { id: string; name: string; slug: string; description: string | null; cover_image: string | null; grid_row: number | null; grid_col: number | null };
type Subcategory = { id: string; name: string; slug: string; category_id: string; description: string | null; gallery_style: string | null; cover_image: string | null; grid_row: number | null; grid_col: number | null };
type PortfolioImage = { id: string; image_url: string; title: string | null; alt_text: string | null; subcategory_id: string; media_type: string; video_url: string | null; thumbnail_url: string | null; grid_row: number | null; grid_col: number | null };

const getEmbedUrl = (url: string): string => {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
};

// Helper: render items in a free grid if positions are set, otherwise auto grid
function FreeGrid<T extends { id: string; grid_row: number | null; grid_col: number | null }>({
  items,
  columns,
  renderItem,
  emptyMessage,
}: {
  items: T[];
  columns: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage: string;
}) {
  const hasGridPositions = items.some(i => i.grid_row != null && i.grid_col != null);

  if (items.length === 0) {
    return <div className="col-span-full text-center text-muted-foreground py-16">{emptyMessage}</div>;
  }

  if (hasGridPositions) {
    const placed = items.filter(i => i.grid_row != null && i.grid_col != null);
    const unplaced = items.filter(i => i.grid_row == null || i.grid_col == null);
    const maxRow = placed.reduce((max, i) => Math.max(max, i.grid_row!), 0);

    return (
      <>
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridTemplateRows: `repeat(${maxRow}, 1fr)`,
          }}
        >
          {placed.map((item, i) => (
            <div key={item.id} style={{ gridRow: item.grid_row!, gridColumn: item.grid_col! }}>
              {renderItem(item, i)}
            </div>
          ))}
        </div>
        {unplaced.length > 0 && (
          <div className={`grid gap-6 mt-6`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {unplaced.map((item, i) => (
              <div key={item.id}>{renderItem(item, placed.length + i)}</div>
            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <div className={`grid gap-6`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {items.map((item, i) => (
        <div key={item.id}>{renderItem(item, i)}</div>
      ))}
    </div>
  );
}

const Portfolio = () => {
  const { categorySlug, subcategorySlug } = useParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [selectedSub, setSelectedSub] = useState<Subcategory | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [fullscreenIframe, setFullscreenIframe] = useState<string | null>(null);

  useEffect(() => {
    const fetchCats = async () => {
      const { data } = await supabase.from("portfolio_categories").select("*").eq("is_visible", true).order("order");
      if (data) {
        setCategories(data as Category[]);
        if (categorySlug) {
          const found = data.find(c => c.slug === categorySlug);
          if (found) {
            setSelectedCat(found as Category);
            if (!subcategorySlug) setSelectedSub(null);
          } else {
            setSelectedCat(null);
            setSelectedSub(null);
          }
        } else {
          setSelectedCat(null);
          setSelectedSub(null);
        }
      }
    };
    fetchCats();
  }, [categorySlug, subcategorySlug]);

  useEffect(() => {
    if (!selectedCat) { setSubcategories([]); setImages([]); return; }
    const fetchSubs = async () => {
      const { data: subs } = await supabase.from("portfolio_subcategories").select("*").eq("category_id", selectedCat.id).eq("is_visible", true).order("order");
      if (subs) {
        setSubcategories(subs as Subcategory[]);
        if (subcategorySlug && !selectedSub) {
          const found = (subs as Subcategory[]).find(s => s.slug === subcategorySlug);
          if (found) setSelectedSub(found);
        }
      }
    };
    fetchSubs();
  }, [selectedCat]);

  useEffect(() => {
    if (!selectedSub) { setImages([]); return; }
    const fetchImgs = async () => {
      const { data: imgs } = await supabase.from("portfolio_images").select("*").eq("subcategory_id", selectedSub.id).order("order");
      if (imgs) setImages(imgs as PortfolioImage[]);
    };
    fetchImgs();
  }, [selectedSub]);

  const openLightbox = (i: number) => setLightbox(i);

  const renderMediaBadge = (item: PortfolioImage) => {
    if (item.media_type === "video") return <div className="absolute top-3 left-3 bg-blue-500/80 text-white rounded-full p-1.5"><Play className="w-4 h-4" /></div>;
    if (item.media_type === "iframe") return <div className="absolute top-3 left-3 bg-emerald-500/80 text-white rounded-full p-1.5"><Globe className="w-4 h-4" /></div>;
    return null;
  };

  const renderLightboxContent = () => {
    if (lightbox === null) return null;
    const item = images[lightbox];
    if (!item) return null;

    if (item.media_type === "iframe" && item.video_url) {
      return <iframe src={item.video_url} className="w-[90vw] h-[80vh] rounded-lg border-0" allowFullScreen allow="xr-spatial-tracking" onClick={(e) => e.stopPropagation()} />;
    }
    if (item.media_type === "video" && item.video_url) {
      const embedUrl = getEmbedUrl(item.video_url);
      const isEmbed = embedUrl !== item.video_url;
      if (isEmbed) return <iframe src={embedUrl} className="w-[90vw] max-w-4xl aspect-video rounded-lg border-0" allowFullScreen onClick={(e) => e.stopPropagation()} />;
      return <video src={item.video_url} controls autoPlay className="max-w-[90vw] max-h-[90vh] rounded-lg" onClick={(e) => e.stopPropagation()} />;
    }
    return <img src={item.image_url} alt={item.alt_text || ""} className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />;
  };

  const handleBack = () => {
    if (selectedSub) { setSelectedSub(null); }
    else if (selectedCat) { setSelectedCat(null); setSelectedSub(null); }
  };

  const currentTitle = selectedSub ? selectedSub.name : selectedCat ? selectedCat.name : null;
  const breadcrumb = selectedCat
    ? selectedSub
      ? `← ${selectedCat.name}`
      : "← Volver al portafolio"
    : null;

  const siteUrl = getSiteUrl();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`Portafolio${selectedCat ? ` — ${selectedCat.name}` : ""} | Silvio Costa Photography`}
        description="Portafolio profesional de fotografía, vídeo, dron y tours virtuales 360°. Descubre nuestros proyectos en España y Portugal."
        canonical={`${siteUrl}/portafolio${categorySlug ? `/${categorySlug}` : ""}`}
        jsonLd={breadcrumbSchema([
          { name: "Inicio", url: siteUrl },
          { name: "Portafolio", url: `${siteUrl}/portafolio` },
          ...(selectedCat ? [{ name: selectedCat.name, url: `${siteUrl}/portafolio/${categorySlug}` }] : []),
        ])}
      />
      <Navbar />
      <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
            Nuestro <span className="text-gradient-accent italic">Portafolio</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explora nuestros proyectos y descubre la calidad de nuestro trabajo audiovisual.
          </p>
        </motion.div>

        {breadcrumb && (
          <div className="mb-6">
            <button onClick={handleBack} className="text-sm text-primary hover:underline inline-block">
              {breadcrumb}
            </button>
            <h2 className="font-display text-3xl font-bold text-foreground mt-2">{currentTitle}</h2>
          </div>
        )}

        {/* Step 1: Categories */}
        {!selectedCat && (
          <FreeGrid
            items={categories}
            columns={3}
            emptyMessage="No hay categorías en el portafolio aún."
            renderItem={(cat, i) => (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedCat(cat)}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden text-left border border-border bg-card hover:border-primary/30 transition-all w-full"
              >
                {cat.cover_image && <img src={cat.cover_image} alt={cat.name} title="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="font-display text-2xl font-bold text-foreground">{cat.name}</h3>
                  {cat.description && <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>}
                </div>
              </motion.button>
            )}
          />
        )}

        {/* Step 2: Subcategories */}
        {selectedCat && !selectedSub && (
          <FreeGrid
            items={subcategories}
            columns={3}
            emptyMessage="No hay subcategorías en esta categoría."
            renderItem={(sub, i) => (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedSub(sub)}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden text-left border border-border bg-card hover:border-primary/30 transition-all w-full"
              >
                {sub.cover_image && <img src={sub.cover_image} alt={sub.name} title="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="font-display text-2xl font-bold text-foreground">{sub.name}</h3>
                  {sub.description && <p className="text-sm text-muted-foreground mt-1">{sub.description}</p>}
                </div>
              </motion.button>
            )}
          />
        )}

        {/* Step 3: Gallery */}
        {selectedSub && (
          <>
            <FreeGrid
              items={images}
              columns={4}
              emptyMessage="No hay contenido en esta subcategoría."
              renderItem={(img, i) => (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`relative aspect-square rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-all group ${img.media_type === "iframe" || (img.media_type === "video" && img.video_url && getEmbedUrl(img.video_url) !== img.video_url) ? "" : "cursor-pointer"}`}
                  onClick={() => {
                    const isEmbeddedVideo = img.media_type === "video" && img.video_url && getEmbedUrl(img.video_url) !== img.video_url;
                    if (img.media_type !== "iframe" && !isEmbeddedVideo) openLightbox(i);
                  }}
                >
                  {img.media_type === "iframe" && img.video_url ? (
                    <>
                      <iframe
                        src={img.video_url}
                        className="w-full h-full absolute inset-0 border-0"
                        allowFullScreen
                        allow="xr-spatial-tracking"
                        loading="lazy"
                        title={img.alt_text || img.title || "Tour virtual 360°"}
                      />
                      <button
                        onClick={() => setFullscreenIframe(img.video_url!)}
                        className="absolute top-3 right-3 z-10 bg-background/80 backdrop-blur-sm text-foreground rounded-full p-2 hover:bg-background transition-colors"
                        title="Ver en pantalla completa"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : img.media_type === "video" && img.video_url && getEmbedUrl(img.video_url) !== img.video_url ? (
                    <>
                      <iframe
                        src={getEmbedUrl(img.video_url)}
                        className="w-full h-full absolute inset-0 border-0"
                        allowFullScreen
                        loading="lazy"
                        title={img.alt_text || img.title || "Vídeo"}
                      />
                      <button
                        onClick={() => setFullscreenIframe(getEmbedUrl(img.video_url!))}
                        className="absolute top-3 right-3 z-10 bg-background/80 backdrop-blur-sm text-foreground rounded-full p-2 hover:bg-background transition-colors"
                        title="Ver en pantalla completa"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <img src={img.thumbnail_url || img.image_url} alt={img.alt_text || ""} title="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {renderMediaBadge(img)}
                    </>
                  )}
                </motion.div>
              )}
            />

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-16 rounded-2xl border border-primary/20 bg-card p-10 text-center"
            >
              <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
                ¿Quieres más información?
              </h3>
              <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                Solicita un presupuesto sin compromiso para tu proyecto de {selectedSub.name.toLowerCase()}.
              </p>
              <a
                href="#contacto"
                onClick={(e) => { e.preventDefault(); window.location.href = "/#contacto"; }}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                Solicitar presupuesto
              </a>
            </motion.div>
          </>
        )}
      </div>

      {/* Fullscreen iframe */}
      {fullscreenIframe && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          <div className="flex items-center justify-end p-3">
            <button onClick={() => setFullscreenIframe(null)} className="text-foreground hover:text-primary">
              <X className="w-8 h-8" />
            </button>
          </div>
          <iframe
            src={fullscreenIframe}
            className="flex-1 w-full border-0"
            allowFullScreen
            allow="xr-spatial-tracking"
            title="Tour virtual 360°"
          />
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-foreground hover:text-primary z-10"><X className="w-8 h-8" /></button>
          <button onClick={(e) => { e.stopPropagation(); setLightbox(Math.max(0, lightbox - 1)); }} className="absolute left-4 text-foreground hover:text-primary z-10"><ChevronLeft className="w-8 h-8" /></button>
          <button onClick={(e) => { e.stopPropagation(); setLightbox(Math.min(images.length - 1, lightbox + 1)); }} className="absolute right-4 text-foreground hover:text-primary z-10"><ChevronRight className="w-8 h-8" /></button>
          {renderLightboxContent()}
        </div>
      )}

      <WhatsAppButton />
      <Footer />
    </div>
  );
};

export default Portfolio;
