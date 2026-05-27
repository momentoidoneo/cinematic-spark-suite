import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Upload, X, ToggleLeft, ToggleRight, ArrowUp, ArrowDown, Star } from "lucide-react";
import { toast } from "sonner";

interface Metric { label: string; value: string; }
interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  client: string | null;
  summary: string | null;
  content: string;
  cover_image: string | null;
  before_image: string | null;
  after_image: string | null;
  metrics: Metric[];
  services: string[];
  location: string | null;
  order: number;
  is_featured: boolean;
  is_published: boolean;
}

const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const emptyForm = {
  title: "", slug: "", client: "", summary: "", content: "",
  cover_image: "", before_image: "", after_image: "",
  metrics: [] as Metric[], services: "", location: "",
  is_featured: false, is_published: false,
};

const AdminCaseStudies = () => {
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CaseStudy | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [uploadField, setUploadField] = useState<"cover_image" | "before_image" | "after_image" | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    const { data } = await supabase.from("case_studies").select("*").order("order");
    setItems((data as unknown as CaseStudy[]) || []);
    setLoading(false);
  };
  useEffect(() => { fetchItems(); }, []);

  const openCreate = () => { setForm(emptyForm); setCreating(true); setEditing(null); };
  const openEdit = (c: CaseStudy) => {
    setForm({
      title: c.title, slug: c.slug, client: c.client || "", summary: c.summary || "", content: c.content || "",
      cover_image: c.cover_image || "", before_image: c.before_image || "", after_image: c.after_image || "",
      metrics: c.metrics || [], services: (c.services || []).join(", "), location: c.location || "",
      is_featured: c.is_featured, is_published: c.is_published,
    });
    setEditing(c); setCreating(false);
  };
  const closeForm = () => { setEditing(null); setCreating(false); setForm(emptyForm); };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Título obligatorio"); return; }
    const finalSlug = form.slug.trim() || slugify(form.title);
    const payload = {
      title: form.title.trim(),
      slug: finalSlug,
      client: form.client.trim() || null,
      summary: form.summary.trim() || null,
      content: form.content,
      cover_image: form.cover_image || null,
      before_image: form.before_image || null,
      after_image: form.after_image || null,
      metrics: form.metrics as unknown as never,
      services: form.services.split(",").map(s => s.trim()).filter(Boolean),
      location: form.location.trim() || null,
      is_featured: form.is_featured,
      is_published: form.is_published,
      published_at: form.is_published ? new Date().toISOString() : null,
      order: editing ? editing.order : items.length,
    };
    const { error } = editing
      ? await supabase.from("case_studies").update(payload).eq("id", editing.id)
      : await supabase.from("case_studies").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "Caso actualizado" : "Caso creado");
    closeForm(); fetchItems();
  };
  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este caso?")) return;
    await supabase.from("case_studies").delete().eq("id", id);
    toast.success("Eliminado"); fetchItems();
  };
  const togglePub = async (c: CaseStudy) => {
    await supabase.from("case_studies").update({ is_published: !c.is_published, published_at: !c.is_published ? new Date().toISOString() : null }).eq("id", c.id);
    fetchItems();
  };
  const toggleFeat = async (c: CaseStudy) => {
    await supabase.from("case_studies").update({ is_featured: !c.is_featured }).eq("id", c.id); fetchItems();
  };
  const move = async (c: CaseStudy, dir: -1 | 1) => {
    const idx = items.findIndex(x => x.id === c.id);
    const swap = items[idx + dir]; if (!swap) return;
    await Promise.all([
      supabase.from("case_studies").update({ order: swap.order }).eq("id", c.id),
      supabase.from("case_studies").update({ order: c.order }).eq("id", swap.id),
    ]);
    fetchItems();
  };

  const triggerUpload = (field: "cover_image" | "before_image" | "after_image") => {
    setUploadField(field); fileRef.current?.click();
  };
  const handleUpload = async (file: File) => {
    if (!uploadField) return;
    const ext = file.name.split(".").pop();
    const path = `case-studies/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("portfolio").upload(path, file);
    if (error) { toast.error("Error al subir"); return; }
    const { data: { publicUrl } } = supabase.storage.from("portfolio").getPublicUrl(path);
    setForm(f => ({ ...f, [uploadField]: publicUrl }));
    setUploadField(null);
  };

  const updateMetric = (i: number, key: keyof Metric, val: string) => {
    setForm(f => ({ ...f, metrics: f.metrics.map((m, idx) => idx === i ? { ...m, [key]: val } : m) }));
  };
  const addMetric = () => setForm(f => ({ ...f, metrics: [...f.metrics, { label: "", value: "" }] }));
  const removeMetric = (i: number) => setForm(f => ({ ...f, metrics: f.metrics.filter((_, idx) => idx !== i) }));

  return (
    <div className="p-6 max-w-6xl">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Casos de estudio</h1>
          <p className="text-sm text-muted-foreground mt-1">Trabajos con resultados y métricas. Los destacados aparecen en home.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Nuevo caso
        </button>
      </div>

      {(creating || editing) && (
        <div className="mb-6 p-5 rounded-xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">{editing ? "Editar caso" : "Nuevo caso"}</h2>
            <button onClick={closeForm} className="p-1 rounded-md hover:bg-secondary"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm" placeholder="Título del caso *" />
              <input value={form.slug} onChange={e => setForm({ ...form, slug: slugify(e.target.value) })} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm font-mono text-xs" placeholder="slug-url" />
              <input value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm" placeholder="Cliente" />
              <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm" placeholder="Ubicación" />
              <input value={form.services} onChange={e => setForm({ ...form, services: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm" placeholder="Servicios separados por coma" />
              <textarea value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} rows={2} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm" placeholder="Resumen breve" />
              <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={6} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm" placeholder="Contenido (HTML o texto)" />
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} /> Publicado
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} /> Destacado (home)
                </label>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Portada</label>
                {form.cover_image && <img src={form.cover_image} alt="" className="w-full aspect-video object-cover rounded-lg mb-2" />}
                <button type="button" onClick={() => triggerUpload("cover_image")} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border text-sm"><Upload className="w-4 h-4" /> Subir portada</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Antes</label>
                  {form.before_image && <img src={form.before_image} alt="" className="w-full aspect-square object-cover rounded mb-1" />}
                  <button type="button" onClick={() => triggerUpload("before_image")} className="text-xs px-2 py-1 rounded bg-secondary border border-border">Subir antes</button>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Después</label>
                  {form.after_image && <img src={form.after_image} alt="" className="w-full aspect-square object-cover rounded mb-1" />}
                  <button type="button" onClick={() => triggerUpload("after_image")} className="text-xs px-2 py-1 rounded bg-secondary border border-border">Subir después</button>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Métricas</label>
                  <button type="button" onClick={addMetric} className="text-xs text-primary">+ Añadir</button>
                </div>
                {form.metrics.map((m, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={m.value} onChange={e => updateMetric(i, "value", e.target.value)} className="w-24 px-2 py-1.5 rounded bg-secondary border border-border text-sm" placeholder="3×" />
                    <input value={m.label} onChange={e => updateMetric(i, "label", e.target.value)} className="flex-1 px-2 py-1.5 rounded bg-secondary border border-border text-sm" placeholder="Más rápido" />
                    <button type="button" onClick={() => removeMetric(i)} className="p-1 text-destructive"><X className="w-4 h-4" /></button>
                  </div>
                ))}
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
        <div className="p-10 text-center rounded-xl border border-dashed border-border text-muted-foreground">Sin casos todavía.</div>
      ) : (
        <div className="grid gap-3">
          {items.map((c, i) => (
            <div key={c.id} className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border">
              {c.cover_image ? (
                <img src={c.cover_image} alt="" className="w-24 h-16 object-cover rounded shrink-0" />
              ) : (
                <div className="w-24 h-16 bg-secondary rounded shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-foreground">{c.title}</p>
                  {c.is_featured && <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent">Destacado</span>}
                  {!c.is_published && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Borrador</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{c.client} {c.location && `· ${c.location}`}</p>
                {c.summary && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{c.summary}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => move(c, -1)} disabled={i === 0} className="p-2 rounded-md hover:bg-secondary disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                <button onClick={() => move(c, 1)} disabled={i === items.length - 1} className="p-2 rounded-md hover:bg-secondary disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                <button onClick={() => toggleFeat(c)} className="p-2 rounded-md hover:bg-secondary"><Star className={`w-4 h-4 ${c.is_featured ? "fill-accent text-accent" : "text-muted-foreground"}`} /></button>
                <button onClick={() => togglePub(c)} className="p-2 rounded-md hover:bg-secondary">
                  {c.is_published ? <ToggleRight className="w-5 h-5 text-primary" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                </button>
                <button onClick={() => openEdit(c)} className="p-2 rounded-md hover:bg-secondary"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(c.id)} className="p-2 rounded-md hover:bg-secondary text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCaseStudies;