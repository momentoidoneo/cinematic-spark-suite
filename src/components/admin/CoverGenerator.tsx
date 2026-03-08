import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2, RefreshCw, ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface CoverItem {
  id: string;
  name: string;
  cover_image: string | null;
  categoryName?: string;
}

interface CoverGeneratorProps {
  type: "category" | "subcategory";
  items: CoverItem[];
  onComplete: () => void;
}

const CoverGenerator = ({ type, items, onComplete }: CoverGeneratorProps) => {
  const [generating, setGenerating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [mode, setMode] = useState<"missing" | "all" | "selected">("missing");
  const [style, setStyle] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const missingCount = items.filter(i => !i.cover_image).length;
  const totalCount = items.length;

  const toggleItem = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === items.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(items.map(i => i.id)));
  };

  const handleGenerate = async () => {
    setShowDialog(false);
    setGenerating(true);

    const count = mode === "missing" ? missingCount : mode === "all" ? totalCount : selectedIds.size;
    toast.info(`Generando ${count} portadas con IA… esto puede tardar unos minutos.`);

    try {
      const payload: any = { type };
      if (mode === "all") payload.regenerate = true;
      if (mode === "selected") payload.ids = Array.from(selectedIds);
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

  const openDialog = (m: "missing" | "all" | "selected") => {
    setMode(m);
    if (m === "selected") setSelectedIds(new Set());
    setShowDialog(true);
  };

  if (totalCount === 0) return null;

  const dialogTitle = mode === "missing"
    ? `Generar ${missingCount} portadas`
    : mode === "all"
    ? `Regenerar ${totalCount} portadas`
    : `Generar portadas seleccionadas (${selectedIds.size})`;

  const dialogDesc = mode === "missing"
    ? "Se generarán portadas solo para los elementos sin imagen."
    : mode === "all"
    ? "Se regenerarán TODAS las portadas, reemplazando las existentes."
    : "Selecciona los elementos para los que quieres generar o regenerar portadas.";

  // Group items by category for subcategories
  const groupedItems = type === "subcategory"
    ? items.reduce<Record<string, CoverItem[]>>((acc, item) => {
        const cat = item.categoryName || "Sin categoría";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
      }, {})
    : null;

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
          <DropdownMenuItem onClick={() => openDialog("selected")}>
            <Check className="w-4 h-4 mr-2" />
            Seleccionar elementos…
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openDialog("all")}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerar todas ({totalCount})
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDesc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2 flex-1 overflow-hidden flex flex-col">
            {/* Item selector for "selected" mode */}
            {mode === "selected" && (
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{selectedIds.size} seleccionados</span>
                  <button onClick={selectAll} className="text-xs text-primary hover:underline">
                    {selectedIds.size === items.length ? "Deseleccionar todo" : "Seleccionar todo"}
                  </button>
                </div>
                <div className="overflow-y-auto flex-1 border border-border rounded-lg divide-y divide-border max-h-[300px]">
                  {groupedItems ? (
                    Object.entries(groupedItems).map(([catName, catItems]) => (
                      <div key={catName}>
                        <div className="px-3 py-1.5 bg-secondary/50 text-xs font-semibold text-muted-foreground sticky top-0">
                          {catName}
                        </div>
                        {catItems.map(item => (
                          <label
                            key={item.id}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-secondary/30 cursor-pointer"
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                              selectedIds.has(item.id) ? "bg-primary border-primary" : "border-muted-foreground/40"
                            }`}>
                              {selectedIds.has(item.id) && <Check className="w-3 h-3 text-primary-foreground" />}
                            </div>
                            <span className="text-sm text-foreground flex-1">{item.name}</span>
                            {item.cover_image ? (
                              <img src={item.cover_image} alt="" className="w-8 h-8 rounded object-cover border border-border" />
                            ) : (
                              <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">Sin portada</span>
                            )}
                          </label>
                        ))}
                      </div>
                    ))
                  ) : (
                    items.map(item => (
                      <label
                        key={item.id}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-secondary/30 cursor-pointer"
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          selectedIds.has(item.id) ? "bg-primary border-primary" : "border-muted-foreground/40"
                        }`}>
                          {selectedIds.has(item.id) && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <span className="text-sm text-foreground flex-1">{item.name}</span>
                        {item.cover_image ? (
                          <img src={item.cover_image} alt="" className="w-8 h-8 rounded object-cover border border-border" />
                        ) : (
                          <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">Sin portada</span>
                        )}
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Style input */}
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
              <Button
                onClick={handleGenerate}
                className="flex-1"
                disabled={mode === "selected" && selectedIds.size === 0}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {mode === "selected" ? `Generar (${selectedIds.size})` : mode === "missing" ? "Generar" : "Regenerar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CoverGenerator;
