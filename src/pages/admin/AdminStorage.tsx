import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HardDrive, Image, Trash2, Download, RefreshCw, FolderOpen, Zap, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface StorageFile {
  name: string;
  id: string;
  metadata: Record<string, any> | null;
  created_at: string;
}

interface OptimizableFile {
  bucket: string;
  path: string;
  size: number;
}

interface OptimizeResult {
  path: string;
  bucket: string;
  status: string;
  original_size?: number;
  optimized_size?: number;
  error?: string;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const AdminStorage = () => {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSize, setTotalSize] = useState(0);

  // Optimizer state
  const [optimizing, setOptimizing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannedFiles, setScannedFiles] = useState<OptimizableFile[]>([]);
  const [optimizeProgress, setOptimizeProgress] = useState(0);
  const [optimizeTotal, setOptimizeTotal] = useState(0);
  const [optimizeResults, setOptimizeResults] = useState<OptimizeResult[]>([]);
  const [savedBytes, setSavedBytes] = useState(0);

  const fetchFiles = async () => {
    setLoading(true);
    const { data, error } = await supabase.storage.from("portfolio").list("", { limit: 500, sortBy: { column: "created_at", order: "desc" } });
    if (error) { toast.error(error.message); setLoading(false); return; }
    const validFiles = (data || []).filter((f) => f.name !== ".emptyFolderPlaceholder");
    setFiles(validFiles as StorageFile[]);
    setTotalSize(validFiles.reduce((acc, f) => acc + ((f.metadata as any)?.size || 0), 0));
    setLoading(false);
  };

  useEffect(() => { fetchFiles(); }, []);

  const handleDelete = async (name: string) => {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    const { error } = await supabase.storage.from("portfolio").remove([name]);
    if (error) { toast.error(error.message); return; }
    toast.success("Archivo eliminado");
    fetchFiles();
  };

  const getPublicUrl = (name: string) => {
    const { data } = supabase.storage.from("portfolio").getPublicUrl(name);
    return data.publicUrl;
  };

  const isImage = (name: string) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);

  // --- Optimizer Functions ---
  const scanImages = async () => {
    setScanning(true);
    setScannedFiles([]);
    setOptimizeResults([]);
    setSavedBytes(0);

    try {
      const { data, error } = await supabase.functions.invoke("optimize-images", {
        body: { action: "list" },
      });

      if (error) throw error;
      setScannedFiles(data.files || []);
      toast.success(`${data.files?.length || 0} imágenes encontradas`);
    } catch (e: any) {
      toast.error("Error escaneando: " + (e.message || "Error desconocido"));
    } finally {
      setScanning(false);
    }
  };

  const optimizeAll = async () => {
    if (scannedFiles.length === 0) return;
    setOptimizing(true);
    setOptimizeProgress(0);
    setOptimizeResults([]);
    setSavedBytes(0);

    const BATCH_SIZE = 3;
    const total = scannedFiles.length;
    setOptimizeTotal(total);
    let processed = 0;
    let totalSaved = 0;
    const allResults: OptimizeResult[] = [];

    for (let i = 0; i < scannedFiles.length; i += BATCH_SIZE) {
      const batch = scannedFiles.slice(i, i + BATCH_SIZE);

      try {
        const { data, error } = await supabase.functions.invoke("optimize-images", {
          body: { action: "optimize", files: batch },
        });

        if (error) throw error;

        const results: OptimizeResult[] = data.results || [];
        allResults.push(...results);

        for (const r of results) {
          if (r.status === "optimized" && r.original_size && r.optimized_size) {
            totalSaved += r.original_size - r.optimized_size;
          }
        }
      } catch (e: any) {
        for (const f of batch) {
          allResults.push({ path: f.path, bucket: f.bucket, status: "error", error: e.message });
        }
      }

      processed += batch.length;
      setOptimizeProgress(processed);
      setOptimizeResults([...allResults]);
      setSavedBytes(totalSaved);
    }

    setOptimizing(false);
    toast.success(`Optimización completada. Ahorro: ${formatSize(totalSaved)}`);
    fetchFiles();
  };

  const optimizedCount = optimizeResults.filter(r => r.status === "optimized").length;
  const skippedCount = optimizeResults.filter(r => r.status === "skipped").length;
  const errorCount = optimizeResults.filter(r => r.status === "error").length;
  const totalScannedSize = scannedFiles.reduce((acc, f) => acc + f.size, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Almacenamiento</h1>
          <p className="text-sm text-muted-foreground">{files.length} archivos · {formatSize(totalSize)} usado</p>
        </div>
        <button onClick={fetchFiles} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className="w-4 h-4" /> Actualizar
        </button>
      </div>

      {/* Optimizer Section */}
      <div className="rounded-xl border border-border bg-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Optimizador de Imágenes
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Redimensiona todas las imágenes a máx. 1920px y comprime a JPEG 80%. Reemplaza los originales.
            </p>
          </div>
        </div>

        {/* Step 1: Scan */}
        {scannedFiles.length === 0 && !scanning && optimizeResults.length === 0 && (
          <button
            onClick={scanImages}
            disabled={scanning}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Zap className="w-4 h-4" /> Escanear imágenes
          </button>
        )}

        {scanning && (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Escaneando todos los buckets...</span>
          </div>
        )}

        {/* Step 2: Show scan results + optimize button */}
        {scannedFiles.length > 0 && !optimizing && optimizeResults.length === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg bg-secondary/50 border border-border p-3">
                <p className="text-xs text-muted-foreground">Imágenes encontradas</p>
                <p className="text-xl font-bold text-foreground">{scannedFiles.length}</p>
              </div>
              <div className="rounded-lg bg-secondary/50 border border-border p-3">
                <p className="text-xs text-muted-foreground">Tamaño total</p>
                <p className="text-xl font-bold text-foreground">{formatSize(totalScannedSize)}</p>
              </div>
              <div className="rounded-lg bg-secondary/50 border border-border p-3">
                <p className="text-xs text-muted-foreground">Buckets</p>
                <p className="text-xl font-bold text-foreground">
                  {[...new Set(scannedFiles.map(f => f.bucket))].join(", ")}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={optimizeAll}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <Zap className="w-4 h-4" /> Optimizar todo ({scannedFiles.length} imágenes)
              </button>
              <button
                onClick={() => { setScannedFiles([]); setOptimizeResults([]); }}
                className="px-4 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Progress */}
        {optimizing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Optimizando...
              </span>
              <span className="text-foreground font-medium">{optimizeProgress} / {optimizeTotal}</span>
            </div>
            <Progress value={(optimizeProgress / optimizeTotal) * 100} className="h-2" />
            {savedBytes > 0 && (
              <p className="text-xs text-primary">Ahorro parcial: {formatSize(savedBytes)}</p>
            )}
          </div>
        )}

        {/* Step 4: Results */}
        {!optimizing && optimizeResults.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
                <p className="text-xs text-muted-foreground">Optimizadas</p>
                <p className="text-xl font-bold text-primary">{optimizedCount}</p>
              </div>
              <div className="rounded-lg bg-secondary/50 border border-border p-3">
                <p className="text-xs text-muted-foreground">Ya óptimas</p>
                <p className="text-xl font-bold text-foreground">{skippedCount}</p>
              </div>
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-xs text-muted-foreground">Errores</p>
                <p className="text-xl font-bold text-destructive">{errorCount}</p>
              </div>
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
                <p className="text-xs text-muted-foreground">Espacio ahorrado</p>
                <p className="text-xl font-bold text-primary">{formatSize(savedBytes)}</p>
              </div>
            </div>

            {errorCount > 0 && (
              <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-3 max-h-40 overflow-y-auto">
                <p className="text-xs font-medium text-destructive mb-2">Errores:</p>
                {optimizeResults.filter(r => r.status === "error").map((r, i) => (
                  <p key={i} className="text-xs text-muted-foreground flex items-start gap-1 mb-1">
                    <AlertCircle className="w-3 h-3 text-destructive shrink-0 mt-0.5" />
                    <span><strong>{r.path}</strong>: {r.error}</span>
                  </p>
                ))}
              </div>
            )}

            <button
              onClick={() => { setScannedFiles([]); setOptimizeResults([]); setSavedBytes(0); }}
              className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cerrar resultados
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-card border border-border p-4 flex items-center gap-4">
          <HardDrive className="w-8 h-8 text-primary opacity-60" />
          <div>
            <p className="text-sm text-muted-foreground">Espacio usado</p>
            <p className="text-xl font-bold text-foreground">{formatSize(totalSize)}</p>
          </div>
        </div>
        <div className="rounded-xl bg-card border border-border p-4 flex items-center gap-4">
          <Image className="w-8 h-8 text-accent opacity-60" />
          <div>
            <p className="text-sm text-muted-foreground">Archivos</p>
            <p className="text-xl font-bold text-foreground">{files.length}</p>
          </div>
        </div>
        <div className="rounded-xl bg-card border border-border p-4 flex items-center gap-4">
          <FolderOpen className="w-8 h-8 text-green-400 opacity-60" />
          <div>
            <p className="text-sm text-muted-foreground">Bucket</p>
            <p className="text-xl font-bold text-foreground">portfolio</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>
      ) : files.length === 0 ? (
        <div className="rounded-xl bg-card border border-border p-12 text-center">
          <p className="text-muted-foreground">No hay archivos en el almacenamiento. Sube imágenes desde la Galería de Imágenes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {files.map((file) => (
            <div key={file.id || file.name} className="group rounded-xl bg-card border border-border overflow-hidden">
              {isImage(file.name) ? (
                <div className="aspect-square bg-secondary relative overflow-hidden">
                  <img src={getPublicUrl(file.name)} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <a href={getPublicUrl(file.name)} target="_blank" rel="noopener" className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors">
                      <Download className="w-4 h-4" />
                    </a>
                    <button onClick={() => handleDelete(file.name)} className="p-2 rounded-lg bg-red-500/50 text-white hover:bg-red-500/70 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="aspect-square bg-secondary flex items-center justify-center">
                  <HardDrive className="w-8 h-8 text-muted-foreground/40" />
                </div>
              )}
              <div className="p-2">
                <p className="text-xs text-foreground truncate" title={file.name}>{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatSize((file.metadata as any)?.size || 0)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminStorage;
