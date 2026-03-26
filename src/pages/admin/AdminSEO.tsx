import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Search, Save, Plus, Trash2, Globe } from "lucide-react";

interface SEOEntry {
  id: string;
  page_path: string;
  title: string | null;
  description: string | null;
  og_image: string | null;
}

const AdminSEO = () => {
  const [entries, setEntries] = useState<SEOEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [newPath, setNewPath] = useState("");

  const fetchEntries = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("seo_metadata")
      .select("*")
      .order("page_path");
    setEntries((data as SEOEntry[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchEntries(); }, []);

  const updateField = (id: string, field: keyof SEOEntry, value: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleSave = async (entry: SEOEntry) => {
    const { error } = await supabase
      .from("seo_metadata")
      .update({ title: entry.title, description: entry.description, og_image: entry.og_image })
      .eq("id", entry.id);
    if (error) toast.error("Error al guardar");
    else toast.success(`SEO de "${entry.page_path}" guardado`);
  };

  const handleAdd = async () => {
    if (!newPath.trim()) return;
    const { error } = await supabase
      .from("seo_metadata")
      .insert({ page_path: newPath.trim(), title: "", description: "" });
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

  const filtered = entries.filter(e =>
    e.page_path.toLowerCase().includes(search.toLowerCase()) ||
    (e.title || "").toLowerCase().includes(search.toLowerCase())
  );

  const getTitleLength = (t: string | null) => (t || "").length;
  const getDescLength = (d: string | null) => (d || "").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">SEO & Meta Tags</h1>
          <p className="text-sm text-muted-foreground">Gestiona los títulos y descripciones de cada página</p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por ruta o título..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Input placeholder="/nueva-ruta" value={newPath} onChange={e => setNewPath(e.target.value)} className="w-48" />
        <Button onClick={handleAdd} size="sm"><Plus className="w-4 h-4 mr-1" /> Añadir</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No hay entradas SEO.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {filtered.map(entry => {
            const titleLen = getTitleLength(entry.title);
            const descLen = getDescLength(entry.description);
            return (
              <Card key={entry.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      {entry.page_path}
                    </CardTitle>
                    <div className="flex gap-2">
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
                      <label className="text-xs font-medium text-muted-foreground">Meta Title</label>
                      <span className={`text-xs ${titleLen > 60 ? "text-destructive" : titleLen > 50 ? "text-yellow-500" : "text-muted-foreground"}`}>
                        {titleLen}/60
                      </span>
                    </div>
                    <Input
                      value={entry.title || ""}
                      onChange={e => updateField(entry.id, "title", e.target.value)}
                      placeholder="Meta título de la página"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs font-medium text-muted-foreground">Meta Description</label>
                      <span className={`text-xs ${descLen > 160 ? "text-destructive" : descLen > 140 ? "text-yellow-500" : "text-muted-foreground"}`}>
                        {descLen}/160
                      </span>
                    </div>
                    <Textarea
                      value={entry.description || ""}
                      onChange={e => updateField(entry.id, "description", e.target.value)}
                      placeholder="Meta descripción de la página"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">OG Image (opcional)</label>
                    <Input
                      value={entry.og_image || ""}
                      onChange={e => updateField(entry.id, "og_image", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  {/* Google Preview */}
                  <div className="rounded-lg bg-muted/50 p-3 space-y-0.5">
                    <p className="text-xs text-muted-foreground">Vista previa en Google:</p>
                    <p className="text-primary text-sm truncate">{entry.title || "Sin título"}</p>
                    <p className="text-xs text-accent-foreground/70 truncate">silviocosta.net{entry.page_path}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{entry.description || "Sin descripción"}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminSEO;
