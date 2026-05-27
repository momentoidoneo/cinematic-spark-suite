import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Upload, X, ToggleLeft, ToggleRight, ArrowUp, ArrowDown, Star } from "lucide-react";
import { toast } from "sonner";

interface Testimonial {
  id: string;
  author_name: string;
  author_role: string | null;
  author_company: string | null;
  content: string;
  rating: number;
  avatar_url: string | null;
  video_url: string | null;
  service_tag: string | null;
  order: number;
  is_visible: boolean;
  is_featured: boolean;
}

const emptyForm = {
  author_name: "", author_role: "", author_company: "", content: "",
  rating: 5, avatar_url: "", video_url: "", service_tag: "",
  is_visible: true, is_featured: false,
};

const AdminTestimonials = () => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    const { data } = await supabase.from("testimonials").select("*").order("order");
    setItems((data as Testimonial[]) || []);
    setLoading(false);
  };
  useEffect(() => { fetchItems(); }, []);

  const openCreate = () => { setForm(emptyForm); setCreating(true); setEditing(null); };
  const openEdit = (t: Testimonial) => {
    setForm({
      author_name: t.author_name, author_role: t.author_role || "", author_company: t.author_company || "",
      content: t.content, rating: t.rating, avatar_url: t.avatar_url || "", video_url: t.video_url || "",
      service_tag: t.service_tag || "", is_visible: t.is_visible, is_featured: t.is_featured,
    });
    setEditing(t); setCreating(false);
  };
  const closeForm = () => { setEditing(null); setCreating(false); setForm(emptyForm); };

  const handleSave = async () => {
    if (!form.author_name.trim() || !form.content.trim()) { toast.error("Nombre y testimonio son obligatorios"); return; }
    const payload = {
      author_name: form.author_name.trim(),
      author_role: form.author_role.trim() || null,
      author_company: form.author_company.trim() || null,
      content: form.content.trim(),
      rating: form.rating,
      avatar_url: form.avatar_url || null,
      video_url: form.video_url.trim() || null,
      service_tag: form.service_tag.trim() || null,
      is_visible: form.is_visible,
      is_featured: form.is_featured,
      order: editing ? editing.order : items.length,
    };
    const { error } = editing
      ? await supabase.from("testimonials").update(payload).eq("id", editing.id)
      : await supabase.from("testimonials").insert(payload);
    if (error) { toast.error("Error al guardar"); return; }
    toast.success(editing ? "Testimonio actualizado" : "Testimonio añadido");
    closeForm(); fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este testimonio?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    toast.success("Eliminado"); fetchItems();
  };

  const toggleVisible = async (t: Testimonial) => {
    await supabase.from("testimonials").update({ is_visible: !t.is_visible }).eq("id", t.id); fetchItems();
  };
  const toggleFeatured = async (t: Testimonial) => {
    await supabase.from("testimonials").update({ is_featured: !t.is_featured }).eq("id", t.id); fetchItems();
  };
  const move = async (t: Testimonial, dir: -1 | 1) => {
    const idx = items.findIndex(x => x.id === t.id);
    const swap = items[idx + dir]; if (!swap) return;
    await Promise.all([
      supabase.from("testimonials").update({ order: swap.order }).eq("id", t.id),
      supabase.from("testimonials").update({ order: t.order }).eq("id", swap.id),
    ]);
    fetchItems();
  };
  const handleUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `testimonials/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("portfolio").upload(path, file);
    if (error) { toast.error("Error al subir"); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("portfolio").getPublicUrl(path);
    setForm(f => ({ ...f, avatar_url: publicUrl }));
    setUploading(false);
  };

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Testimonios</h1>
          <p className="text-sm text-muted-foreground mt-1">Carrusel de prueba social en la home.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Añadir testimonio
        </button>
      </div>

      {(creating || editing) && (
        <div className="mb-6 p-5 rounded-xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">{editing ? "Editar testimonio" : "Nuevo testimonio"}</h2>
            <button onClick={closeForm} className="p-1 rounded-md hover:bg-secondary"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Nombre *</label>
                <input value={form.author_name} onChange={e => setForm({ ...form, author_name: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm" placeholder="María García" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input value={form.author_role} onChange={e => setForm({ ...form, author_role: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm" placeholder="Cargo" />
                <input value={form.author_company} onChange={e => setForm({ ...form, author_company: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm" placeholder="Empresa" />
              </div>
              <input value={form.service_tag} onChange={e => setForm({ ...form, service_tag: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm" placeholder="Servicio (ej: Inmobiliaria)" />
              <input value={form.video_url} onChange={e => setForm({ ...form, video_url: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm" placeholder="URL vídeo (opcional)" />
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Valoración</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })}>
                      <Star className={`w-6 h-6 ${n <= form.rating ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.is_visible} onChange={e => setForm({ ...form, is_visible: e.target.checked })} /> Visible
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} /> Destacado
                </label>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Testimonio *</label>
                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={6} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm" placeholder="El trabajo de Silvio..." />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Avatar (opcional)</label>
                {form.avatar_url && (
                  <div className="relative mb-2 w-20 h-20 rounded-full overflow-hidden border border-border">
                    <img src={form.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setForm({ ...form, avatar_url: "" })} className="absolute top-0 right-0 p-1 rounded-full bg-background/80 text-destructive"><X className="w-3 h-3" /></button>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border text-sm hover:bg-accent">
                  {uploading ? <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" /> : <Upload className="w-4 h-4" />}
                  {uploading ? "Subiendo..." : "Subir avatar"}
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={closeForm} className="px-4 py-2 rounded-lg bg-secondary text-sm">Cancelar</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Guardar</button>
          </div>
        </div>
      )}

      {loading ? <p className="text-muted-foreground">Cargando…</p> : items.length === 0 ? (
        <div className="p-10 text-center rounded-xl border border-dashed border-border text-muted-foreground">Sin testimonios todavía.</div>
      ) : (
        <div className="grid gap-3">
          {items.map((t, i) => (
            <div key={t.id} className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border">
              {t.avatar_url ? (
                <img src={t.avatar_url} alt={t.author_name} className="w-12 h-12 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-sm font-bold shrink-0">{t.author_name[0]}</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-foreground">{t.author_name}</p>
                  {t.author_role && <span className="text-xs text-muted-foreground">· {t.author_role}{t.author_company && ` @ ${t.author_company}`}</span>}
                  <div className="flex">{Array.from({length: t.rating}).map((_,i) => <Star key={i} className="w-3 h-3 fill-accent text-accent" />)}</div>
                  {t.is_featured && <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent">Destacado</span>}
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.content}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => move(t, -1)} disabled={i === 0} className="p-2 rounded-md hover:bg-secondary disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                <button onClick={() => move(t, 1)} disabled={i === items.length - 1} className="p-2 rounded-md hover:bg-secondary disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                <button onClick={() => toggleFeatured(t)} className="p-2 rounded-md hover:bg-secondary" title="Destacar">
                  <Star className={`w-4 h-4 ${t.is_featured ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                </button>
                <button onClick={() => toggleVisible(t)} className="p-2 rounded-md hover:bg-secondary">
                  {t.is_visible ? <ToggleRight className="w-5 h-5 text-primary" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                </button>
                <button onClick={() => openEdit(t)} className="p-2 rounded-md hover:bg-secondary"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(t.id)} className="p-2 rounded-md hover:bg-secondary text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTestimonials;