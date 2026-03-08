import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, GripVertical, ToggleLeft, ToggleRight, Instagram, Facebook, Youtube, Linkedin, Twitter, Globe, MessageCircle, Send, Pin, Video, Music, Camera, Twitch } from "lucide-react";
import { toast } from "sonner";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string | null;
  label: string | null;
  order: number;
  is_active: boolean;
}

const platformIcons: Record<string, React.ReactNode> = {
  instagram: <Instagram className="w-5 h-5 text-pink-400" />,
  facebook: <Facebook className="w-5 h-5 text-blue-400" />,
  youtube: <Youtube className="w-5 h-5 text-red-400" />,
  linkedin: <Linkedin className="w-5 h-5 text-blue-300" />,
  twitter: <Twitter className="w-5 h-5 text-sky-400" />,
  tiktok: <Music className="w-5 h-5 text-foreground" />,
  pinterest: <Pin className="w-5 h-5 text-red-500" />,
  threads: <MessageCircle className="w-5 h-5 text-foreground" />,
  vimeo: <Video className="w-5 h-5 text-blue-400" />,
  whatsapp: <MessageCircle className="w-5 h-5 text-green-400" />,
  telegram: <Send className="w-5 h-5 text-blue-400" />,
  snapchat: <Camera className="w-5 h-5 text-yellow-400" />,
  twitch: <Twitch className="w-5 h-5 text-purple-400" />,
  behance: <Globe className="w-5 h-5 text-blue-500" />,
  dribbble: <Globe className="w-5 h-5 text-pink-500" />,
  flickr: <Camera className="w-5 h-5 text-pink-400" />,
  website: <Globe className="w-5 h-5 text-primary" />,
};

const platforms = [
  "instagram", "facebook", "youtube", "linkedin", "twitter", "tiktok",
  "pinterest", "threads", "vimeo", "whatsapp", "telegram", "snapchat",
  "twitch", "behance", "dribbble", "flickr", "website",
];

const AdminSocialMedia = () => {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SocialLink | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ platform: "instagram", url: "", label: "", is_active: true });

  const fetchLinks = async () => {
    const { data } = await supabase.from("social_links").select("*").order("order");
    setLinks((data as SocialLink[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchLinks(); }, []);

  const openCreate = () => {
    setForm({ platform: "instagram", url: "", label: "", is_active: true });
    setCreating(true);
    setEditing(null);
  };

  const openEdit = (link: SocialLink) => {
    setForm({ platform: link.platform, url: link.url, label: link.label || "", is_active: link.is_active });
    setEditing(link);
    setCreating(false);
  };

  const handleSave = async () => {
    if (!form.url.trim()) { toast.error("La URL es obligatoria"); return; }
    const payload = {
      platform: form.platform,
      url: form.url,
      label: form.label || form.platform.charAt(0).toUpperCase() + form.platform.slice(1),
      is_active: form.is_active,
      order: editing ? editing.order : links.length,
    };

    if (editing) {
      const { error } = await supabase.from("social_links").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Red social actualizada");
    } else {
      const { error } = await supabase.from("social_links").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Red social añadida");
    }
    setEditing(null);
    setCreating(false);
    fetchLinks();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta red social?")) return;
    await supabase.from("social_links").delete().eq("id", id);
    toast.success("Red social eliminada");
    fetchLinks();
  };

  const toggleActive = async (link: SocialLink) => {
    await supabase.from("social_links").update({ is_active: !link.is_active }).eq("id", link.id);
    fetchLinks();
  };

  if (creating || editing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">{editing ? "Editar Red Social" : "Añadir Red Social"}</h1>
          <div className="flex gap-2">
            <button onClick={() => { setCreating(false); setEditing(null); }} className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm rounded-lg bg-gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">Guardar</button>
          </div>
        </div>
        <div className="max-w-lg space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Plataforma</label>
            <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              {platforms.map((p) => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">URL</label>
            <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="https://instagram.com/tu-perfil" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Etiqueta (opcional)</label>
            <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="@tu_perfil" />
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
            <button type="button" onClick={() => setForm({ ...form, is_active: !form.is_active })}>
              {form.is_active ? <ToggleRight className="w-6 h-6 text-green-400" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
            </button>
            <span className="text-sm text-foreground">{form.is_active ? "Visible en el sitio" : "Oculto"}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Redes Sociales</h1>
          <p className="text-sm text-muted-foreground">Gestiona los enlaces a tus perfiles sociales</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Añadir Red Social
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>
      ) : links.length === 0 ? (
        <div className="rounded-xl bg-card border border-border p-12 text-center"><p className="text-muted-foreground">No hay redes sociales configuradas.</p></div>
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <div key={link.id} className="rounded-xl bg-card border border-border p-4 flex items-center gap-4">
              <div className="shrink-0">{platformIcons[link.platform] || <Globe className="w-5 h-5 text-muted-foreground" />}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{link.label || link.platform}</p>
                <p className="text-xs text-muted-foreground truncate">{link.url}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleActive(link)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  {link.is_active ? <ToggleRight className="w-4 h-4 text-green-400" /> : <ToggleLeft className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(link)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(link.id)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
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

export default AdminSocialMedia;
