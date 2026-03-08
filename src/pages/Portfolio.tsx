import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Category = { id: string; name: string; slug: string; description: string | null; cover_image: string | null };
type Subcategory = { id: string; name: string; category_id: string; description: string | null; gallery_style: string | null };
type PortfolioImage = { id: string; image_url: string; title: string | null; alt_text: string | null; subcategory_id: string };

const Portfolio = () => {
  const { categorySlug } = useParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
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
    const fetch = async () => {
      const { data: subs } = await supabase.from("portfolio_subcategories").select("*").eq("category_id", selectedCat.id).order("order");
      if (subs) setSubcategories(subs);
      const { data: imgs } = await supabase.from("portfolio_images").select("*").in("subcategory_id", (subs || []).map(s => s.id)).order("order");
      if (imgs) setImages(imgs);
    };
    fetch();
  }, [selectedCat]);

  const filteredImages = selectedSub ? images.filter(i => i.subcategory_id === selectedSub) : images;

  return (
    <div className="min-h-screen bg-background">
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

        {!selectedCat ? (
          /* Category Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="col-span-full text-center text-muted-foreground py-16">
                No hay categorías en el portafolio aún.
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Back + Subcategory filters */}
            <div className="mb-8">
              <button onClick={() => { setSelectedCat(null); setSelectedSub(null); }} className="text-sm text-primary hover:underline mb-4 inline-block">
                ← Volver al portafolio
              </button>
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">{selectedCat.name}</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSub(null)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!selectedSub ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                >
                  Todas
                </button>
                {subcategories.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSub(s.id)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedSub === s.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((img, i) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="aspect-square rounded-xl overflow-hidden cursor-pointer border border-border hover:border-primary/30 transition-all"
                  onClick={() => setLightbox(i)}
                >
                  <img src={img.image_url} alt={img.alt_text || ""} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </motion.div>
              ))}
              {filteredImages.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-16">
                  No hay imágenes en esta categoría.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-foreground hover:text-primary z-10"><X className="w-8 h-8" /></button>
          <button onClick={(e) => { e.stopPropagation(); setLightbox(Math.max(0, lightbox - 1)); }} className="absolute left-4 text-foreground hover:text-primary z-10"><ChevronLeft className="w-8 h-8" /></button>
          <button onClick={(e) => { e.stopPropagation(); setLightbox(Math.min(filteredImages.length - 1, lightbox + 1)); }} className="absolute right-4 text-foreground hover:text-primary z-10"><ChevronRight className="w-8 h-8" /></button>
          <img
            src={filteredImages[lightbox]?.image_url}
            alt={filteredImages[lightbox]?.alt_text || ""}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Portfolio;
