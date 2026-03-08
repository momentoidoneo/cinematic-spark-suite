import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { X, ChevronLeft, ChevronRight, Play, Globe } from "lucide-react";
import SEOHead, { breadcrumbSchema, getSiteUrl } from "@/components/SEOHead";

type Category = { id: string; name: string; slug: string; description: string | null; cover_image: string | null };
type Subcategory = { id: string; name: string; category_id: string; description: string | null; gallery_style: string | null; cover_image: string | null };
type PortfolioImage = { id: string; image_url: string; title: string | null; alt_text: string | null; subcategory_id: string; media_type: string; video_url: string | null; thumbnail_url: string | null };

const getEmbedUrl = (url: string): string => {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
};

const Portfolio = () => {
  const { categorySlug } = useParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [selectedSub, setSelectedSub] = useState<Subcategory | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    const fetchCats = async () => {
      const { data } = await supabase.from("portfolio_categories").select("*").order("order");
      if (data) {
        setCategories(data);
        if (categorySlug) {
          const found = data.find(c => c.slug === categorySlug);
          if (found) setSelectedCat(found);
        }
      }
    };
    fetchCats();
  }, [categorySlug]);

  useEffect(() => {
    if (!selectedCat) { setSubcategories([]); setImages([]); return; }
    const fetchSubs = async () => {
      const { data: subs } = await supabase.from("portfolio_subcategories").select("*").eq("category_id", selectedCat.id).order("order");
      if (subs) setSubcategories(subs as Subcategory[]);
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

  // Breadcrumb navigation
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 [&>*:last-child:nth-child(3n+1)]:col-start-2 [&>*:last-child:nth-child(3n+1)]:lg:col-start-2">
            {categories.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedCat(cat)}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden text-left border border-border bg-card hover:border-primary/30 transition-all"
              >
                {cat.cover_image && <img src={cat.cover_image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="font-display text-2xl font-bold text-foreground">{cat.name}</h3>
                  {cat.description && <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>}
                </div>
              </motion.button>
            ))}
            {categories.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-16">No hay categorías en el portafolio aún.</div>
            )}
          </div>
        )}

        {/* Step 2: Subcategories */}
        {selectedCat && !selectedSub && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subcategories.map((sub, i) => (
              <motion.button
                key={sub.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedSub(sub)}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden text-left border border-border bg-card hover:border-primary/30 transition-all"
              >
                {sub.cover_image && <img src={sub.cover_image} alt={sub.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="font-display text-2xl font-bold text-foreground">{sub.name}</h3>
                  {sub.description && <p className="text-sm text-muted-foreground mt-1">{sub.description}</p>}
                </div>
              </motion.button>
            ))}
            {subcategories.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-16">No hay subcategorías en esta categoría.</div>
            )}
          </div>
        )}

        {/* Step 3: Gallery (single subcategory) */}
        {selectedSub && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, i) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-border hover:border-primary/30 transition-all group"
                onClick={() => openLightbox(i)}
              >
                <img src={img.thumbnail_url || img.image_url} alt={img.alt_text || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {renderMediaBadge(img)}
                {img.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-sm text-foreground font-medium truncate">{img.title}</p>
                  </div>
                )}
              </motion.div>
            ))}
            {images.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-16">No hay contenido en esta subcategoría.</div>
            )}
          </div>
        )}
      </div>

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
