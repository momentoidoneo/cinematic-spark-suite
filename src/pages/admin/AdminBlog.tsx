import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import RichEditor from "@/components/admin/RichEditor";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Calendar as CalendarIcon,
  Sparkles,
  FileText,
  Save,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  status: string;
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string;
}

interface BlogTemplate {
  id: string;
  name: string;
  description: string | null;
  content: string;
  excerpt: string | null;
}

type Status = "draft" | "scheduled" | "published" | "archived";

const STATUS_META: Record<Status, { label: string; className: string }> = {
  draft: { label: "Borrador", className: "bg-muted text-muted-foreground" },
  scheduled: { label: "Programado", className: "bg-amber-500/15 text-amber-500 border-amber-500/30" },
  published: { label: "Publicado", className: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" },
  archived: { label: "Archivado", className: "bg-secondary text-muted-foreground" },
};

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const generateSlug = (title: string) =>
  title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const AdminBlog = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [templates, setTemplates] = useState<BlogTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [generatingMeta, setGeneratingMeta] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image: "",
    status: "draft" as Status,
    scheduled_at: "",
    meta_title: "",
    meta_description: "",
  });

  const dirtyRef = useRef(false);
  const initializedRef = useRef(false);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    setPosts((data as BlogPost[]) || []);
    setLoading(false);
  };

  const fetchTemplates = async () => {
    const { data } = await supabase.from("blog_templates").select("*").order("name");
    setTemplates((data as BlogTemplate[]) || []);
  };

  useEffect(() => {
    fetchPosts();
    fetchTemplates();
  }, []);

  // Mark dirty when user edits inside the editor view
  useEffect(() => {
    if (!creating && !editing) return;
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }
    dirtyRef.current = true;
  }, [form, creating, editing]);

  // Reset init flag when entering/leaving editor
  useEffect(() => {
    initializedRef.current = false;
    dirtyRef.current = false;
    setLastSaved(null);
  }, [editing?.id, creating]);

  const openCreate = (template?: BlogTemplate) => {
    setForm({
      title: "",
      slug: "",
      excerpt: template?.excerpt ?? "",
      content: template?.content ?? "",
      cover_image: "",
      status: "draft",
      scheduled_at: "",
      meta_title: "",
      meta_description: "",
    });
    setCreating(true);
    setEditing(null);
    setShowTemplates(false);
    if (template) toast.success(`Plantilla "${template.name}" cargada`);
  };

  const openEdit = async (post: BlogPost) => {
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
      status: (post.status as Status) || "draft",
      scheduled_at: post.scheduled_at
        ? new Date(post.scheduled_at).toISOString().slice(0, 16)
        : "",
      meta_title: seoRow?.title || "",
      meta_description: seoRow?.description || "",
    });
    setEditing(post);
    setCreating(false);
  };

  const buildPayload = () => {
    const slug = form.slug || generateSlug(form.title);
    let scheduled_at: string | null = null;
    let status = form.status;
    let published_at: string | null = null;

    if (status === "scheduled") {
      if (!form.scheduled_at) {
        throw new Error("Indica fecha y hora para programar");
      }
      scheduled_at = new Date(form.scheduled_at).toISOString();
      if (new Date(scheduled_at) <= new Date()) {
        // Past date → publish immediately
        status = "published";
        published_at = new Date().toISOString();
        scheduled_at = null;
      }
    } else if (status === "published") {
      published_at = editing?.published_at ?? new Date().toISOString();
    }

    return {
      slug,
      payload: {
        title: form.title,
        slug,
        excerpt: form.excerpt || null,
        content: form.content,
        cover_image: form.cover_image || null,
        status,
        published_at,
        scheduled_at,
        author_id: user!.id,
      },
    };
  };

  const persist = async (showToast: boolean) => {
    if (!form.title.trim()) {
      if (showToast) toast.error("El título es obligatorio");
      return false;
    }
    try {
      const { slug, payload } = buildPayload();
      if (editing) {
        const { error } = await supabase.from("blog_posts").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("blog_posts")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        if (data) setEditing(data as BlogPost);
        setCreating(false);
      }

      // SEO metadata upsert
      if (form.meta_title.trim() || form.meta_description.trim()) {
        const seoPath = `/blog/${slug}`;
        const { data: existing } = await supabase
          .from("seo_metadata")
          .select("id")
          .eq("page_path", seoPath)
          .maybeSingle();
        if (existing) {
          await supabase
            .from("seo_metadata")
            .update({
              title: form.meta_title || null,
              description: form.meta_description || null,
            })
            .eq("id", existing.id);
        } else {
          await supabase.from("seo_metadata").insert({
            page_path: seoPath,
            title: form.meta_title || null,
            description: form.meta_description || null,
          });
        }
      }

      setLastSaved(new Date());
      dirtyRef.current = false;
      if (showToast) toast.success("Guardado");
      fetchPosts();
      return true;
    } catch (err: any) {
      if (showToast) toast.error(err.message || "Error al guardar");
      return false;
    }
  };

  // Auto-save every 20s if dirty
  useEffect(() => {
    if (!creating && !editing) return;
    const interval = setInterval(async () => {
      if (!dirtyRef.current) return;
      if (!form.title.trim()) return;
      setAutoSaving(true);
      await persist(false);
      setAutoSaving(false);
    }, 20000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creating, editing, form]);

  const handleSave = async () => {
    await persist(true);
  };

  const handleExit = () => {
    if (dirtyRef.current && !confirm("Tienes cambios sin guardar. ¿Salir igualmente?")) return;
    setCreating(false);
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este artículo?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    toast.success("Artículo eliminado");
    fetchPosts();
  };

  const generateMetaWithAI = async () => {
    setGeneratingMeta(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-seo-meta", {
        body: {
          title: form.title,
          excerpt: form.excerpt,
          content: form.content,
          page_path: `/blog/${form.slug || generateSlug(form.title)}`,
          current_title: form.meta_title,
          current_description: form.meta_description,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setForm((f) => ({
        ...f,
        meta_title: data.meta_title || f.meta_title,
        meta_description: data.meta_description || f.meta_description,
      }));
      toast.success("Meta tags generados con IA");
    } catch (err: any) {
      toast.error(err.message || "Error generando meta tags");
    } finally {
      setGeneratingMeta(false);
    }
  };

  const wordStats = useMemo(() => {
    const text = stripHtml(form.content);
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const minutes = Math.max(1, Math.round(words / 220));
    return { words, chars, minutes };
  }, [form.content]);

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()),
  );

  if (creating || editing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold text-foreground truncate">
              {editing ? "Editar artículo" : "Nuevo artículo"}
            </h1>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
              {autoSaving ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Guardando…
                </span>
              ) : lastSaved ? (
                <span className="flex items-center gap-1 text-emerald-500">
                  <CheckCircle2 className="h-3 w-3" /> Guardado{" "}
                  {format(lastSaved, "HH:mm:ss")}
                </span>
              ) : (
                <span>Sin cambios</span>
              )}
              <span>·</span>
              <span>
                {wordStats.words} palabras · {wordStats.minutes} min lectura
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExit}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              {editing ? "Guardar" : "Crear"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Título</label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                    slug: form.slug || generateSlug(e.target.value),
                  })
                }
                placeholder="Título del artículo"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Contenido
              </label>
              <RichEditor
                content={form.content}
                onChange={(html) => setForm({ ...form, content: html })}
                placeholder="Escribe el contenido del artículo..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold text-foreground text-sm">Configuración</h3>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Slug</label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="url-del-articulo"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">
                    Extracto ({form.excerpt.length}/300)
                  </label>
                  <Textarea
                    value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    rows={3}
                    placeholder="Breve descripción..."
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">
                    Imagen de portada (URL)
                  </label>
                  <Input
                    value={form.cover_image}
                    onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Estado</label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm({ ...form, status: v as Status })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="scheduled">Programado</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                      <SelectItem value="archived">Archivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.status === "scheduled" && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Fecha y hora de publicación
                    </label>
                    <Input
                      type="datetime-local"
                      value={form.scheduled_at}
                      onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground text-sm">🔍 SEO</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={generateMetaWithAI}
                    disabled={generatingMeta || !form.title.trim()}
                  >
                    {generatingMeta ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Sparkles className="h-3 w-3 mr-1" />
                    )}
                    IA
                  </Button>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-muted-foreground">Meta Title</label>
                    <span
                      className={cn(
                        "text-xs",
                        form.meta_title.length > 60
                          ? "text-destructive"
                          : form.meta_title.length > 50
                            ? "text-amber-500"
                            : "text-muted-foreground",
                      )}
                    >
                      {form.meta_title.length}/60
                    </span>
                  </div>
                  <Input
                    value={form.meta_title}
                    onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                    placeholder="Vacío = usa el título"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-muted-foreground">Meta Description</label>
                    <span
                      className={cn(
                        "text-xs",
                        form.meta_description.length > 160
                          ? "text-destructive"
                          : form.meta_description.length > 140
                            ? "text-amber-500"
                            : "text-muted-foreground",
                      )}
                    >
                      {form.meta_description.length}/160
                    </span>
                  </div>
                  <Textarea
                    value={form.meta_description}
                    onChange={(e) =>
                      setForm({ ...form, meta_description: e.target.value })
                    }
                    rows={3}
                    placeholder="Vacío = usa el extracto"
                  />
                </div>
                <div className="rounded-lg bg-muted/50 p-3 space-y-0.5">
                  <p className="text-xs text-muted-foreground">Vista previa Google:</p>
                  <p className="text-primary text-sm truncate">
                    {form.meta_title || form.title || "Sin título"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    silviocosta.net/blog/{form.slug || "slug"}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {form.meta_description || form.excerpt || "Sin descripción"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Blog</h1>
          <p className="text-sm text-muted-foreground">
            {posts.length} artículos ·{" "}
            {posts.filter((p) => p.status === "scheduled").length} programados
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTemplates(true)}>
            <FileText className="w-4 h-4 mr-1" /> Plantillas
          </Button>
          <Button onClick={() => openCreate()}>
            <Plus className="w-4 h-4 mr-1" /> Nuevo artículo
          </Button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar artículos..."
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No hay artículos. ¡Crea el primero!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => {
            const status = (post.status as Status) || "draft";
            return (
              <Card key={post.id}>
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-foreground truncate">
                        {post.title}
                      </h3>
                      <Badge variant="outline" className={cn("text-[10px]", STATUS_META[status].className)}>
                        {STATUS_META[status].label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {new Date(post.created_at).toLocaleDateString("es-ES")}
                      </span>
                      {post.scheduled_at && status === "scheduled" && (
                        <span className="flex items-center gap-1 text-amber-500">
                          <Clock className="w-3 h-3" />
                          {format(new Date(post.scheduled_at), "dd MMM HH:mm", {
                            locale: es,
                          })}
                        </span>
                      )}
                      <span>/{post.slug}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(post)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Plantillas de artículo</DialogTitle>
            <DialogDescription>
              Empieza desde una estructura preparada para acelerar la redacción.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => openCreate(t)}
                className="text-left rounded-lg border border-border p-4 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-foreground text-sm">{t.name}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3">{t.description}</p>
              </button>
            ))}
            <button
              onClick={() => openCreate()}
              className="text-left rounded-lg border border-dashed border-border p-4 hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <Plus className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground text-sm">En blanco</span>
              </div>
              <p className="text-xs text-muted-foreground">Empezar sin plantilla.</p>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlog;
