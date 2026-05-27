import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Upload, X, ToggleLeft, ToggleRight, FileText, Download } from "lucide-react";
import { toast } from "sonner";

interface LeadMagnet {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  pdf_url: string;
  cover_image: string | null;
  pages: number | null;
  order: number;
  is_active: boolean;
}
interface DownloadRow {
  id: string; email: string; name: string | null; lead_magnet_id: string; created_at: string;
}

const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const emptyForm = { title: "", slug: "", description: "", pdf_url: "", cover_image: "", pages: 0, is_active: true };

const AdminLeadMagnets = () => {
  const [items, setItems] = useState<LeadMagnet[]>([]);
  const [downloads, setDownloads] = useState<DownloadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<LeadMagnet | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [uploadField, setUploadField] = useState<"pdf_url" | "cover_image" | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchAll = async () => {
    const [{ data: lm }, { data: dl }] = await Promise.all([
      supabase.from("lead_magnets").select("*").order("order"),
      supabase.from("lead_magnet_downloads").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    setItems((lm as LeadMagnet[]) || []);
    setDownloads((dl as DownloadRow[]) || []);
    setLoading(false);
  };
  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setForm(emptyForm); setCreating(true); setEditing(null); };
  const openEdit = (l: LeadMagnet) => {
    setForm({
      title: l.title, slug: l.slug, description: l.description || "", pdf_url: l.pdf_url,
      cover_image: l.cover_image || "", pages: l.pages || 0, is_active: l.is_active,
    });
    setEditing(l); setCreating(false);
  };
  const closeForm = () => { setEditing(null); setCreating(false); setForm(emptyForm); };

  const handleSave = async () => {
    if (!form.title.trim() || !form.pdf_url) { toast.error("Título y PDF obligatorios"); return; }
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      description: form.description.trim() || null,
      pdf_url: form.pdf_url,
      cover_image: form.cover_image || null,
      pages: form.pages || null,
      is_active: form.is_active,
      order: editing ? editing.order : items.length,
    };
    const { error } = editing
      ? await supabase.from("lead_magnets").update(payload).eq("id", editing.id)
      : await supabase.from("lead_magnets").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Guardado"); closeForm(); fetchAll();
  };
  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar?")) return;
    await supabase.from("lead_magnets").delete().eq("id", id); fetchAll();
  };
  const toggleActive = async (l: LeadMagnet) => {
    await supabase.from("lead_magnets").update({ is_active: !l.is_active }).eq("id", l.id); fetchAll();
  };
  const triggerUpload = (field: "pdf_url" | "cover_image") => {
    setUploadField(field); fileRef.current?.click();
  };
  const handleUpload = async (file: File) => {
    if (!uploadField) return;
    const ext = file.name.split(".").pop();
    const path = `lead-magnets/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("portfolio").upload(path, file);
    if (error) { toast.error("Error al subir"); return; }
    const { data: { publicUrl } } = supabase.storage.from("portfolio").getPublicUrl(path);
    setForm(f => ({ ...f, [uploadField]: publicUrl }));
    setUploadField(null);
  };

  return (
    <div className="p-6 max-w-6xl">
      <input ref={fileRef} type="file" accept={uploadField === "pdf_url" ? "application/pdf" : "image/*"} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Lead magnets</h1>
          <p className="text-sm text-muted-foreground mt-1">Recursos descargables (PDFs) a cambio de email.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Nuevo recurso
        </button>
      </div>

      {(creating || editing) && (
        <div className="mb-6 p-5 rounded-xl bg-card border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{editing ? "Editar" : "Nuevo"}</h2>
            <button onClick={closeForm} className="p-1 rounded-md hover:bg-secondary"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} className="md:col-span-2 px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm" placeholder="Título *" />
            <input value={form.slug} onChange={e => setForm({ ...form, slug: slugify(e.target.value) })} className="px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm font-mono text-xs" placeholder="slug" />
            <input type="number" value={form.pages} onChange={e => setForm({ ...form, pages: Number(e.target.value) })} className="px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm" placeholder="Páginas" />
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="md:col-span-2 px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm" placeholder="Descripción" />
            <div>
              <label className="text-sm font-medium mb-1.5 block">PDF *</label>
              {form.pdf_url && <p className="text-xs text-primary truncate mb-1">PDF subido ✓</p>}
              <button type="button" onClick={() => triggerUpload("pdf_url")} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border text-sm"><FileText className="w-4 h-4" /> Subir PDF</button>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Portada (opcional)</label>
              {form.cover_image && <img src={form.cover_image} alt="" className="w-32 aspect-[3/4] object-cover rounded mb-1" />}
              <button type="button" onClick={() => triggerUpload("cover_image")} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border text-sm"><Upload className="w-4 h-4" /> Subir portada</button>
            </div>
            <label className="md:col-span-2 flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> Activo
            </label>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={closeForm} className="px-4 py-2 rounded-lg bg-secondary text-sm">Cancelar</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Guardar</button>
          </div>
        </div>
      )}

      {loading ? <p className="text-muted-foreground">Cargando…</p> : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            {items.length === 0 ? (
              <div className="p-10 text-center rounded-xl border border-dashed border-border text-muted-foreground">Sin recursos todavía.</div>
            ) : items.map(l => (
              <div key={l.id} className="flex items-center gap-4 p-3 rounded-lg bg-card border border-border">
                {l.cover_image ? <img src={l.cover_image} alt="" className="w-12 h-16 object-cover rounded" /> : <div className="w-12 h-16 bg-secondary rounded flex items-center justify-center"><FileText className="w-5 h-5 text-muted-foreground" /></div>}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{l.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{l.description}</p>
                  <p className="text-xs text-primary mt-1">{downloads.filter(d => d.lead_magnet_id === l.id).length} descargas</p>
                </div>
                <button onClick={() => toggleActive(l)} className="p-2 rounded-md hover:bg-secondary">
                  {l.is_active ? <ToggleRight className="w-5 h-5 text-primary" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                </button>
                <button onClick={() => openEdit(l)} className="p-2 rounded-md hover:bg-secondary"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(l.id)} className="p-2 rounded-md hover:bg-secondary text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Download className="w-4 h-4" /> Últimas descargas</h3>
            {downloads.length === 0 ? <p className="text-xs text-muted-foreground">Sin descargas.</p> : (
              <ul className="space-y-2 max-h-96 overflow-auto">
                {downloads.map(d => (
                  <li key={d.id} className="text-xs border-b border-border pb-2">
                    <p className="font-medium text-foreground truncate">{d.email}</p>
                    {d.name && <p className="text-muted-foreground">{d.name}</p>}
                    <p className="text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeadMagnets;