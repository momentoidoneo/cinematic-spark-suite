import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Download, Plus, Send, Trash2, Mail, Users } from "lucide-react";

type Sub = { id: string; email: string; name: string | null; provider: string; status: string; tags: string[]; subscribed_at: string; };
type Camp = { id: string; name: string; subject: string; html_content: string; provider: string; status: string; recipients_count: number; opens_count: number; clicks_count: number; scheduled_at: string | null; sent_at: string | null; };

const NewsletterManager = () => {
  const [tab, setTab] = useState("subscribers");
  const [subs, setSubs] = useState<Sub[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [provider, setProvider] = useState("resend");
  const [filter, setFilter] = useState("");

  // New subscriber
  const [newSub, setNewSub] = useState({ email: "", name: "", tags: "" });
  // New campaign
  const [campOpen, setCampOpen] = useState(false);
  const [camp, setCamp] = useState({ name: "", subject: "", preview_text: "", html_content: "", provider: "resend" });
  const [sending, setSending] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");

  const fetchAll = async () => {
    const { data: s } = await supabase.from("newsletter_subscribers").select("*").order("subscribed_at", { ascending: false });
    setSubs((s as Sub[]) || []);
    const { data: c } = await supabase.from("newsletter_campaigns").select("*").order("created_at", { ascending: false });
    setCamps((c as Camp[]) || []);
  };
  useEffect(() => { fetchAll(); }, []);

  const addSub = async () => {
    if (!newSub.email) return toast.error("Email requerido");
    const tags = newSub.tags ? newSub.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
    const { error } = await supabase.from("newsletter_subscribers").insert({
      email: newSub.email, name: newSub.name || null, provider, tags,
    });
    if (error) return toast.error(error.message);
    toast.success("Suscriptor añadido");
    setNewSub({ email: "", name: "", tags: "" });
    fetchAll();
  };

  const toggleSubStatus = async (id: string, current: string) => {
    const next = current === "subscribed" ? "unsubscribed" : "subscribed";
    await supabase.from("newsletter_subscribers").update({
      status: next, ...(next === "unsubscribed" ? { unsubscribed_at: new Date().toISOString() } : { unsubscribed_at: null }),
    }).eq("id", id);
    fetchAll();
  };
  const deleteSub = async (id: string) => {
    await supabase.from("newsletter_subscribers").delete().eq("id", id);
    fetchAll();
  };
  const exportCSV = () => {
    const filtered = subs.filter(s => !filter || s.email.toLowerCase().includes(filter.toLowerCase()) || (s.name || "").toLowerCase().includes(filter.toLowerCase()));
    const rows = [["email", "name", "provider", "status", "tags", "subscribed_at"], ...filtered.map(s => [s.email, s.name || "", s.provider, s.status, (s.tags || []).join("|"), s.subscribed_at])];
    const csv = "\uFEFF" + rows.map(r => r.map(f => `"${String(f).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `subscribers-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const createCamp = async () => {
    if (!camp.name || !camp.subject) return toast.error("Nombre y asunto requeridos");
    const { error } = await supabase.from("newsletter_campaigns").insert({ ...camp });
    if (error) return toast.error(error.message);
    toast.success("Campaña creada en borrador");
    setCampOpen(false);
    setCamp({ name: "", subject: "", preview_text: "", html_content: "", provider });
    fetchAll();
  };

  const sendCamp = async (id: string, test?: string) => {
    setSending(id);
    try {
      const { data, error } = await supabase.functions.invoke("send-newsletter", {
        body: { campaign_id: id, test_email: test || undefined },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(test ? `Email de prueba enviado a ${test}` : `Enviado: ${data.sent}/${data.total}`);
      fetchAll();
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setSending(null); }
  };

  const deleteCamp = async (id: string) => {
    await supabase.from("newsletter_campaigns").delete().eq("id", id);
    fetchAll();
  };

  const filteredSubs = subs.filter(s => !filter || s.email.toLowerCase().includes(filter.toLowerCase()) || (s.name || "").toLowerCase().includes(filter.toLowerCase()));
  const activeCount = subs.filter(s => s.status === "subscribed").length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h3 className="font-display text-xl">Newsletter</h3>
          <p className="text-sm text-muted-foreground">{activeCount} suscriptores activos · {subs.length} total</p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm">Proveedor:</Label>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="resend">Resend (propio)</SelectItem>
              <SelectItem value="brevo">Brevo</SelectItem>
              <SelectItem value="mailchimp">Mailchimp</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="subscribers"><Users className="w-4 h-4 mr-1" />Suscriptores</TabsTrigger>
          <TabsTrigger value="campaigns"><Mail className="w-4 h-4 mr-1" />Campañas</TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Añadir suscriptor manual</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-4 gap-2">
              <Input placeholder="Email" value={newSub.email} onChange={(e) => setNewSub({ ...newSub, email: e.target.value })} />
              <Input placeholder="Nombre" value={newSub.name} onChange={(e) => setNewSub({ ...newSub, name: e.target.value })} />
              <Input placeholder="Tags (coma)" value={newSub.tags} onChange={(e) => setNewSub({ ...newSub, tags: e.target.value })} />
              <Button onClick={addSub}><Plus className="w-4 h-4 mr-1" />Añadir</Button>
            </CardContent>
          </Card>

          <div className="flex gap-2 items-center">
            <Input placeholder="Buscar email o nombre..." value={filter} onChange={(e) => setFilter(e.target.value)} />
            <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-1" />CSV</Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr>
                  <th className="text-left p-2">Email</th><th className="text-left p-2">Nombre</th><th className="text-left p-2">Estado</th><th className="text-left p-2">Tags</th><th className="text-left p-2">Fecha</th><th></th>
                </tr></thead>
                <tbody>
                  {filteredSubs.map(s => (
                    <tr key={s.id} className="border-t">
                      <td className="p-2">{s.email}</td>
                      <td className="p-2">{s.name || "—"}</td>
                      <td className="p-2"><Badge variant={s.status === "subscribed" ? "default" : "secondary"}>{s.status}</Badge></td>
                      <td className="p-2 text-xs">{(s.tags || []).join(", ")}</td>
                      <td className="p-2 text-xs">{new Date(s.subscribed_at).toLocaleDateString()}</td>
                      <td className="p-2 text-right whitespace-nowrap">
                        <Button size="sm" variant="ghost" onClick={() => toggleSubStatus(s.id, s.status)}>{s.status === "subscribed" ? "Desuscribir" : "Reactivar"}</Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteSub(s.id)}><Trash2 className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  ))}
                  {filteredSubs.length === 0 && <tr><td colSpan={6} className="text-center text-muted-foreground p-6">Sin resultados</td></tr>}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={campOpen} onOpenChange={setCampOpen}>
              <DialogTrigger asChild><Button onClick={() => setCamp({ ...camp, provider })}><Plus className="w-4 h-4 mr-1" />Nueva campaña</Button></DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle>Nueva campaña ({provider})</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Nombre interno</Label><Input value={camp.name} onChange={(e) => setCamp({ ...camp, name: e.target.value })} /></div>
                  <div><Label>Asunto</Label><Input value={camp.subject} onChange={(e) => setCamp({ ...camp, subject: e.target.value })} /></div>
                  <div><Label>Texto de previsualización</Label><Input value={camp.preview_text} onChange={(e) => setCamp({ ...camp, preview_text: e.target.value })} /></div>
                  <div><Label>Contenido HTML</Label><Textarea rows={10} className="font-mono text-xs" value={camp.html_content} onChange={(e) => setCamp({ ...camp, html_content: e.target.value })} /></div>
                  <Button onClick={createCamp} className="w-full">Crear borrador</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-3">
            {camps.map(c => (
              <Card key={c.id}>
                <CardContent className="p-4 flex justify-between items-start flex-wrap gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{c.name}</p>
                      <Badge variant={c.status === "sent" ? "default" : "secondary"}>{c.status}</Badge>
                      <Badge variant="outline">{c.provider}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{c.subject}</p>
                    {c.status === "sent" && <p className="text-xs mt-1">{c.recipients_count} enviados · {c.opens_count} aperturas · {c.clicks_count} clics</p>}
                  </div>
                  <div className="flex gap-2 items-center flex-wrap">
                    {c.status === "draft" && (
                      <>
                        <Input placeholder="email@test.com" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} className="w-44 h-9" />
                        <Button size="sm" variant="outline" disabled={sending === c.id || !testEmail} onClick={() => sendCamp(c.id, testEmail)}>Test</Button>
                        <Button size="sm" disabled={sending === c.id} onClick={() => { if (confirm(`Enviar campaña a ${activeCount} suscriptores?`)) sendCamp(c.id); }}>
                          <Send className="w-3 h-3 mr-1" />Enviar
                        </Button>
                      </>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => deleteCamp(c.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {camps.length === 0 && <p className="text-center text-muted-foreground py-8">Sin campañas</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NewsletterManager;
