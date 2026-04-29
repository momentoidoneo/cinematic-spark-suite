import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Search,
  Save,
  Plus,
  Trash2,
  Globe,
  Sparkles,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SEOEntry {
  id: string;
  page_path: string;
  title: string | null;
  description: string | null;
  og_image: string | null;
}

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

// Pages we expect to have SEO metadata. Audit flags missing entries.
const KNOWN_PAGES = [
  "/",
  "/portafolio",
  "/blog",
  "/precios",
  "/guia-servicios-audiovisuales",
  "/legal/legal-notice",
  "/legal/privacy-policy",
  "/legal/cookies",
  "/legal/terms",
  "/servicios/fotografia",
  "/servicios/video-dron",
  "/servicios/eventos",
  "/servicios/tour-virtual",
  "/servicios/renders",
];

type Issue = {
  level: "error" | "warn";
  message: string;
};

const auditEntry = (e: SEOEntry): Issue[] => {
  const issues: Issue[] = [];
  const t = (e.title || "").trim();
  const d = (e.description || "").trim();
  if (!t) issues.push({ level: "error", message: "Sin meta title" });
  else if (t.length < 30) issues.push({ level: "warn", message: `Title corto (${t.length})` });
  else if (t.length > 60) issues.push({ level: "warn", message: `Title largo (${t.length})` });
  if (!d) issues.push({ level: "error", message: "Sin meta description" });
  else if (d.length < 70) issues.push({ level: "warn", message: `Desc corta (${d.length})` });
  else if (d.length > 160) issues.push({ level: "warn", message: `Desc larga (${d.length})` });
  return issues;
};

const AdminSEO = () => {
  const [entries, setEntries] = useState<SEOEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [newPath, setNewPath] = useState("");
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const fetchEntries = async () => {
    setLoading(true);
    const { data } = await supabase.from("seo_metadata").select("*").order("page_path");
    setEntries((data as SEOEntry[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const updateField = (id: string, field: keyof SEOEntry, value: string) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const handleSave = async (entry: SEOEntry) => {
    const { error } = await supabase
      .from("seo_metadata")
      .update({
        title: entry.title,
        description: entry.description,
        og_image: entry.og_image,
      })
      .eq("id", entry.id);
    if (error) toast.error("Error al guardar");
    else toast.success(`SEO de "${entry.page_path}" guardado`);
  };

  const handleAdd = async () => {
    if (!newPath.trim()) return;
    const path = newPath.trim().startsWith("/") ? newPath.trim() : `/${newPath.trim()}`;
    const { error } = await supabase
      .from("seo_metadata")
      .insert({ page_path: path, title: "", description: "" });
    if (error) toast.error(error.message);
    else {
      toast.success("Página añadida");
      setNewPath("");
      fetchEntries();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta entrada SEO?")) return;
    await supabase.from("seo_metadata").delete().eq("id", id);
    toast.success("Eliminado");
    fetchEntries();
  };

  const handleAddMissing = async (path: string) => {
    const { error } = await supabase
      .from("seo_metadata")
      .insert({ page_path: path, title: "", description: "" });
    if (error) toast.error(error.message);
    else {
      toast.success(`Añadida ${path}`);
      fetchEntries();
    }
  };

  const generateMeta = async (entry: SEOEntry) => {
    setGeneratingId(entry.id);
    try {
      const { data, error } = await supabase.functions.invoke("generate-seo-meta", {
        body: {
          page_path: entry.page_path,
          current_title: entry.title,
          current_description: entry.description,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const updated = {
        ...entry,
        title: data.meta_title || entry.title,
        description: data.meta_description || entry.description,
      };
      setEntries((prev) => prev.map((e) => (e.id === entry.id ? updated : e)));
      await supabase
        .from("seo_metadata")
        .update({ title: updated.title, description: updated.description })
        .eq("id", entry.id);
      toast.success("Meta tags generados");
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Error generando meta"));
    } finally {
      setGeneratingId(null);
    }
  };

  const filtered = useMemo(
    () =>
      entries.filter(
        (e) =>
          e.page_path.toLowerCase().includes(search.toLowerCase()) ||
          (e.title || "").toLowerCase().includes(search.toLowerCase()),
      ),
    [entries, search],
  );

  const audit = useMemo(() => {
    const missing = KNOWN_PAGES.filter(
      (p) => !entries.some((e) => e.page_path === p),
    );

    const titleMap = new Map<string, string[]>();
    const descMap = new Map<string, string[]>();
    const issues: { entry: SEOEntry; problems: Issue[] }[] = [];

    for (const e of entries) {
      const t = (e.title || "").trim().toLowerCase();
      const d = (e.description || "").trim().toLowerCase();
      if (t) titleMap.set(t, [...(titleMap.get(t) ?? []), e.page_path]);
      if (d) descMap.set(d, [...(descMap.get(d) ?? []), e.page_path]);
      const problems = auditEntry(e);
      if (problems.length) issues.push({ entry: e, problems });
    }

    const dupTitles = [...titleMap.entries()].filter(([, v]) => v.length > 1);
    const dupDescs = [...descMap.entries()].filter(([, v]) => v.length > 1);

    const score = Math.max(
      0,
      Math.round(
        100 -
          missing.length * 8 -
          dupTitles.length * 6 -
          dupDescs.length * 4 -
          issues.reduce((s, i) => s + i.problems.length, 0) * 2,
      ),
    );

    return { missing, dupTitles, dupDescs, issues, score };
  }, [entries]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">SEO &amp; Meta Tags</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona meta tags, ejecuta auditoría y genera con IA
          </p>
        </div>
        <Card className="px-4 py-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Score SEO</span>
            <span
              className={cn(
                "text-2xl font-bold",
                audit.score >= 80
                  ? "text-emerald-500"
                  : audit.score >= 50
                    ? "text-amber-500"
                    : "text-destructive",
              )}
            >
              {audit.score}
            </span>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="entries">
        <TabsList>
          <TabsTrigger value="entries">Entradas ({entries.length})</TabsTrigger>
          <TabsTrigger value="audit">
            Auditoría
            {(audit.missing.length + audit.dupTitles.length + audit.dupDescs.length + audit.issues.length) > 0 && (
              <Badge variant="destructive" className="ml-2 h-4 px-1 text-[10px]">
                {audit.missing.length + audit.dupTitles.length + audit.dupDescs.length + audit.issues.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-4 mt-4">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ruta o título..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Input
              placeholder="/nueva-ruta"
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
              className="w-48"
            />
            <Button onClick={handleAdd} size="sm">
              <Plus className="w-4 h-4 mr-1" /> Añadir
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No hay entradas SEO.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filtered.map((entry) => {
                const titleLen = (entry.title || "").length;
                const descLen = (entry.description || "").length;
                const problems = auditEntry(entry);
                return (
                  <Card key={entry.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <CardTitle className="text-sm font-mono flex items-center gap-2">
                          <Globe className="w-4 h-4 text-primary" />
                          {entry.page_path}
                          {problems.length === 0 ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                          )}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateMeta(entry)}
                            disabled={generatingId === entry.id}
                          >
                            {generatingId === entry.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5 mr-1" />
                            )}
                            IA
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleSave(entry)}>
                            <Save className="w-3.5 h-3.5 mr-1" /> Guardar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(entry.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-xs font-medium text-muted-foreground">
                            Meta Title
                          </label>
                          <span
                            className={cn(
                              "text-xs",
                              titleLen > 60
                                ? "text-destructive"
                                : titleLen > 50 || titleLen < 30
                                  ? "text-amber-500"
                                  : "text-muted-foreground",
                            )}
                          >
                            {titleLen}/60
                          </span>
                        </div>
                        <Input
                          value={entry.title || ""}
                          onChange={(e) => updateField(entry.id, "title", e.target.value)}
                          placeholder="Meta título de la página"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-xs font-medium text-muted-foreground">
                            Meta Description
                          </label>
                          <span
                            className={cn(
                              "text-xs",
                              descLen > 160
                                ? "text-destructive"
                                : descLen > 140 || descLen < 70
                                  ? "text-amber-500"
                                  : "text-muted-foreground",
                            )}
                          >
                            {descLen}/160
                          </span>
                        </div>
                        <Textarea
                          value={entry.description || ""}
                          onChange={(e) => updateField(entry.id, "description", e.target.value)}
                          rows={2}
                          placeholder="Meta descripción de la página"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          OG Image (opcional)
                        </label>
                        <Input
                          value={entry.og_image || ""}
                          onChange={(e) => updateField(entry.id, "og_image", e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                      {problems.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {problems.map((p, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className={cn(
                                "text-[10px]",
                                p.level === "error"
                                  ? "border-destructive/40 text-destructive"
                                  : "border-amber-500/40 text-amber-500",
                              )}
                            >
                              {p.message}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="rounded-lg bg-muted/50 p-3 space-y-0.5">
                        <p className="text-xs text-muted-foreground">Vista previa Google:</p>
                        <p className="text-primary text-sm truncate">
                          {entry.title || "Sin título"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          silviocosta.net{entry.page_path}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {entry.description || "Sin descripción"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="audit" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Páginas conocidas sin meta ({audit.missing.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {audit.missing.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Todas las páginas conocidas tienen entrada SEO.
                </p>
              ) : (
                <div className="space-y-2">
                  {audit.missing.map((p) => (
                    <div
                      key={p}
                      className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                    >
                      <code className="text-sm">{p}</code>
                      <Button size="sm" variant="outline" onClick={() => handleAddMissing(p)}>
                        <Plus className="h-3.5 w-3.5 mr-1" /> Añadir
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Copy className="h-4 w-4 text-amber-500" />
                Títulos duplicados ({audit.dupTitles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {audit.dupTitles.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin duplicados.</p>
              ) : (
                <div className="space-y-3">
                  {audit.dupTitles.map(([title, paths]) => (
                    <div key={title} className="rounded-md border border-border p-3">
                      <p className="text-sm font-medium truncate">{title}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {paths.map((p) => (
                          <Badge key={p} variant="outline" className="text-[10px]">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Copy className="h-4 w-4 text-amber-500" />
                Descripciones duplicadas ({audit.dupDescs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {audit.dupDescs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin duplicados.</p>
              ) : (
                <div className="space-y-3">
                  {audit.dupDescs.map(([desc, paths]) => (
                    <div key={desc} className="rounded-md border border-border p-3">
                      <p className="text-sm line-clamp-2">{desc}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {paths.map((p) => (
                          <Badge key={p} variant="outline" className="text-[10px]">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Problemas por página ({audit.issues.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {audit.issues.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin problemas detectados.</p>
              ) : (
                <div className="space-y-2">
                  {audit.issues.map(({ entry, problems }) => (
                    <div
                      key={entry.id}
                      className="rounded-md border border-border p-3 flex items-center justify-between gap-3 flex-wrap"
                    >
                      <code className="text-sm">{entry.page_path}</code>
                      <div className="flex flex-wrap gap-1">
                        {problems.map((p, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className={cn(
                              "text-[10px]",
                              p.level === "error"
                                ? "border-destructive/40 text-destructive"
                                : "border-amber-500/40 text-amber-500",
                            )}
                          >
                            {p.message}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generateMeta(entry)}
                        disabled={generatingId === entry.id}
                      >
                        {generatingId === entry.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 mr-1" />
                        )}
                        Generar IA
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSEO;
