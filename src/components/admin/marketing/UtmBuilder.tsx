import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, Download, Trash2, Plus } from "lucide-react";

type UtmLink = {
  id: string;
  name: string;
  base_url: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string | null;
  utm_content: string | null;
  full_url: string;
  click_count: number;
  created_at: string;
};

const buildUrl = (base: string, params: Record<string, string>) => {
  try {
    const u = new URL(base);
    Object.entries(params).forEach(([k, v]) => { if (v) u.searchParams.set(k, v); });
    return u.toString();
  } catch {
    return base;
  }
};

const UtmBuilder = () => {
  const [links, setLinks] = useState<UtmLink[]>([]);
  const [form, setForm] = useState({
    name: "", base_url: "https://silviocosta.net",
    utm_source: "", utm_medium: "", utm_campaign: "", utm_term: "", utm_content: "",
  });
  const [preview, setPreview] = useState("");

  useEffect(() => {
    setPreview(buildUrl(form.base_url, {
      utm_source: form.utm_source, utm_medium: form.utm_medium,
      utm_campaign: form.utm_campaign, utm_term: form.utm_term, utm_content: form.utm_content,
    }));
  }, [form]);

  const fetchLinks = async () => {
    const { data } = await supabase.from("utm_links").select("*").order("created_at", { ascending: false });
    setLinks((data as UtmLink[]) || []);
  };
  useEffect(() => { fetchLinks(); }, []);

  const save = async () => {
    if (!form.name || !form.utm_source || !form.utm_medium || !form.utm_campaign) {
      toast.error("Rellena nombre, source, medium y campaign");
      return;
    }
    const { error } = await supabase.from("utm_links").insert({
      name: form.name, base_url: form.base_url,
      utm_source: form.utm_source, utm_medium: form.utm_medium, utm_campaign: form.utm_campaign,
      utm_term: form.utm_term || null, utm_content: form.utm_content || null,
      full_url: preview,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Enlace guardado");
    setForm({ ...form, name: "", utm_term: "", utm_content: "" });
    fetchLinks();
  };

  const copy = (url: string) => { navigator.clipboard.writeText(url); toast.success("Copiado"); };

  const downloadQR = (id: string, name: string) => {
    const canvas = document.getElementById(`qr-${id}`) as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-${name.replace(/\s+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const remove = async (id: string) => {
    await supabase.from("utm_links").delete().eq("id", id);
    fetchLinks();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Crear enlace UTM</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Nombre interno *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Campaña Instagram verano" /></div>
            <div><Label>URL base *</Label><Input value={form.base_url} onChange={(e) => setForm({ ...form, base_url: e.target.value })} /></div>
            <div><Label>utm_source *</Label><Input value={form.utm_source} onChange={(e) => setForm({ ...form, utm_source: e.target.value })} placeholder="instagram" /></div>
            <div><Label>utm_medium *</Label><Input value={form.utm_medium} onChange={(e) => setForm({ ...form, utm_medium: e.target.value })} placeholder="social" /></div>
            <div><Label>utm_campaign *</Label><Input value={form.utm_campaign} onChange={(e) => setForm({ ...form, utm_campaign: e.target.value })} placeholder="verano_2026" /></div>
            <div><Label>utm_term</Label><Input value={form.utm_term} onChange={(e) => setForm({ ...form, utm_term: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>utm_content</Label><Input value={form.utm_content} onChange={(e) => setForm({ ...form, utm_content: e.target.value })} /></div>
          </div>
          <div className="p-3 bg-muted rounded font-mono text-xs break-all">{preview}</div>
          <div className="flex gap-2">
            <Button onClick={save}><Plus className="w-4 h-4 mr-1" /> Guardar</Button>
            <Button variant="outline" onClick={() => copy(preview)}><Copy className="w-4 h-4 mr-1" /> Copiar</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((l) => (
          <Card key={l.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <p className="font-medium truncate">{l.name}</p>
                  <p className="text-xs text-muted-foreground">{l.utm_campaign} · {l.utm_source}/{l.utm_medium}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => remove(l.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
              <div className="flex justify-center bg-white p-3 rounded">
                <QRCodeCanvas id={`qr-${l.id}`} value={l.full_url} size={140} includeMargin />
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => copy(l.full_url)}><Copy className="w-3 h-3 mr-1" />URL</Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => downloadQR(l.id, l.name)}><Download className="w-3 h-3 mr-1" />QR</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {links.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">No hay enlaces todavía</p>}
      </div>
    </div>
  );
};

export default UtmBuilder;
