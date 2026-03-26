import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import RichEditor from "@/components/admin/RichEditor";
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Calendar } from "lucide-react";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
}

const AdminBlog = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", content: "", cover_image: "", status: "draft", meta_title: "", meta_description: "" });

  const fetchPosts = async () => {
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setPosts((data as BlogPost[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const openCreate = () => {
    setForm({ title: "", slug: "", excerpt: "", content: "", cover_image: "", status: "draft", meta_title: "", meta_description: "" });
    setCreating(true);
    setEditing(null);
  };

  const openEdit = async (post: BlogPost) => {
    // Load SEO overrides from seo_metadata
    const { data: seoRow } = await supabase
      .from("seo_metadata")
      .select("title, description")
      .eq("page_path", `/blog/${post.slug}`)
      .maybeSingle();
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      cover_image: post.cover_image || "",
      status: post.status,
      meta_title: seoRow?.title || "",
      meta_description: seoRow?.description || "",
    });
    setEditing(post);
    setCreating(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("El título es obligatorio"); return; }
    const slug = form.slug || generateSlug(form.title);
    const payload = {
      title: form.title,
      slug,
      excerpt: form.excerpt || null,
      content: form.content,
      cover_image: form.cover_image || null,
      status: form.status,
      published_at: form.status === "published" ? new Date().toISOString() : null,
      author_id: user!.id,
    };

    if (editing) {
      const { error } = await supabase.from("blog_posts").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Artículo actualizado");
    } else {
      const { error } = await supabase.from("blog_posts").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Artículo creado");
    }

    // Upsert SEO metadata for this blog post
    if (form.meta_title.trim() || form.meta_description.trim()) {
      const seoPath = `/blog/${slug}`;
      const { data: existing } = await supabase.from("seo_metadata").select("id").eq("page_path", seoPath).maybeSingle();
      if (existing) {
        await supabase.from("seo_metadata").update({ title: form.meta_title || null, description: form.meta_description || null }).eq("id", existing.id);
      } else {
        await supabase.from("seo_metadata").insert({ page_path: seoPath, title: form.meta_title || null, description: form.meta_description || null });
      }
    }

    setEditing(null);
    setCreating(false);
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este artículo?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    toast.success("Artículo eliminado");
    fetchPosts();
  };

  const filtered = posts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  if (creating || editing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">
            {editing ? "Editar Artículo" : "Nuevo Artículo"}
          </h1>
          <div className="flex gap-2">
            <button onClick={() => { setCreating(false); setEditing(null); }} className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">
              Cancelar
            </button>
            <button onClick={handleSave} className="px-4 py-2 text-sm rounded-lg bg-gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
              {editing ? "Guardar Cambios" : "Publicar Artículo"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Título</label>
              <input
                value={form.title}
                onChange={(e) => { setForm({ ...form, title: e.target.value, slug: form.slug || generateSlug(e.target.value) }); }}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Título del artículo"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Contenido</label>
              <RichEditor content={form.content} onChange={(html) => setForm({ ...form, content: html })} placeholder="Escribe el contenido del artículo..." />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl bg-card border border-border p-4 space-y-4">
              <h3 className="font-semibold text-foreground text-sm">Configuración</h3>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Slug (URL)</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="url-del-articulo"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Extracto</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  rows={3}
                  placeholder="Breve descripción del artículo..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Imagen de portada (URL)</label>
                <input
                  value={form.cover_image}
                  onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Estado</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                  <option value="archived">Archivado</option>
                </select>
              </div>
            </div>
            <div className="rounded-xl bg-card border border-border p-4 space-y-4">
              <h3 className="font-semibold text-foreground text-sm">🔍 SEO (Meta Tags)</h3>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Meta Title <span className={`text-xs ml-1 ${form.meta_title.length > 60 ? 'text-red-500' : 'text-muted-foreground'}`}>({form.meta_title.length}/60)</span>
                </label>
                <input
                  value={form.meta_title}
                  onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Título para buscadores (vacío = título del post)"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Meta Description <span className={`text-xs ml-1 ${form.meta_description.length > 160 ? 'text-red-500' : 'text-muted-foreground'}`}>({form.meta_description.length}/160)</span>
                </label>
                <textarea
                  value={form.meta_description}
                  onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  rows={3}
                  placeholder="Descripción para buscadores (vacío = extracto)"
                />
              </div>
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
          <h1 className="font-display text-2xl font-bold text-foreground">Blog</h1>
          <p className="text-sm text-muted-foreground">{posts.length} artículos</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Nuevo Artículo
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Buscar artículos..."
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl bg-card border border-border p-12 text-center">
          <p className="text-muted-foreground">No hay artículos aún. ¡Crea tu primer artículo!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => (
            <div key={post.id} className="rounded-xl bg-card border border-border p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate">{post.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    post.status === "published" ? "bg-green-500/20 text-green-400" :
                    post.status === "archived" ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {post.status === "published" ? "Publicado" : post.status === "archived" ? "Archivado" : "Borrador"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(post.created_at).toLocaleDateString("es-ES")}</span>
                  <span>/{post.slug}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(post)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(post.id)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
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

export default AdminBlog;
