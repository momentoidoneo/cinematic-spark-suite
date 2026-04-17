import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, RefreshCw, Eye, ExternalLink, AlertCircle } from "lucide-react";

type Competitor = {
  id: string; name: string; url: string; notes: string | null;
  monitoring_mode: string; is_active: boolean;
  last_checked_at: string | null; last_change_detected_at: string | null;
};
type Snapshot = {
  id: string; competitor_id: string; title: string | null;
  meta_description: string | null; changes_summary: string | null;
  has_changes: boolean; created_at: string; markdown: string | null;
};

const CompetitorTracker = () => {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [snapshots, setSnapshots] = useState<Record<string, Snapshot[]>>({});
  const [form, setForm] = useState({ name: "", url: "", notes: "", monitoring_mode: "manual" });
  const [tracking, setTracking] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Snapshot | null>(null);

  const fetchAll = async () => {
    const { data: c } = await supabase.from("competitors").select("*").order("created_at", { ascending: false });
    const cs = (c as Competitor[]) || [];
    setCompetitors(cs);
    if (cs.length) {
      const { data: s } = await supabase.from("competitor_snapshots").select("*").in("competitor_id", cs.map(x => x.id)).order("created_at", { ascending: false });
      const by: Record<string, Snapshot[]> = {};
      ((s as Snapshot[]) || []).forEach(x => { (by[x.competitor_id] = by[x.competitor_id] || []).push(x); });
      setSnapshots(by);
    }
  };
  useEffect(() => { fetchAll(); }, []);

  const add = async () => {
    if (!form.name || !form.url) return toast.error("Nombre y URL requeridos");
    try { new URL(form.url); } catch { return toast.error("URL no válida"); }
    const { error } = await supabase.from("competitors").insert({
      name: form.name, url: form.url, notes: form.notes || null,
      monitoring_mode: form.monitoring_mode,
    });
    if (error) return toast.error(error.message);
    setForm({ name: "", url: "", notes: "", monitoring_mode: "manual" });
    fetchAll();
  };

  const track = async (id: string) => {
    setTracking(id);
    try {
      const { data, error } = await supabase.functions.invoke("track-competitor", { body: { competitor_id: id } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const res = data.results?.[0];
      toast.success(res?.hasChanges ? "¡Cambios detectados!" : "Sin cambios");
      fetchAll();
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setTracking(null); }
  };

  const toggleMode = async (id: string, current: string) => {
    const next = current === "weekly" ? "manual" : "weekly";
    await supabase.from("competitors").update({ monitoring_mode: next }).eq("id", id);
    fetchAll();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar competidor y todos sus snapshots?")) return;
    await supabase.from("competitors").delete().eq("id", id);
    fetchAll();
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-xl">Tracker de Competidores</h3>
        <p className="text-sm text-muted-foreground">Monitoriza cambios en sitios web de la competencia usando Firecrawl + IA.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Añadir competidor</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-5 gap-2">
          <Input placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input className="md:col-span-2" placeholder="https://..." value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          <Select value={form.monitoring_mode} onValueChange={(v) => setForm({ ...form, monitoring_mode: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="weekly">Semanal auto</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={add}><Plus className="w-4 h-4 mr-1" />Añadir</Button>
          <Textarea className="md:col-span-5" placeholder="Notas internas" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {competitors.map(c => {
          const history = snapshots[c.id] || [];
          const latest = history[0];
          return (
            <Card key={c.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{c.name}</p>
                      <Badge variant={c.monitoring_mode === "weekly" ? "default" : "secondary"}>{c.monitoring_mode}</Badge>
                      {latest?.has_changes && <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Cambios recientes</Badge>}
                    </div>
                    <a href={c.url} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:underline inline-flex items-center gap-1">
                      {c.url} <ExternalLink className="w-3 h-3" />
                    </a>
                    {c.notes && <p className="text-xs mt-1">{c.notes}</p>}
                    <p className="text-xs text-muted-foreground mt-1">
                      Último check: {c.last_checked_at ? new Date(c.last_checked_at).toLocaleString() : "nunca"}
                      {c.last_change_detected_at && ` · Último cambio: ${new Date(c.last_change_detected_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => track(c.id)} disabled={tracking === c.id}>
                      <RefreshCw className={`w-3 h-3 mr-1 ${tracking === c.id ? "animate-spin" : ""}`} />Analizar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toggleMode(c.id, c.monitoring_mode)}>
                      {c.monitoring_mode === "weekly" ? "Desactivar auto" : "Activar auto"}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>

                {latest && (
                  <div className="bg-muted/30 rounded p-3 text-sm">
                    {latest.title && <p className="font-medium">{latest.title}</p>}
                    {latest.meta_description && <p className="text-xs text-muted-foreground">{latest.meta_description}</p>}
                    {latest.changes_summary && (
                      <div className="mt-2 whitespace-pre-wrap text-xs">{latest.changes_summary}</div>
                    )}
                  </div>
                )}

                {history.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    <Label className="text-xs text-muted-foreground self-center">Historial:</Label>
                    {history.slice(0, 6).map(h => (
                      <Button key={h.id} size="sm" variant="ghost" onClick={() => setViewing(h)} className="h-7 text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        {new Date(h.created_at).toLocaleDateString()}
                        {h.has_changes && <span className="ml-1 w-2 h-2 rounded-full bg-destructive" />}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {competitors.length === 0 && <p className="text-center text-muted-foreground py-8">Sin competidores añadidos</p>}
      </div>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Snapshot del {viewing && new Date(viewing.created_at).toLocaleString()}</DialogTitle></DialogHeader>
          {viewing?.changes_summary && (
            <div className="p-3 bg-accent/10 rounded">
              <p className="font-medium mb-1">Resumen IA de cambios:</p>
              <p className="whitespace-pre-wrap text-sm">{viewing.changes_summary}</p>
            </div>
          )}
          <pre className="text-xs whitespace-pre-wrap bg-muted/30 p-3 rounded max-h-96 overflow-y-auto">{viewing?.markdown || "(sin contenido)"}</pre>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompetitorTracker;
