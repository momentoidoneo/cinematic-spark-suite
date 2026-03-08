import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2, RefreshCw, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CoverGeneratorProps {
  type: "category" | "subcategory";
  missingCount: number;
  totalCount: number;
  onComplete: () => void;
}

const CoverGenerator = ({ type, missingCount, totalCount, onComplete }: CoverGeneratorProps) => {
  const [generating, setGenerating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [mode, setMode] = useState<"missing" | "all">("missing");
  const [style, setStyle] = useState("");

  const handleGenerate = async () => {
    setShowDialog(false);
    setGenerating(true);
    const count = mode === "missing" ? missingCount : totalCount;
    toast.info(`Generando ${count} portadas con IA… esto puede tardar unos minutos.`);

    try {
      const payload: any = { type };
      if (mode === "all") payload.regenerate = true;
      if (style.trim()) payload.style = style.trim();

      const { data, error } = await supabase.functions.invoke("generate-covers", { body: payload });
      if (error) throw error;
      toast.success(data?.message || "Portadas generadas");
      onComplete();
    } catch (e: any) {
      toast.error("Error generando portadas: " + (e.message || "desconocido"));
    } finally {
      setGenerating(false);
    }
  };

  const openDialog = (m: "missing" | "all") => {
    setMode(m);
    setShowDialog(true);
  };

  if (totalCount === 0) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm font-semibold hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-primary" />}
            Portadas IA
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {missingCount > 0 && (
            <DropdownMenuItem onClick={() => openDialog("missing")}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generar {missingCount} sin portada
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => openDialog("all")}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerar todas ({totalCount})
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {mode === "missing" ? `Generar ${missingCount} portadas` : `Regenerar ${totalCount} portadas`}
            </DialogTitle>
            <DialogDescription>
              {mode === "missing"
                ? "Se generarán portadas solo para los elementos sin imagen."
                : "Se regenerarán TODAS las portadas, reemplazando las existentes."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Estilo general (opcional)
              </label>
              <textarea
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="Ej: Estilo cinematográfico oscuro, tonos azules y dorados, aspecto premium y elegante..."
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground resize-none"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Este estilo se aplicará a todas las imágenes generadas. Déjalo vacío para el estilo por defecto.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleGenerate} className="flex-1">
                <Sparkles className="w-4 h-4 mr-2" />
                {mode === "missing" ? "Generar" : "Regenerar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CoverGenerator;
