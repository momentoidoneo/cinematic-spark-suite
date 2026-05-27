import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Upload, X, ToggleLeft, ToggleRight, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

interface ClientLogo {
  id: string;
  name: string;
  logo_url: string;
  link_url: string | null;
  order: number;
  is_visible: boolean;
}

const emptyForm = { name: "", logo_url: "", link_url: "", is_visible: true };

const AdminClientLogos = () => {
  const [logos, setLogos] = useState<ClientLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ClientLogo | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchLogos = async () => {
    const { data } = await supabase.from("client_logos").select("*").order("order");
    setLogos((data as ClientLogo[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchLogos(); }, []);

  const openCreate = () => { setForm(emptyForm); setCreating(true); setEditing(null); };
  const openEdit = (l: ClientLogo) => {
    setForm({ name: l.name, logo_url: l.logo_url, link_url: l.link_url || "", is_visible: l.is_visible });
    setEditing(l); setCreating(false);
  };
  const closeForm = () => { setEditing(null); setCreating(false); setForm(emptyForm); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("El nombre es obligatorio"); return; }
    if (!form.logo_url.trim()) { toast.error("Sube un logo"); return; }
    const payload = {
      name: form.name.trim(),
      logo_url: form.logo_url,
      link_url: form.link_url.trim() || null,
      is_visible: form.is_visible,
      order: editing ? editing.order : logos.length,
    };
    const { error } = editing
      ? await supabase.from("client_logos").update(payload).eq("id", editing.id)
      : await supabase.from("client_logos").insert(payload);
    if (error) { toast.error("Error al guardar"); return; }
    toast.success(editing ? "Logo actualizado" : "Logo añadido");
    closeForm();
    fetchLogos();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este logo?")) return;
    const { error } = await supabase.from("client_logos").delete().eq("id", id);
    if (error) { toast.error("Error al eliminar"); return; }
    toast.success("Eliminado");
    fetchLogos();
  };

  const toggleVisible = async (l: ClientLogo) => {
    await supabase.from("client_logos").update({ is_visible: !l.is_visible }).eq("id", l.id);
    fetchLogos();
  };

  const move = async (l: ClientLogo, dir: -1 | 1) => {
    const idx = logos.findIndex(x => x.id === l.id);
    const swap = logos[idx + dir];
    if (!swap) return;
    await Promise.all([
      supabase.from("client_logos").update({ order: swap.order }).eq("id", l.id),
      supabase.from("client_logos").update({ order: l.order }).eq("id", swap.id),
    ]);
    fetchLogos();
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `client-logos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("portfolio").upload(path, file);
    if (error) { toast.error("Error al subir"); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("portfolio").getPublicUrl(path);
    setForm(f => ({ ...f, logo_url: publicUrl }));
    setUploading(false);
  };

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Logos de clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">Mostrados en la home como prueba social.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Añadir logo
        </button>
      </div>

      {(creating || editing) && (
        <div className="mb-6 p-5 rounded-xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">{editing ? "Editar logo" : "Nuevo logo"}</h2>
            <button onClick={closeForm} className="p-1 rounded-md hover:bg-secondary"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Nombre del cliente *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Ej: Hotel Vincci" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Enlace (opcional)</label>
                <input value={form.link_url} onChange={e => setForm({ ...form, link_url: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="https://..." />
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input type="checkbox" checked={form.is_visible} onChange={e => setForm({ ...form, is_visible: e.target.checked })} />
                Visible en la web
              </label>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Logo *</label>
              {form.logo_url && (
                <div className="relative mb-2 rounded-lg overflow-hidden border border-border aspect-video bg-white flex items-center justify-center p-4">
                  <img src={form.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
                  <button type="button" onClick={() => setForm({ ...form, logo_url: "" })} className="absolute top-2 right-2 p-1 rounded-full bg-background/80 text-destructive hover:bg-background"><X className="w-4 h-4" /></button>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm hover:bg-accent disabled:opacity-50">
                {uploading ? <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" /> : <Upload className="w-4 h-4" />}
                {uploading ? "Subiendo..." : "Subir logo"}
              </button>
              <p className="text-xs text-muted-foreground mt-2">Recomendado PNG con fondo transparente.</p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={closeForm} className="px-4 py-2 rounded-lg bg-secondary text-foreground text-sm hover:bg-accent">Cancelar</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Guardar</button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground">Cargando…</p>
      ) : logos.length === 0 ? (
        <div className="p-10 text-center rounded-xl border border-dashed border-border text-muted-foreground">
          No hay logos todavía. Añade el primero.
        </div>
      ) : (
        <div className="grid gap-3">
          {logos.map((l, i) => (
            <div key={l.id} className="flex items-center gap-4 p-3 rounded-lg bg-card border border-border">
              <div className="w-24 h-16 bg-white rounded border border-border flex items-center justify-center p-2 shrink-0">
                <img src={l.logo_url} alt={l.name} className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{l.name}</p>
                {l.link_url && <p className="text-xs text-muted-foreground truncate">{l.link_url}</p>}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => move(l, -1)} disabled={i === 0} className="p-2 rounded-md hover:bg-secondary disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                <button onClick={() => move(l, 1)} disabled={i === logos.length - 1} className="p-2 rounded-md hover:bg-secondary disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                <button onClick={() => toggleVisible(l)} className="p-2 rounded-md hover:bg-secondary" title={l.is_visible ? "Ocultar" : "Mostrar"}>
                  {l.is_visible ? <ToggleRight className="w-5 h-5 text-primary" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                </button>
                <button onClick={() => openEdit(l)} className="p-2 rounded-md hover:bg-secondary"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(l.id)} className="p-2 rounded-md hover:bg-secondary text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminClientLogos;