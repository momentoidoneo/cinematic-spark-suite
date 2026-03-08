import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, ImageIcon, Save, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type Category = {
  id: string;
  name: string;
  slug: string;
  cover_image: string | null;
  order: number;
};

type SiteSetting = {
  id: string;
  key: string;
  value: string | null;
  label: string | null;
};

const AdminLanding = () => {
  const [heroSetting, setHeroSetting] = useState<SiteSetting | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);
  const [catFiles, setCatFiles] = useState<Record<string, File>>({});
  const [catPreviews, setCatPreviews] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [{ data: settings }, { data: cats }] = await Promise.all([
        supabase.from("site_settings").select("*").eq("key", "hero_bg").maybeSingle(),
        supabase.from("portfolio_categories").select("id, name, slug, cover_image, order").order("order"),
      ]);
      if (settings) {
        setHeroSetting(settings as SiteSetting);
        setHeroPreview(settings.value);
      }
      if (cats) setCategories(cats);
    };
    load();
  }, []);

  const handleHeroFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeroFile(file);
    setHeroPreview(URL.createObjectURL(file));
  };

  const handleCatFile = (catId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCatFiles((prev) => ({ ...prev, [catId]: file }));
    setCatPreviews((prev) => ({ ...prev, [catId]: URL.createObjectURL(file) }));
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("portfolio").upload(path, file);
    if (error) {
      toast.error("Error subiendo imagen");
      return null;
    }
    const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSaveAll = async () => {
    setSaving(true);

    // Upload hero
    if (heroFile) {
      const url = await uploadFile(heroFile, "landing");
      if (url && heroSetting) {
        await supabase.from("site_settings").update({ value: url }).eq("id", heroSetting.id);
        setHeroSetting({ ...heroSetting, value: url });
        setHeroFile(null);
      }
    }

    // Upload category covers
    for (const [catId, file] of Object.entries(catFiles)) {
      const url = await uploadFile(file, "covers/categories");
      if (url) {
        await supabase.from("portfolio_categories").update({ cover_image: url }).eq("id", catId);
        setCategories((prev) => prev.map((c) => (c.id === catId ? { ...c, cover_image: url } : c)));
      }
    }
    setCatFiles({});

    setSaving(false);
    toast.success("Imágenes de la landing actualizadas");
  };

  const hasChanges = heroFile || Object.keys(catFiles).length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Imágenes de la Landing</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona las imágenes que aparecen en la página principal</p>
        </div>
        <div className="flex gap-2">
          <a href="/" target="_blank" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-secondary transition-colors">
            <ExternalLink className="w-4 h-4" /> Ver Landing
          </a>
          {hasChanges && (
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <div className="rounded-xl border border-border bg-card p-6 mb-6">
        <h2 className="font-display text-lg font-bold text-foreground mb-4">Imagen de Fondo del Hero</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="w-full sm:w-80 aspect-video rounded-lg overflow-hidden border border-border bg-secondary">
            {heroPreview ? (
              <img src={heroPreview} alt="Hero background" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-3">
              Esta imagen aparece como fondo en la sección principal de la página de inicio. Recomendación: 1920x1080px mínimo.
            </p>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground cursor-pointer hover:bg-secondary/80 transition-colors">
              <Upload className="w-4 h-4" /> Cambiar imagen
              <input type="file" accept="image/*" onChange={handleHeroFile} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Portfolio Category Images */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold text-foreground mb-4">Imágenes del Portafolio</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Estas imágenes aparecen como tarjetas en la sección de portafolio de la landing page.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const preview = catPreviews[cat.id] || cat.cover_image;
            return (
              <div key={cat.id} className="rounded-lg border border-border overflow-hidden bg-secondary/30">
                <div className="aspect-[4/3] relative">
                  {preview ? (
                    <img src={preview} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="font-display font-bold text-foreground">{cat.name}</span>
                  </div>
                </div>
                <div className="p-3">
                  <label className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground cursor-pointer hover:bg-secondary/80 transition-colors">
                    <Upload className="w-4 h-4" /> {preview ? "Cambiar" : "Subir imagen"}
                    <input type="file" accept="image/*" onChange={(e) => handleCatFile(cat.id, e)} className="hidden" />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminLanding;
