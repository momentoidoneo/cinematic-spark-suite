import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Play, Pause, Plus, Trash2, Trophy } from "lucide-react";

type Test = {
  id: string; name: string; description: string | null;
  location: string; status: string;
  target_device: string; target_source: string | null;
  started_at: string | null; ended_at: string | null;
  winner_variant_id: string | null;
};
type Variant = {
  id: string; test_id: string; label: string;
  button_text: string; button_color: string | null;
  weight: number; is_control: boolean;
};

const AbTestManager = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [variants, setVariants] = useState<Record<string, Variant[]>>({});
  const [stats, setStats] = useState<Record<string, { impressions: number; clicks: number }>>({});
  const [newOpen, setNewOpen] = useState(false);
  const [newTest, setNewTest] = useState({ name: "", description: "", location: "hero", target_device: "all", target_source: "" });
  const [editing, setEditing] = useState<string | null>(null);
  const [newVar, setNewVar] = useState({ label: "B", button_text: "", button_color: "", weight: 50 });

  const fetchAll = async () => {
    const { data: t } = await supabase.from("ab_tests").select("*").order("created_at", { ascending: false });
    const ts = (t as Test[]) || [];
    setTests(ts);
    if (ts.length) {
      const { data: v } = await supabase.from("ab_test_variants").select("*").in("test_id", ts.map(x => x.id));
      const byTest: Record<string, Variant[]> = {};
      (v as Variant[] || []).forEach(x => { (byTest[x.test_id] = byTest[x.test_id] || []).push(x); });
      setVariants(byTest);
      const { data: ev } = await supabase.from("ab_test_events").select("variant_id,event_type").in("test_id", ts.map(x => x.id));
      const s: Record<string, { impressions: number; clicks: number }> = {};
      (ev || []).forEach((e: any) => {
        s[e.variant_id] = s[e.variant_id] || { impressions: 0, clicks: 0 };
        if (e.event_type === "impression") s[e.variant_id].impressions++;
        if (e.event_type === "click" || e.event_type === "conversion") s[e.variant_id].clicks++;
      });
      setStats(s);
    }
  };
  useEffect(() => { fetchAll(); }, []);

  const createTest = async () => {
    if (!newTest.name) return toast.error("Nombre requerido");
    const { data, error } = await supabase.from("ab_tests").insert({
      name: newTest.name, description: newTest.description || null,
      location: newTest.location, target_device: newTest.target_device,
      target_source: newTest.target_source || null,
    }).select().single();
    if (error) return toast.error(error.message);
    await supabase.from("ab_test_variants").insert({
      test_id: data.id, label: "A", button_text: "Solicitar Presupuesto",
      weight: 50, is_control: true,
    });
    setNewOpen(false);
    setNewTest({ name: "", description: "", location: "hero", target_device: "all", target_source: "" });
    fetchAll();
  };

  const addVariant = async (testId: string) => {
    if (!newVar.button_text) return toast.error("Texto del botón requerido");
    await supabase.from("ab_test_variants").insert({
      test_id: testId, label: newVar.label,
      button_text: newVar.button_text,
      button_color: newVar.button_color || null,
      weight: newVar.weight,
    });
    setNewVar({ label: "C", button_text: "", button_color: "", weight: 50 });
    fetchAll();
  };

  const setStatus = async (id: string, status: string) => {
    await supabase.from("ab_tests").update({
      status, ...(status === "running" ? { started_at: new Date().toISOString() } : {}),
      ...(status === "completed" ? { ended_at: new Date().toISOString() } : {}),
    }).eq("id", id);
    fetchAll();
  };

  const declareWinner = async (testId: string, variantId: string) => {
    await supabase.from("ab_tests").update({ winner_variant_id: variantId, status: "completed", ended_at: new Date().toISOString() }).eq("id", testId);
    toast.success("Ganador declarado");
    fetchAll();
  };

  const deleteTest = async (id: string) => {
    await supabase.from("ab_tests").delete().eq("id", id);
    fetchAll();
  };

  const ctr = (imp: number, clicks: number) => imp > 0 ? ((clicks / imp) * 100).toFixed(2) : "0.00";

  const significance = (a: {imp:number;clk:number}, b: {imp:number;clk:number}) => {
    if (a.imp < 30 || b.imp < 30) return "N/A (muestra pequeña)";
    const p1 = a.clk/a.imp, p2 = b.clk/b.imp;
    const pool = (a.clk + b.clk) / (a.imp + b.imp);
    const se = Math.sqrt(pool*(1-pool)*(1/a.imp + 1/b.imp));
    if (se === 0) return "N/A";
    const z = Math.abs(p1 - p2) / se;
    if (z > 2.58) return "99% significativo";
    if (z > 1.96) return "95% significativo";
    if (z > 1.64) return "90% significativo";
    return "No significativo aún";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-display text-xl">A/B Testing de CTAs</h3>
          <p className="text-sm text-muted-foreground">Prueba variantes del botón principal y mide significancia estadística.</p>
        </div>
        <Dialog open={newOpen} onOpenChange={setNewOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-1" />Nuevo test</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuevo A/B test</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nombre</Label><Input value={newTest.name} onChange={(e) => setNewTest({ ...newTest, name: e.target.value })} /></div>
              <div><Label>Descripción</Label><Textarea value={newTest.description} onChange={(e) => setNewTest({ ...newTest, description: e.target.value })} /></div>
              <div><Label>Ubicación</Label>
                <Select value={newTest.location} onValueChange={(v) => setNewTest({ ...newTest, location: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hero">Hero</SelectItem>
                    <SelectItem value="cta-section">Sección CTA</SelectItem>
                    <SelectItem value="floating">Botón flotante</SelectItem>
                    <SelectItem value="service-page">Página de servicio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Dispositivo</Label>
                <Select value={newTest.target_device} onValueChange={(v) => setNewTest({ ...newTest, target_device: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="desktop">Escritorio</SelectItem>
                    <SelectItem value="mobile">Móvil</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Fuente UTM (opcional)</Label><Input value={newTest.target_source} onChange={(e) => setNewTest({ ...newTest, target_source: e.target.value })} placeholder="instagram" /></div>
              <Button onClick={createTest} className="w-full">Crear test (se añade variante A control)</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {tests.map((t) => {
          const vs = variants[t.id] || [];
          return (
            <Card key={t.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">{t.name}
                    <Badge variant={t.status === "running" ? "default" : "secondary"}>{t.status}</Badge>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{t.location} · {t.target_device}{t.target_source ? ` · ${t.target_source}` : ""}</p>
                </div>
                <div className="flex gap-2">
                  {t.status !== "running" && <Button size="sm" onClick={() => setStatus(t.id, "running")}><Play className="w-3 h-3 mr-1" />Iniciar</Button>}
                  {t.status === "running" && <Button size="sm" variant="outline" onClick={() => setStatus(t.id, "paused")}><Pause className="w-3 h-3 mr-1" />Pausar</Button>}
                  <Button size="icon" variant="ghost" onClick={() => deleteTest(t.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {vs.map((v) => {
                    const s = stats[v.id] || { impressions: 0, clicks: 0 };
                    const control = vs.find(x => x.is_control);
                    const cs = control ? stats[control.id] || { impressions: 0, clicks: 0 } : null;
                    const isWinner = t.winner_variant_id === v.id;
                    return (
                      <div key={v.id} className={`p-3 rounded border ${isWinner ? "border-primary bg-primary/5" : "border-border"}`}>
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <div>
                            <Badge variant={v.is_control ? "secondary" : "outline"}>Variante {v.label}{v.is_control && " (control)"}</Badge>
                            <p className="font-medium mt-1">{v.button_text}</p>
                            {v.button_color && <p className="text-xs text-muted-foreground">Color: {v.button_color}</p>}
                          </div>
                          <div className="text-sm">
                            <span className="mr-4">Impr.: <b>{s.impressions}</b></span>
                            <span className="mr-4">Clicks: <b>{s.clicks}</b></span>
                            <span>CTR: <b>{ctr(s.impressions, s.clicks)}%</b></span>
                          </div>
                        </div>
                        {!v.is_control && cs && (
                          <p className="text-xs text-muted-foreground mt-2">
                            vs control: {significance({ imp: cs.impressions, clk: cs.clicks }, { imp: s.impressions, clk: s.clicks })}
                          </p>
                        )}
                        {!isWinner && t.status === "running" && vs.length > 1 && (
                          <Button size="sm" variant="ghost" className="mt-2" onClick={() => declareWinner(t.id, v.id)}>
                            <Trophy className="w-3 h-3 mr-1" />Declarar ganador
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
                {editing === t.id ? (
                  <div className="p-3 bg-muted/30 rounded space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Etiqueta (B,C...)" value={newVar.label} onChange={(e) => setNewVar({ ...newVar, label: e.target.value })} />
                      <Input placeholder="Peso %" type="number" value={newVar.weight} onChange={(e) => setNewVar({ ...newVar, weight: parseInt(e.target.value) || 50 })} />
                    </div>
                    <Input placeholder="Texto botón" value={newVar.button_text} onChange={(e) => setNewVar({ ...newVar, button_text: e.target.value })} />
                    <Input placeholder="Clase Tailwind (ej: bg-accent)" value={newVar.button_color} onChange={(e) => setNewVar({ ...newVar, button_color: e.target.value })} />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => { addVariant(t.id); setEditing(null); }}>Añadir</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
                    </div>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setEditing(t.id)}><Plus className="w-3 h-3 mr-1" />Añadir variante</Button>
                )}
              </CardContent>
            </Card>
          );
        })}
        {tests.length === 0 && <p className="text-center text-muted-foreground py-8">No hay tests aún</p>}
      </div>
    </div>
  );
};

export default AbTestManager;
