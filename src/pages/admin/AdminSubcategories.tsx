import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, X, Search, Eye, EyeOff, Upload, ImageIcon, LayoutGrid, List } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import CoverGenerator from "@/components/admin/CoverGenerator";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import SortableItem from "@/components/admin/SortableItem";
import { handleDragEnd } from "@/hooks/useDndReorder";
import GridEditor, { GridItem } from "@/components/admin/GridEditor";

type Category = { id: string; name: string };
type Subcategory = {
  id: string; category_id: string; name: string; description: string | null;
  cover_image: string | null; cover_position: string; icon: string | null; order: number; gallery_style: string | null;
  grid_row: number | null; grid_col: number | null; is_visible: boolean;
  portfolio_categories?: Category;
};

const AdminSubcategories = () => {
  const navigate = useNavigate();
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCat, setFilterCat] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Subcategory | null>(null);
  const [form, setForm] = useState({ category_id: "", name: "", description: "", icon: "", order: 0, gallery_style: "grid", cover_position: "center" });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "grid">("cards");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const fetchData = async () => {
    const [{ data: cats }, { data: subs }] = await Promise.all([
      supabase.from("portfolio_categories").select("id, name").order("order"),
      supabase.from("portfolio_subcategories").select("*, portfolio_categories(id, name)").order("order"),
    ]);
    if (cats) setCategories(cats);
    if (subs) setSubcategories(subs as any);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = subcategories
    .filter(s => !filterCat || s.category_id === filterCat)
    .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.portfolio_categories?.name || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.order - b.order);

  const persistOrder = async (reordered: Subcategory[]) => {
    await Promise.all(reordered.map(s => supabase.from("portfolio_subcategories").update({ order: s.order }).eq("id", s.id)));
    toast.success("Orden actualizado");
  };

  const onDragEnd = (event: DragEndEvent) => {
    handleDragEnd(event, filtered, (updated) => {
      const map = new Map(updated.map(u => [u.id, u.order]));
      setSubcategories(prev => prev.map(s => map.has(s.id) ? { ...s, order: map.get(s.id)! } : s));
    }, persistOrder);
  };

  const onGridUpdatePosition = async (itemId: string, row: number | null, col: number | null) => {
    await supabase.from("portfolio_subcategories").update({ grid_row: row, grid_col: col }).eq("id", itemId);
    setSubcategories(prev => prev.map(s => s.id === itemId ? { ...s, grid_row: row, grid_col: col } : s));
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ category_id: categories[0]?.id || "", name: "", description: "", icon: "", order: 0, gallery_style: "grid", cover_position: "center" });
    setCoverFile(null); setCoverPreview(null);
    setShowForm(true);
  };

  const openEdit = (s: Subcategory) => {
    setEditing(s);
    setForm({ category_id: s.category_id, name: s.name, description: s.description || "", icon: s.icon || "", order: s.order, gallery_style: s.gallery_style || "grid", cover_position: s.cover_position || "center" });
    setCoverFile(null); setCoverPreview(s.cover_image || null);
    setShowForm(true);
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const uploadCover = async (): Promise<string | null> => {
    if (!coverFile) return editing?.cover_image || null;
    const ext = coverFile.name.split(".").pop();
    const path = `covers/subcategories/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("portfolio").upload(path, coverFile);
    if (error) { toast.error("Error subiendo imagen"); return null; }
    const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!form.name || !form.category_id) { toast.error("Campos obligatorios"); return; }
    setUploading(true);
    const coverUrl = await uploadCover();
    const payload = { ...form, cover_image: coverUrl || null };
    if (editing) {
      await supabase.from("portfolio_subcategories").update(payload).eq("id", editing.id);
      toast.success("Subcategoría actualizada");
    } else {
      await supabase.from("portfolio_subcategories").insert(payload);
      toast.success("Subcategoría creada");
    }
    setUploading(false);
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar?")) return;
    await supabase.from("portfolio_subcategories").delete().eq("id", id);
    toast.success("Eliminada");
    fetchData();
  };

  const toggleVisibility = async (id: string, visible: boolean) => {
    const { error } = await supabase.from("portfolio_subcategories").update({ is_visible: visible }).eq("id", id);
    if (error) { toast.error("Error al actualizar"); return; }
    setSubcategories(prev => prev.map(s => s.id === id ? { ...s, is_visible: visible } : s));
    toast.success(visible ? "Subcategoría visible" : "Subcategoría oculta");
  };

  const galleryLabels: Record<string, string> = { grid: "Grid", masonry: "Masonry", carousel: "Carousel" };

  const gridItems: GridItem[] = filtered.map(s => ({ ...s, name: s.name }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Subcategorías</h1>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button onClick={() => setViewMode("cards")} className={`p-2 transition-colors ${viewMode === "cards" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`} title="Vista tarjetas">
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode("grid")} className={`p-2 transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`} title="Vista cuadrícula libre">
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <CoverGenerator
            type="subcategory"
            items={subcategories.map(s => ({ id: s.id, name: s.name, cover_image: s.cover_image, categoryName: s.portfolio_categories?.name }))}
            onComplete={fetchData}
          />
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Nueva Subcategoría
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm">
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar subcategoría..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {viewMode === "grid" ? (
        <GridEditor
          items={gridItems}
          onUpdatePosition={onGridUpdatePosition}
          renderBadge={(item) => (
            <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px]">{(item as any).portfolio_categories?.name}</span>
          )}
        />
      ) : (
        <>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={filtered.map(s => s.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((s) => (
                  <SortableItem key={s.id} id={s.id}>
                    <div className="rounded-xl border border-border bg-card overflow-hidden group cursor-pointer" onClick={() => navigate(`/admin/images?subcategory=${s.id}`)}>
                      <div className="aspect-[4/3] bg-secondary relative overflow-hidden">
                        {s.cover_image ? (
                          <img src={s.cover_image} alt={s.name} className="w-full h-full object-cover" style={{ objectPosition: s.cover_position || 'center' }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
                          </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background/90 to-transparent p-4">
                          <h3 className="font-display text-lg font-bold text-foreground">{s.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">{s.portfolio_categories?.name}</span>
                            <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-xs">{galleryLabels[s.gallery_style || "grid"]}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground truncate max-w-[40%] flex items-center gap-1">{s.description || "Sin descripción"}</span>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1 mr-1">
                            {s.is_visible ? <Eye className="w-3.5 h-3.5 text-muted-foreground" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                            <Switch checked={s.is_visible} onCheckedChange={(v) => toggleVisibility(s.id, v)} />
                          </div>
                          <button onClick={() => openEdit(s)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {filtered.length === 0 && (
            <div className="text-center text-muted-foreground py-12">{search || filterCat ? "Sin resultados" : "No hay subcategorías"}</div>
          )}
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-foreground">{editing ? "Editar" : "Nueva"} Subcategoría</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Categoría</label>
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Nombre</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Descripción</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" rows={2} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Imagen de portada</label>
                <div className="flex items-center gap-3">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover" className="w-16 h-16 rounded-lg object-cover border border-border" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-secondary border border-border flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground cursor-pointer hover:bg-secondary/80">
                    <Upload className="w-4 h-4" /> Subir imagen
                    <input type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" />
                  </label>
                </div>
              </div>
              {coverPreview && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Encuadre de imagen</label>
                  <div className="flex items-start gap-4">
                    <div className="relative w-28 h-20 rounded-lg overflow-hidden border border-border shrink-0">
                      <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" style={{ objectPosition: form.cover_position }} />
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { label: "↖", value: "top left" },
                        { label: "↑", value: "top center" },
                        { label: "↗", value: "top right" },
                        { label: "←", value: "center left" },
                        { label: "•", value: "center" },
                        { label: "→", value: "center right" },
                        { label: "↙", value: "bottom left" },
                        { label: "↓", value: "bottom center" },
                        { label: "↘", value: "bottom right" },
                      ].map(pos => (
                        <button
                          key={pos.value}
                          type="button"
                          onClick={() => setForm({ ...form, cover_position: pos.value })}
                          className={`w-8 h-8 rounded text-xs font-bold transition-colors ${form.cover_position === pos.value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"}`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium text-foreground mb-1 block">Estilo galería</label>
                  <select value={form.gallery_style} onChange={(e) => setForm({ ...form, gallery_style: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm">
                    <option value="grid">Grid</option>
                    <option value="masonry">Masonry</option>
                    <option value="carousel">Carousel</option>
                  </select>
                </div>
                <div className="w-20">
                  <label className="text-sm font-medium text-foreground mb-1 block">Orden</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
                </div>
              </div>
              <button onClick={handleSave} disabled={uploading} className="w-full py-2.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm disabled:opacity-50">
                {uploading ? "Subiendo..." : editing ? "Actualizar" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubcategories;
