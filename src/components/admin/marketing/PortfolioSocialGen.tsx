import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Sparkles, Image as ImageIcon } from "lucide-react";

type PortfolioImg = { id: string; image_url: string; title: string | null; subcategory_id: string };

const FORMATS = [
  { value: "instagram-square", label: "Instagram Post (1:1)" },
  { value: "instagram-story", label: "Instagram Story (9:16)" },
  { value: "instagram-reel", label: "Reel/TikTok (9:16)" },
  { value: "facebook-post", label: "Facebook (1.91:1)" },
  { value: "linkedin", label: "LinkedIn (1.91:1)" },
];

const PortfolioSocialGen = () => {
  const [imgs, setImgs] = useState<PortfolioImg[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [format, setFormat] = useState("instagram-square");
  const [overlay, setOverlay] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("portfolio_images").select("id,image_url,title,subcategory_id").eq("media_type", "image").order("created_at", { ascending: false }).limit(60)
      .then(({ data }) => setImgs((data as PortfolioImg[]) || []));
  }, []);

  const toggle = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const generate = async () => {
    if (selected.size === 0) return toast.error("Selecciona al menos una imagen");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-social-from-portfolio", {
        body: { image_ids: Array.from(selected), format, overlay_text: overlay || undefined, save_to_bank: true },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const ok = (data.results || []).filter((r: any) => !r.error).length;
      const fail = (data.results || []).filter((r: any) => r.error).length;
      toast.success(`Generadas ${ok}${fail ? ` · ${fail} fallaron` : ""} — guardadas en Banco de contenido`);
      setSelected(new Set());
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-xl">Generador de imágenes para redes</h3>
        <p className="text-sm text-muted-foreground">Selecciona fotos del portafolio y genera versiones listas para redes con IA. Se guardan en el Banco.</p>
      </div>

      <Card>
        <CardContent className="p-4 grid md:grid-cols-3 gap-3">
          <div>
            <Label>Formato</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{FORMATS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Texto a superponer (opcional)</Label>
            <Input value={overlay} onChange={(e) => setOverlay(e.target.value)} placeholder="Fotografía profesional en Lisboa" />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{selected.size} seleccionadas de {imgs.length}</p>
        <Button onClick={generate} disabled={loading || selected.size === 0}>
          <Sparkles className="w-4 h-4 mr-1" />{loading ? "Generando..." : "Generar con IA"}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {imgs.map(img => (
          <button key={img.id} onClick={() => toggle(img.id)} className={`relative rounded overflow-hidden border-2 transition ${selected.has(img.id) ? "border-primary ring-2 ring-primary" : "border-transparent"}`}>
            <img src={img.image_url} alt={img.title || ""} className="aspect-square object-cover w-full" loading="lazy" />
            <div className="absolute top-1 left-1">
              <Checkbox checked={selected.has(img.id)} onCheckedChange={() => toggle(img.id)} />
            </div>
          </button>
        ))}
        {imgs.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8"><ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />Sin imágenes en el portafolio</p>}
      </div>
    </div>
  );
};

export default PortfolioSocialGen;
