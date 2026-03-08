import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Tag, Calendar, ToggleLeft, ToggleRight, Search, Upload, X, Image } from "lucide-react";
import { toast } from "sonner";

interface Promotion {
  id: string;
  title: string;
  description: string | null;
  discount_type: string;
  discount_value: number | null;
  code: string | null;
  cover_image: string | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

const AdminPromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", discount_type: "percentage", discount_value: "",
    code: "", cover_image: "", is_active: true, starts_at: "", ends_at: "",
  });

  const fetchPromotions = async () => {
    const { data } = await supabase.from("promotions").select("*").order("created_at", { ascending: false });
    setPromotions((data as Promotion[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchPromotions(); }, []);

  const openCreate = () => {
    setForm({ title: "", description: "", discount_type: "percentage", discount_value: "", code: "", cover_image: "", is_active: true, starts_at: "", ends_at: "" });
    setCreating(true);
    setEditing(null);
  };

  const openEdit = (p: Promotion) => {
    setForm({
      title: p.title, description: p.description || "", discount_type: p.discount_type,
      discount_value: p.discount_value?.toString() || "", code: p.code || "",
      cover_image: p.cover_image || "", is_active: p.is_active,
      starts_at: p.starts_at ? p.starts_at.slice(0, 16) : "",
      ends_at: p.ends_at ? p.ends_at.slice(0, 16) : "",
    });
    setEditing(p);
    setCreating(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("El título es obligatorio"); return; }
    const payload = {
      title: form.title, description: form.description || null,
      discount_type: form.discount_type,
      discount_value: form.discount_value ? parseFloat(form.discount_value) : null,
      code: form.code || null, cover_image: form.cover_image || null,
      is_active: form.is_active,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
    };

    if (editing) {
      const { error } = await supabase.from("promotions").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Promoción actualizada");
    } else {
      const { error } = await supabase.from("promotions").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Promoción creada");
    }
    setEditing(null);
    setCreating(false);
    fetchPromotions();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta promoción?")) return;
    await supabase.from("promotions").delete().eq("id", id);
    toast.success("Promoción eliminada");
    fetchPromotions();
  };

  const toggleActive = async (p: Promotion) => {
    await supabase.from("promotions").update({ is_active: !p.is_active }).eq("id", p.id);
    fetchPromotions();
  };

  const filtered = promotions.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  if (creating || editing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">{editing ? "Editar Promoción" : "Nueva Promoción"}</h1>
          <div className="flex gap-2">
            <button onClick={() => { setCreating(false); setEditing(null); }} className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm rounded-lg bg-gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">Guardar</button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Título</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Ej: 20% de descuento en fotografía" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Descripción</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" rows={3} placeholder="Detalles de la promoción..." />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Imagen (URL)</label>
              <input value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="https://..." />
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Tipo de descuento</label>
                <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Fijo (€)</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Valor</label>
                <input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="20" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Código promocional</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono" placeholder="SUMMER2026" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha inicio</label>
                <input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha fin</label>
                <input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <button type="button" onClick={() => setForm({ ...form, is_active: !form.is_active })}>
                {form.is_active ? <ToggleRight className="w-6 h-6 text-green-400" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
              </button>
              <span className="text-sm text-foreground">{form.is_active ? "Activa" : "Inactiva"}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Promociones</h1>
          <p className="text-sm text-muted-foreground">{promotions.length} promociones</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Nueva Promoción
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Buscar promociones..." />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl bg-card border border-border p-12 text-center"><p className="text-muted-foreground">No hay promociones. ¡Crea tu primera promoción!</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-xl bg-card border border-border p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate">{p.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.is_active ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"}`}>
                    {p.is_active ? "Activa" : "Inactiva"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {p.code && <span className="flex items-center gap-1 font-mono"><Tag className="w-3 h-3" />{p.code}</span>}
                  {p.discount_value && <span>{p.discount_type === "percentage" ? `${p.discount_value}%` : `${p.discount_value}€`}</span>}
                  {p.ends_at && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Hasta {new Date(p.ends_at).toLocaleDateString("es-ES")}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleActive(p)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  {p.is_active ? <ToggleRight className="w-4 h-4 text-green-400" /> : <ToggleLeft className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(p)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPromotions;
