import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, X, ArrowUp, ArrowDown, Search, SortAsc, SortDesc, ChevronUp, ChevronDown, Upload, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import CoverGenerator from "@/components/admin/CoverGenerator";

type Category = {
  id: string; name: string; slug: string; description: string | null;
  cover_image: string | null; icon: string | null; order: number;
};

type SortKey = "name" | "slug" | "order";
type SortDir = "asc" | "desc";

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", icon: "", order: 0, cover_image: "" });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("order");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  

  const fetchCategories = async () => {
    const { data } = await supabase.from("portfolio_categories").select("*").order("order");
    if (data) setCategories(data);
  };

  useEffect(() => { fetchCategories(); }, []);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = categories
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "order") return (a.order - b.order) * dir;
      return a[sortKey].localeCompare(b[sortKey]) * dir;
    });

  const moveOrder = async (cat: Category, direction: "up" | "down") => {
    const idx = filtered.findIndex(c => c.id === cat.id);
    const swapWith = direction === "up" ? filtered[idx - 1] : filtered[idx + 1];
    if (!swapWith) return;
    await Promise.all([
      supabase.from("portfolio_categories").update({ order: swapWith.order }).eq("id", cat.id),
      supabase.from("portfolio_categories").update({ order: cat.order }).eq("id", swapWith.id),
    ]);
    fetchCategories();
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

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <SortAsc className="w-3.5 h-3.5 opacity-30" />;
    return sortDir === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-primary" /> : <ChevronDown className="w-3.5 h-3.5 text-primary" />;
  };

  const missingCovers = categories.filter(c => !c.cover_image).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Categorías del Portafolio</h1>
        <div className="flex items-center gap-2">
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

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50">
            <tr>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium cursor-pointer select-none" onClick={() => toggleSort("name")}>
                <span className="flex items-center gap-1">Nombre <SortIcon col="name" /></span>
              </th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium cursor-pointer select-none" onClick={() => toggleSort("slug")}>
                <span className="flex items-center gap-1">Slug <SortIcon col="slug" /></span>
              </th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Descripción</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium cursor-pointer select-none" onClick={() => toggleSort("order")}>
                <span className="flex items-center gap-1">Orden <SortIcon col="order" /></span>
              </th>
              <th className="text-right px-4 py-3 text-muted-foreground font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((cat, idx) => (
              <tr key={cat.id} className="border-t border-border hover:bg-secondary/20">
                <td className="px-4 py-3 text-foreground font-medium">{cat.name}</td>
                <td className="px-4 py-3 text-muted-foreground"><code className="px-1.5 py-0.5 rounded bg-secondary text-xs">{cat.slug}</code></td>
                <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">{cat.description || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground w-6 text-center">{cat.order}</span>
                    <button onClick={() => moveOrder(cat, "up")} disabled={idx === 0} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-30">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => moveOrder(cat, "down")} disabled={idx === filtered.length - 1} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-30">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(cat)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive ml-1"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center text-muted-foreground py-8">{search ? "Sin resultados" : "No hay categorías creadas aún"}</td></tr>
            )}
          </tbody>
        </table>
      </div>

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
