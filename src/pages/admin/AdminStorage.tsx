import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HardDrive, Image, Trash2, Download, RefreshCw, FolderOpen } from "lucide-react";
import { toast } from "sonner";

interface StorageFile {
  name: string;
  id: string;
  metadata: { size: number; mimetype: string } | null;
  created_at: string;
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
