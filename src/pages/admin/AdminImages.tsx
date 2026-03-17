import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, X, Upload, Star, Video, Image, Globe, Link, LayoutGrid, Columns, GalleryHorizontal, ChevronLeft, ChevronRight, List, Zap, Loader2, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import GalleryGenerator from "@/components/admin/GalleryGenerator";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import SortableItem from "@/components/admin/SortableItem";
import { handleDragEnd } from "@/hooks/useDndReorder";
import GridEditor, { GridItem } from "@/components/admin/GridEditor";
import { Progress } from "@/components/ui/progress";

type Category = { id: string; name: string };
type Subcategory = { id: string; category_id: string; name: string; gallery_style: string | null };
type PortfolioImage = {
  id: string; subcategory_id: string; title: string | null; description: string | null;
  image_url: string; alt_text: string | null; order: number; is_featured: boolean;
  media_type: string; video_url: string | null; thumbnail_url: string | null;
  grid_row: number | null; grid_col: number | null;
};

type MediaMode = "image" | "video" | "iframe";

/** Extract YouTube video ID from common URL formats */
const getYouTubeId = (url: string): string | null => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/);
  return match ? match[1] : null;
};

/** Get the best available YouTube thumbnail URL */
const getYouTubeThumbnail = (videoId: string): string =>
  `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

const AdminImages = () => {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [filterCat, setFilterCat] = useState("");
  const [filterSub, setFilterSub] = useState(searchParams.get("subcategory") || "");
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaMode, setMediaMode] = useState<MediaMode>("image");
  const [uploadForm, setUploadForm] = useState({ subcategory_id: "", title: "", alt_text: "", video_url: "", thumbnail_url: "" });
  const fileRef = useRef<HTMLInputElement>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "grid">("cards");
  const [fullscreenIframe, setFullscreenIframe] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Optimizer state
  const [optimizing, setOptimizing] = useState(false);
  const [optProgress, setOptProgress] = useState(0);
  const [optTotal, setOptTotal] = useState(0);
  const [optSaved, setOptSaved] = useState(0);

  const extractStoragePath = (url: string): { bucket: string; path: string } | null => {
    try {
      const u = new URL(url);
      const portfolioMatch = u.pathname.split("/portfolio/");
      if (portfolioMatch[1]) return { bucket: "portfolio", path: decodeURIComponent(portfolioMatch[1]) };
      const socialMatch = u.pathname.split("/social-media-assets/");
      if (socialMatch[1]) return { bucket: "social-media-assets", path: decodeURIComponent(socialMatch[1]) };
    } catch {}
    return null;
  };

  const optimizeGalleryImages = async () => {
    const imageItems = images.filter(img => img.media_type === "image");
    if (imageItems.length === 0) { toast.error("No hay imágenes para optimizar"); return; }

    const filesToOptimize = imageItems
      .map(img => extractStoragePath(img.image_url))
      .filter(Boolean) as { bucket: string; path: string }[];

    if (filesToOptimize.length === 0) { toast.error("No se encontraron rutas de almacenamiento"); return; }

    setOptimizing(true);
    setOptProgress(0);
    setOptTotal(filesToOptimize.length);
    setOptSaved(0);

    const BATCH = 1;
    let processed = 0;
    let totalSaved = 0;

    for (let i = 0; i < filesToOptimize.length; i += BATCH) {
      const batch = filesToOptimize.slice(i, i + BATCH);
      try {
        const { data, error } = await supabase.functions.invoke("optimize-images", {
          body: { action: "optimize", files: batch },
        });
        if (!error && data?.results) {
          for (const r of data.results) {
            if (r.status === "optimized" && r.original_size && r.optimized_size) {
              totalSaved += r.original_size - r.optimized_size;
            }
          }
        }
      } catch {}
      processed += batch.length;
      setOptProgress(processed);
      setOptSaved(totalSaved);
    }

    setOptimizing(false);
    const formatSize = (b: number) => b < 1024 * 1024 ? (b / 1024).toFixed(1) + " KB" : (b / (1024 * 1024)).toFixed(1) + " MB";
    toast.success(`Optimización completada. Ahorro: ${formatSize(totalSaved)}`);
  };

  const persistImageOrder = async (reordered: PortfolioImage[]) => {
    await Promise.all(reordered.map(img => supabase.from("portfolio_images").update({ order: img.order }).eq("id", img.id)));
    toast.success("Orden actualizado");
  };

  const onImageDragEnd = (event: DragEndEvent) => {
    handleDragEnd(event, images, (updated) => setImages(updated), persistImageOrder);
  };

  const onGridUpdatePosition = async (itemId: string, row: number | null, col: number | null) => {
    await supabase.from("portfolio_images").update({ grid_row: row, grid_col: col }).eq("id", itemId);
    setImages(prev => prev.map(img => img.id === itemId ? { ...img, grid_row: row, grid_col: col } : img));
  };

  const fetchData = async () => {
    const [{ data: cats }, { data: subs }] = await Promise.all([
      supabase.from("portfolio_categories").select("id, name").order("order"),
      supabase.from("portfolio_subcategories").select("id, category_id, name, gallery_style").order("order"),
    ]);
    if (cats) setCategories(cats);
    if (subs) setSubcategories(subs);
  };

  const fetchImages = async () => {
    let query = supabase.from("portfolio_images").select("*").order("order");
    if (filterSub) query = query.eq("subcategory_id", filterSub);
    const { data } = await query;
    if (data) {
      // Auto-fix YouTube videos missing thumbnails
      const toFix = (data as PortfolioImage[]).filter(
        img => img.media_type === "video" && img.video_url && !img.thumbnail_url && getYouTubeId(img.video_url)
      );
      if (toFix.length > 0) {
        await Promise.all(toFix.map(img => {
          const thumb = getYouTubeThumbnail(getYouTubeId(img.video_url!)!);
          return supabase.from("portfolio_images").update({ thumbnail_url: thumb, image_url: thumb }).eq("id", img.id);
        }));
        // Re-fetch after fix
        const { data: refreshed } = await query;
        if (refreshed) { setImages(refreshed as PortfolioImage[]); return; }
      }
      setImages(data as PortfolioImage[]);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    // Auto-set category filter when subcategory comes from URL
    if (filterSub && subcategories.length > 0 && !filterCat) {
      const sub = subcategories.find(s => s.id === filterSub);
      if (sub) setFilterCat(sub.category_id);
    }
  }, [filterSub, subcategories]);
  useEffect(() => { fetchImages(); }, [filterSub]);

  const filteredSubs = filterCat ? subcategories.filter(s => s.category_id === filterCat) : subcategories;

  const handleUpload = async () => {
    if (!uploadForm.subcategory_id) { toast.error("Selecciona una subcategoría"); return; }

    setUploading(true);

    if (mediaMode === "image") {
      const files = fileRef.current?.files;
      if (!files?.length) { toast.error("Selecciona archivos"); setUploading(false); return; }
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const path = `${uploadForm.subcategory_id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("portfolio").upload(path, file);
        if (uploadError) { toast.error(`Error subiendo ${file.name}`); continue; }
        const { data: { publicUrl } } = supabase.storage.from("portfolio").getPublicUrl(path);
        await supabase.from("portfolio_images").insert({
          subcategory_id: uploadForm.subcategory_id,
          image_url: publicUrl,
          title: uploadForm.title || file.name,
          alt_text: uploadForm.alt_text || file.name,
          order: images.length,
          media_type: "image",
        });
      }
    } else if (mediaMode === "video") {
      // Video: either upload file or provide URL
      const files = fileRef.current?.files;
      if (files?.length) {
        for (const file of Array.from(files)) {
          const ext = file.name.split(".").pop();
          const path = `${uploadForm.subcategory_id}/video-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { error: uploadError } = await supabase.storage.from("portfolio").upload(path, file);
          if (uploadError) { toast.error(`Error subiendo ${file.name}`); continue; }
          const { data: { publicUrl } } = supabase.storage.from("portfolio").getPublicUrl(path);
          await supabase.from("portfolio_images").insert({
            subcategory_id: uploadForm.subcategory_id,
            image_url: uploadForm.thumbnail_url || publicUrl,
            video_url: publicUrl,
            title: uploadForm.title || file.name,
            alt_text: uploadForm.alt_text || file.name,
            order: images.length,
            media_type: "video",
            thumbnail_url: uploadForm.thumbnail_url || null,
          });
        }
      } else if (uploadForm.video_url) {
        // Auto-detect YouTube thumbnail if no custom thumbnail provided
        const ytId = getYouTubeId(uploadForm.video_url);
        const autoThumb = !uploadForm.thumbnail_url && ytId ? getYouTubeThumbnail(ytId) : uploadForm.thumbnail_url || null;
        await supabase.from("portfolio_images").insert({
          subcategory_id: uploadForm.subcategory_id,
          image_url: autoThumb || "/placeholder.svg",
          video_url: uploadForm.video_url,
          title: uploadForm.title || "Video",
          alt_text: uploadForm.alt_text || "Video",
          order: images.length,
          media_type: "video",
          thumbnail_url: autoThumb,
        });
      } else {
        toast.error("Proporciona un archivo de vídeo o un enlace");
        setUploading(false);
        return;
      }
    } else if (mediaMode === "iframe") {
      if (!uploadForm.video_url) { toast.error("Proporciona el enlace del tour virtual"); setUploading(false); return; }
      await supabase.from("portfolio_images").insert({
        subcategory_id: uploadForm.subcategory_id,
        image_url: uploadForm.thumbnail_url || "/placeholder.svg",
        video_url: uploadForm.video_url,
        title: uploadForm.title || "Tour Virtual",
        alt_text: uploadForm.alt_text || "Tour Virtual",
        order: images.length,
        media_type: "iframe",
        thumbnail_url: uploadForm.thumbnail_url || null,
      });
    }

    toast.success("Contenido añadido correctamente");
    setUploading(false);
    setShowUpload(false);
    // Update filter to show the subcategory where content was uploaded
    if (uploadForm.subcategory_id !== filterSub) {
      setFilterSub(uploadForm.subcategory_id);
    } else {
      fetchImages();
    }
  };

  const handleDelete = async (img: PortfolioImage) => {
    if (!confirm("¿Eliminar este elemento?")) return;
    try {
      const url = new URL(img.image_url);
      const storagePath = url.pathname.split("/portfolio/")[1];
      if (storagePath) await supabase.storage.from("portfolio").remove([storagePath]);
    } catch {}
    if (img.video_url) {
      try {
        const url = new URL(img.video_url);
        const storagePath = url.pathname.split("/portfolio/")[1];
        if (storagePath) await supabase.storage.from("portfolio").remove([storagePath]);
      } catch {}
    }
    await supabase.from("portfolio_images").delete().eq("id", img.id);
    toast.success("Eliminado");
    fetchImages();
  };

  const toggleFeatured = async (img: PortfolioImage) => {
    await supabase.from("portfolio_images").update({ is_featured: !img.is_featured }).eq("id", img.id);
    fetchImages();
  };

  const mediaIcon = (type: string) => {
    if (type === "video") return <Video className="w-3 h-3" />;
    if (type === "iframe") return <Globe className="w-3 h-3" />;
    return <Image className="w-3 h-3" />;
  };

  const mediaColor = (type: string) => {
    if (type === "video") return "bg-blue-500/80";
    if (type === "iframe") return "bg-emerald-500/80";
    return "bg-primary/80";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Galería de Contenidos</h1>
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button onClick={() => setViewMode("cards")} className={`p-2 transition-colors ${viewMode === "cards" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`} title="Vista tarjetas">
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode("grid")} className={`p-2 transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`} title="Vista cuadrícula libre">
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          {filterSub && (() => {
            const currentSub = subcategories.find(s => s.id === filterSub);
            const cat = currentSub ? categories.find(c => c.id === currentSub.category_id) : null;
            return currentSub ? (
              <GalleryGenerator
                subcategoryId={filterSub}
                subcategoryName={currentSub.name}
                categoryName={cat?.name || ""}
                onComplete={fetchImages}
              />
            ) : null;
          })()}
          {images.length > 0 && (
            <button
              onClick={optimizeGalleryImages}
              disabled={optimizing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/30 bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors disabled:opacity-50"
              title="Optimizar imágenes a máx. 1920px"
            >
              {optimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {optimizing ? `${optProgress}/${optTotal}` : "Optimizar"}
            </button>
          )}
          <button onClick={() => { setShowUpload(true); setMediaMode("image"); setUploadForm({ subcategory_id: filterSub || subcategories[0]?.id || "", title: "", alt_text: "", video_url: "", thumbnail_url: "" }); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
            <Upload className="w-4 h-4" /> Añadir Contenido
          </button>
        </div>
      </div>

      {/* Optimization progress bar */}
      {optimizing && (
        <div className="mb-4 p-3 rounded-xl bg-secondary/50 border border-border space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Optimizando imágenes...
            </span>
            <span className="text-foreground font-medium">{optProgress} / {optTotal}</span>
          </div>
          <Progress value={(optProgress / optTotal) * 100} className="h-2" />
          {optSaved > 0 && (
            <p className="text-xs text-primary">
              Ahorro: {optSaved < 1024 * 1024 ? (optSaved / 1024).toFixed(1) + " KB" : (optSaved / (1024 * 1024)).toFixed(1) + " MB"}
            </p>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={filterCat} onChange={(e) => { setFilterCat(e.target.value); setFilterSub(""); }} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm">
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterSub} onChange={(e) => setFilterSub(e.target.value)} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm">
          <option value="">Todas las subcategorías</option>
          {filteredSubs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Gallery style selector */}
      {filterSub && (() => {
        const currentSub = subcategories.find(s => s.id === filterSub);
        if (!currentSub) return null;
        const currentStyle = currentSub.gallery_style || "grid";
        const styles = [
          { value: "grid", label: "Grid", icon: <LayoutGrid className="w-4 h-4" /> },
          { value: "masonry", label: "Masonry", icon: <Columns className="w-4 h-4" /> },
          { value: "carousel", label: "Carousel", icon: <GalleryHorizontal className="w-4 h-4" /> },
        ];
        const handleStyleChange = async (style: string) => {
          await supabase.from("portfolio_subcategories").update({ gallery_style: style }).eq("id", filterSub);
          setSubcategories(prev => prev.map(s => s.id === filterSub ? { ...s, gallery_style: style } : s));
          toast.success("Estilo de galería actualizado");
        };
        return (
          <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-secondary/50 border border-border">
            <span className="text-sm font-medium text-muted-foreground">Estilo de galería:</span>
            <div className="flex gap-1">
              {styles.map(s => (
                <button
                  key={s.value}
                  onClick={() => handleStyleChange(s.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentStyle === s.value ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground border border-border"}`}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {viewMode === "grid" ? (
        <GridEditor
          items={images.map(img => ({ ...img, name: img.title || "Sin título" }))}
          onUpdatePosition={onGridUpdatePosition}
          renderBadge={(item) => {
            const mt = (item as any).media_type;
            return mt !== "image" ? (
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-white ${mt === "video" ? "bg-blue-500/80" : "bg-emerald-500/80"}`}>
                {mt === "video" ? "Video" : "Tour"}
              </span>
            ) : null;
          }}
        />
      ) : (
        <>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onImageDragEnd}>
            <SortableContext items={images.map(img => img.id)} strategy={rectSortingStrategy}>
              <div className="flex flex-wrap gap-3">
                {images.map((img, idx) => (
                  <SortableItem key={img.id} id={img.id} className="h-auto">
                    <div className="group relative rounded-xl overflow-hidden border border-border bg-card flex-shrink-0">
                      {img.media_type === "iframe" && img.video_url ? (
                        <div className="flex flex-col">
                          <div className="relative h-48 w-64">
                            <iframe
                              src={img.video_url}
                              className="w-full h-full border-0 pointer-events-none"
                              title={img.alt_text || img.title || "Tour virtual"}
                            />
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); setFullscreenIframe(img.video_url!); }}
                            className="flex items-center justify-center gap-2 py-2 bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
                          >
                            <Maximize2 className="w-3.5 h-3.5" /> Maximizar
                          </button>
                        </div>
                      ) : (
                        <div className="h-48 cursor-pointer" onClick={() => setLightboxIdx(idx)}>
                          <img src={img.thumbnail_url || img.image_url} alt={img.alt_text || ""} className="h-full w-auto object-cover pointer-events-none select-none" draggable={false} onContextMenu={(e) => e.preventDefault()} />
                        </div>
                      )}
                      <div className={`absolute top-2 left-10 ${mediaColor(img.media_type)} text-white rounded-full p-1.5 flex items-center gap-1`}>
                        {mediaIcon(img.media_type)}
                      </div>
                      <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                        <div className="pointer-events-auto flex gap-2">
                          <button onClick={(e) => { e.stopPropagation(); toggleFeatured(img); }} className={`p-2 rounded-lg ${img.is_featured ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"}`}>
                            <Star className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(img); }} className="p-2 rounded-lg bg-destructive text-destructive-foreground">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {img.is_featured && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                          <Star className="w-3 h-3 text-accent-foreground" />
                        </div>
                      )}
                    </div>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {images.length === 0 && (
            <div className="w-full text-center text-muted-foreground py-16">
              No hay contenido. Selecciona una subcategoría o añade nuevo contenido.
            </div>
          )}
        </>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-foreground">Añadir Contenido</h2>
              <button onClick={() => setShowUpload(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              {/* Media type selector */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Tipo de contenido</label>
                <div className="flex gap-2">
                  {([["image", "Imagen", <Image key="i" className="w-4 h-4" />], ["video", "Vídeo", <Video key="v" className="w-4 h-4" />], ["iframe", "Tour/iFrame", <Globe key="g" className="w-4 h-4" />]] as const).map(([type, label, icon]) => (
                    <button
                      key={type}
                      onClick={() => setMediaMode(type as MediaMode)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${mediaMode === type ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                    >
                      {icon} {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Categoría</label>
                <select
                  value={filterCat}
                  onChange={(e) => { setFilterCat(e.target.value); setUploadForm({ ...uploadForm, subcategory_id: "" }); }}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm"
                >
                  <option value="">Seleccionar categoría...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Subcategoría</label>
                <select value={uploadForm.subcategory_id} onChange={(e) => setUploadForm({ ...uploadForm, subcategory_id: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm">
                  <option value="">Seleccionar...</option>
                  {filteredSubs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Título (opcional)</label>
                <input value={uploadForm.title} onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
              </div>

              {/* Conditional fields by media type */}
              {mediaMode === "image" && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Archivos de imagen</label>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-semibold file:text-sm" />
                </div>
              )}

              {mediaMode === "video" && (
                <>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Archivo de vídeo (opcional)</label>
                    <input ref={fileRef} type="file" accept="video/*" className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-semibold file:text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block flex items-center gap-1"><Link className="w-3 h-3" /> O enlace de vídeo (YouTube, Vimeo...)</label>
                    <input value={uploadForm.video_url} onChange={(e) => setUploadForm({ ...uploadForm, video_url: e.target.value })} placeholder="https://youtube.com/watch?v=..." className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Miniatura (URL, opcional)</label>
                    <input value={uploadForm.thumbnail_url} onChange={(e) => setUploadForm({ ...uploadForm, thumbnail_url: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
                  </div>
                </>
              )}

              {mediaMode === "iframe" && (
                <>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block flex items-center gap-1"><Globe className="w-3 h-3" /> Enlace del tour virtual / iFrame</label>
                    <input value={uploadForm.video_url} onChange={(e) => setUploadForm({ ...uploadForm, video_url: e.target.value })} placeholder="https://my.matterport.com/show/?m=..." className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Miniatura (URL, opcional)</label>
                    <input value={uploadForm.thumbnail_url} onChange={(e) => setUploadForm({ ...uploadForm, thumbnail_url: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
                  </div>
                </>
              )}

              <button onClick={handleUpload} disabled={uploading} className="w-full py-2.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm disabled:opacity-50">
                {uploading ? "Subiendo..." : "Añadir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && images[lightboxIdx] && (
        <div className="fixed inset-0 z-50 bg-background/90 flex items-center justify-center" onClick={() => setLightboxIdx(null)}>
          <button onClick={() => setLightboxIdx(null)} className="absolute top-4 right-4 p-2 rounded-full bg-secondary text-foreground hover:bg-secondary/80 z-10">
            <X className="w-6 h-6" />
          </button>
          {lightboxIdx > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1); }} className="absolute left-4 p-2 rounded-full bg-secondary text-foreground hover:bg-secondary/80 z-10">
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {lightboxIdx < images.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1); }} className="absolute right-4 p-2 rounded-full bg-secondary text-foreground hover:bg-secondary/80 z-10">
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
          <div className="max-w-[90vw] max-h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {images[lightboxIdx].media_type === "image" ? (
              <img src={images[lightboxIdx].image_url} alt={images[lightboxIdx].alt_text || ""} className="max-w-full max-h-[80vh] object-contain rounded-lg select-none pointer-events-auto" draggable={false} onContextMenu={(e) => e.preventDefault()} />
            ) : images[lightboxIdx].media_type === "video" ? (
              <video src={images[lightboxIdx].video_url || images[lightboxIdx].image_url} controls controlsList="nodownload" className="max-w-full max-h-[80vh] rounded-lg" onContextMenu={(e) => e.preventDefault()} />
            ) : (
              <iframe src={images[lightboxIdx].video_url || ""} className="w-[80vw] h-[75vh] rounded-lg border-0" allowFullScreen />
            )}
          </div>
        </div>
      )}

      {/* Fullscreen iframe */}
      {fullscreenIframe && (
        <div className="fixed inset-0 z-[60] bg-background flex flex-col">
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
    </div>
  );
};

export default AdminImages;
