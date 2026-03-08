import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

type Category = { id: string; name: string };
type Subcategory = {
  id: string; category_id: string; name: string; description: string | null;
  cover_image: string | null; icon: string | null; order: number; gallery_style: string | null;
  portfolio_categories?: Category;
};

const AdminSubcategories = () => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCat, setFilterCat] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Subcategory | null>(null);
  const [form, setForm] = useState({ category_id: "", name: "", description: "", icon: "", order: 0, gallery_style: "grid" });

  const fetchData = async () => {
    const [{ data: cats }, { data: subs }] = await Promise.all([
      supabase.from("portfolio_categories").select("id, name").order("order"),
      supabase.from("portfolio_subcategories").select("*, portfolio_categories(id, name)").order("order"),
    ]);
    if (cats) setCategories(cats);
    if (subs) setSubcategories(subs as any);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = filterCat ? subcategories.filter(s => s.category_id === filterCat) : subcategories;

  const openCreate = () => {
    setEditing(null);
    setForm({ category_id: categories[0]?.id || "", name: "", description: "", icon: "", order: 0, gallery_style: "grid" });
    setShowForm(true);
  };

  const openEdit = (s: Subcategory) => {
    setEditing(s);
    setForm({ category_id: s.category_id, name: s.name, description: s.description || "", icon: s.icon || "", order: s.order, gallery_style: s.gallery_style || "grid" });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.category_id) { toast.error("Campos obligatorios"); return; }
    if (editing) {
      await supabase.from("portfolio_subcategories").update(form).eq("id", editing.id);
      toast.success("Subcategoría actualizada");
    } else {
      await supabase.from("portfolio_subcategories").insert(form);
      toast.success("Subcategoría creada");
    }
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar?")) return;
    await supabase.from("portfolio_subcategories").delete().eq("id", id);
    toast.success("Eliminada");
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Subcategorías</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Nueva Subcategoría
        </button>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm">
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50">
            <tr>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Nombre</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Categoría</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Descripción</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Estilo</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Orden</th>
              <th className="text-right px-4 py-3 text-muted-foreground font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-t border-border hover:bg-secondary/20">
                <td className="px-4 py-3 text-foreground font-medium">{s.name}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{(s as any).portfolio_categories?.name}</span></td>
                <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">{s.description || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.gallery_style}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.order}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive ml-1"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center text-muted-foreground py-8">No hay subcategorías</td></tr>
            )}
          </tbody>
        </table>
      </div>

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
              <button onClick={handleSave} className="w-full py-2.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm">
                {editing ? "Actualizar" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubcategories;
