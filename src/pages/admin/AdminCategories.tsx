import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, X, Search, Upload, ImageIcon, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";
import CoverGenerator from "@/components/admin/CoverGenerator";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import SortableItem from "@/components/admin/SortableItem";
import { handleDragEnd } from "@/hooks/useDndReorder";
import GridEditor, { GridItem } from "@/components/admin/GridEditor";

type Category = {
  id: string; name: string; slug: string; description: string | null;
  cover_image: string | null; icon: string | null; order: number;
  grid_row: number | null; grid_col: number | null;
};

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", icon: "", order: 0, cover_image: "" });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "grid">("cards");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const fetchCategories = async () => {
    const { data } = await supabase.from("portfolio_categories").select("*").order("order");
    if (data) setCategories(data as Category[]);
  };

  useEffect(() => { fetchCategories(); }, []);

  const filtered = categories
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.order - b.order);

  const persistOrder = async (reordered: Category[]) => {
    await Promise.all(reordered.map(c => supabase.from("portfolio_categories").update({ order: c.order }).eq("id", c.id)));
    toast.success("Orden actualizado");
  };

  const onDragEnd = (event: DragEndEvent) => {
    handleDragEnd(event, filtered, (updated) => {
      const map = new Map(updated.map(u => [u.id, u.order]));
      setCategories(prev => prev.map(c => map.has(c.id) ? { ...c, order: map.get(c.id)! } : c));
    }, persistOrder);
  };

  const onGridUpdatePosition = async (itemId: string, row: number | null, col: number | null) => {
    await supabase.from("portfolio_categories").update({ grid_row: row, grid_col: col }).eq("id", itemId);
    setCategories(prev => prev.map(c => c.id === itemId ? { ...c, grid_row: row, grid_col: col } : c));
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", icon: "", order: categories.length, cover_image: "" });
    setCoverFile(null); setCoverPreview(null);
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || "", icon: cat.icon || "", order: cat.order, cover_image: cat.cover_image || "" });
    setCoverFile(null); setCoverPreview(cat.cover_image || null);
    setShowForm(true);
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const uploadCover = async (): Promise<string | null> => {
    if (!coverFile) return form.cover_image || null;
    const ext = coverFile.name.split(".").pop();
    const path = `covers/categories/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("portfolio").upload(path, coverFile);
    if (error) { toast.error("Error subiendo imagen"); return null; }
    const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!form.name || !form.slug) { toast.error("Nombre y slug son obligatorios"); return; }
    setUploading(true);
    const coverUrl = await uploadCover();
    const payload = { ...form, cover_image: coverUrl || null };
    if (editing) {
      const { error } = await supabase.from("portfolio_categories").update(payload).eq("id", editing.id);
      if (error) { toast.error("Error al actualizar"); setUploading(false); return; }
      toast.success("Categoría actualizada");
    } else {
      const { error } = await supabase.from("portfolio_categories").insert(payload);
      if (error) { toast.error("Error al crear"); setUploading(false); return; }
      toast.success("Categoría creada");
    }
    setUploading(false);
    setShowForm(false);
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta categoría y todo su contenido?")) return;
    await supabase.from("portfolio_categories").delete().eq("id", id);
    toast.success("Categoría eliminada");
    fetchCategories();
  };

  const gridItems: GridItem[] = filtered.map(c => ({ ...c, name: c.name }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Categorías del Portafolio</h1>
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
          <CoverGenerator
            type="category"
            items={categories.map(c => ({ id: c.id, name: c.name, cover_image: c.cover_image }))}
            onComplete={fetchCategories}
          />
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Nueva Categoría
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar categoría..."
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground"
        />
      </div>

      {viewMode === "grid" ? (
        <GridEditor
          items={gridItems}
          onUpdatePosition={onGridUpdatePosition}
        />
      ) : (
        <>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={filtered.map(c => c.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((cat) => (
                  <SortableItem key={cat.id} id={cat.id}>
                    <div className="rounded-xl border border-border bg-card overflow-hidden group">
                      <div className="aspect-[4/3] bg-secondary relative overflow-hidden">
                        {cat.cover_image ? (
                          <img src={cat.cover_image} alt={cat.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
                          </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background/90 to-transparent p-4">
                          <h3 className="font-display text-lg font-bold text-foreground">{cat.name}</h3>
                          <code className="text-xs text-muted-foreground">{cat.slug}</code>
                        </div>
                      </div>
                      <div className="p-3 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground truncate max-w-[60%]">{cat.description || "Sin descripción"}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(cat)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {filtered.length === 0 && (
            <div className="text-center text-muted-foreground py-12">{search ? "Sin resultados" : "No hay categorías creadas aún"}</div>
          )}
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-foreground">{editing ? "Editar" : "Nueva"} Categoría</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Nombre</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" placeholder="Fotografía" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" placeholder="fotografia" />
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
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium text-foreground mb-1 block">Icono</label>
                  <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" placeholder="camera" />
                </div>
                <div className="w-20">
                  <label className="text-sm font-medium text-foreground mb-1 block">Orden</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
                </div>
              </div>
              <button onClick={handleSave} disabled={uploading} className="w-full py-2.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm disabled:opacity-50">
                {uploading ? "Subiendo..." : editing ? "Actualizar" : "Crear"} Categoría
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
