import {invokeAdminAi} from "@/lib/adminAiOperation";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface GalleryGeneratorProps {
  subcategoryId: string;
  subcategoryName: string;
  categoryName: string;
  onComplete: () => void;
}

const GalleryGenerator = ({ subcategoryId, subcategoryName, categoryName, onComplete }: GalleryGeneratorProps) => {
  const [generating, setGenerating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [style, setStyle] = useState("");
  const [context, setContext] = useState("");
  const [count, setCount] = useState(4);

  const handleGenerate = async () => {
    setShowDialog(false);
    setGenerating(true);
    toast.info(`Generando ${count} imágenes con IA para "${subcategoryName}"… esto puede tardar unos minutos.`);

    try {
      let completed=0;
      for(let i=0;i<count;i++){
        const {data,error}=await invokeAdminAi('generate-gallery',{body:{subcategory_id:subcategoryId,style:style.trim()||undefined,context:context.trim()||undefined,count:1,variation:i+1}});
        if(error)throw error;
        if(data?.results?.[0]?.status!=='ok')throw new Error(data?.results?.[0]?.status||'La imagen no se guardó');
        completed++;
      }
      toast.success(`${completed} imágenes generadas y guardadas`);
      onComplete();
    } catch (e: any) {
      toast.error("Error generando galería: " + (e.message || "desconocido"));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        disabled={generating}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm font-semibold hover:bg-secondary/80 transition-colors disabled:opacity-50"
      >
        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4 text-primary" />}
        {generating ? "Generando…" : "Generar Galería IA"}
      </button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Generar galería con IA
            </DialogTitle>
            <DialogDescription>
              Genera imágenes automáticamente para <strong>{categoryName} → {subcategoryName}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Count */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Número de imágenes
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="text-sm font-bold text-foreground w-8 text-center bg-secondary rounded-lg py-1">
                  {count}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Cada imagen puede tardar varios minutos. Se procesan una a una y se conservan las completadas.
              </p>
            </div>

            {/* Context */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Contexto / Descripción
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Ej: Sesión de fotos de una villa de lujo en Marbella con piscina infinity y vistas al mar…"
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground resize-none"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Describe qué tipo de contenido específico quieres en la galería.
              </p>
            </div>

            {/* Style */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Estilo visual (opcional)
              </label>
              <textarea
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="Ej: Cinematográfico, tonos cálidos dorados, aspecto premium y elegante, bokeh suave…"
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground resize-none"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleGenerate} className="flex-1">
                <Sparkles className="w-4 h-4 mr-2" />
                Generar {count} imágenes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GalleryGenerator;
