import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, X, Upload, Star } from "lucide-react";
import { toast } from "sonner";

type Category = { id: string; name: string };
type Subcategory = { id: string; category_id: string; name: string };
type PortfolioImage = {
  id: string; subcategory_id: string; title: string | null; description: string | null;
  image_url: string; alt_text: string | null; order: number; is_featured: boolean;
};

const AdminImages = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [filterCat, setFilterCat] = useState("");
  const [filterSub, setFilterSub] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ subcategory_id: "", title: "", alt_text: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    const [{ data: cats }, { data: subs }] = await Promise.all([
      supabase.from("portfolio_categories").select("id, name").order("order"),
      supabase.from("portfolio_subcategories").select("id, category_id, name").order("order"),
    ]);
    if (cats) setCategories(cats);
    if (subs) setSubcategories(subs);
  };

  const fetchImages = async () => {
    let query = supabase.from("portfolio_images").select("*").order("order");
    if (filterSub) query = query.eq("subcategory_id", filterSub);
    const { data } = await query;
    if (data) setImages(data);
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { fetchImages(); }, [filterSub]);

  const filteredSubs = filterCat ? subcategories.filter(s => s.category_id === filterCat) : subcategories;

  const handleUpload = async () => {
    const files = fileRef.current?.files;
    if (!files?.length || !uploadForm.subcategory_id) { toast.error("Selecciona subcategoría y archivos"); return; }

    setUploading(true);
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
      });
    }

    toast.success("Imágenes subidas correctamente");
    setUploading(false);
    setShowUpload(false);
    fetchImages();
  };

  const handleDelete = async (img: PortfolioImage) => {
    if (!confirm("¿Eliminar esta imagen?")) return;
    // Try to delete from storage
    const url = new URL(img.image_url);
    const storagePath = url.pathname.split("/portfolio/")[1];
    if (storagePath) await supabase.storage.from("portfolio").remove([storagePath]);
    await supabase.from("portfolio_images").delete().eq("id", img.id);
    toast.success("Imagen eliminada");
    fetchImages();
  };

  const toggleFeatured = async (img: PortfolioImage) => {
    await supabase.from("portfolio_images").update({ is_featured: !img.is_featured }).eq("id", img.id);
    fetchImages();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Galería de Imágenes</h1>
        <button onClick={() => { setShowUpload(true); setUploadForm({ subcategory_id: subcategories[0]?.id || "", title: "", alt_text: "" }); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
          <Upload className="w-4 h-4" /> Subir Imágenes
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select value={filterCat} onChange={(e) => { setFilterCat(e.target.value); setFilterSub(""); }} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm">
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterSub} onChange={(e) => setFilterSub(e.target.value)} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm">
          <option value="">Todas las subcategorías</option>
          {filteredSubs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {images.map((img) => (
          <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-card">
            <img src={img.image_url} alt={img.alt_text || ""} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button onClick={() => toggleFeatured(img)} className={`p-2 rounded-lg ${img.is_featured ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"}`}>
                <Star className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(img)} className="p-2 rounded-lg bg-destructive text-destructive-foreground">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            {img.is_featured && (
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                <Star className="w-3 h-3 text-accent-foreground" />
              </div>
            )}
          </div>
        ))}
        {images.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-16">
            No hay imágenes. Selecciona una subcategoría o sube nuevas imágenes.
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-foreground">Subir Imágenes</h2>
              <button onClick={() => setShowUpload(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
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
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Archivos</label>
                <input ref={fileRef} type="file" accept="image/*" multiple className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-semibold file:text-sm" />
              </div>
              <button onClick={handleUpload} disabled={uploading} className="w-full py-2.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm disabled:opacity-50">
                {uploading ? "Subiendo..." : "Subir Imágenes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminImages;
