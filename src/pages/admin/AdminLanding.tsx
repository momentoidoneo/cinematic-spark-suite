import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, ImageIcon, Save, ExternalLink, Pencil, Check, X, EyeOff, Eye } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

type Category = {
  id: string;
  name: string;
  slug: string;
  cover_image: string | null;
  order: number;
  is_visible: boolean;
};

type Subcategory = {
  id: string;
  name: string;
  category_id: string;
  cover_image: string | null;
  cover_position: string;
  order: number;
  is_visible: boolean;
  link_enabled: boolean;
};

type SiteSetting = {
  id: string;
  key: string;
  value: string | null;
  label: string | null;
};

const POSITION_OPTIONS = [
  { value: "center", label: "Centro" },
  { value: "top", label: "Arriba" },
  { value: "bottom", label: "Abajo" },
  { value: "left", label: "Izquierda" },
  { value: "right", label: "Derecha" },
  { value: "top left", label: "Arriba Izq." },
  { value: "top right", label: "Arriba Der." },
  { value: "bottom left", label: "Abajo Izq." },
  { value: "bottom right", label: "Abajo Der." },
];

const AdminLanding = () => {
  const [heroSetting, setHeroSetting] = useState<SiteSetting | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);
  const [catFiles, setCatFiles] = useState<Record<string, File>>({});
  const [catPreviews, setCatPreviews] = useState<Record<string, string>>({});
  const [subFiles, setSubFiles] = useState<Record<string, File>>({});
  const [subPreviews, setSubPreviews] = useState<Record<string, string>>({});
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPosition, setEditPosition] = useState("center");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [{ data: settings }, { data: cats }, { data: subs }] = await Promise.all([
        supabase.from("site_settings").select("*").eq("key", "hero_bg").maybeSingle(),
        supabase.from("portfolio_categories").select("id, name, slug, cover_image, order, is_visible").order("order"),
        supabase.from("portfolio_subcategories").select("id, name, category_id, cover_image, cover_position, order, is_visible, link_enabled").order("order"),
      ]);
      if (settings) {
        setHeroSetting(settings as SiteSetting);
        setHeroPreview(settings.value);
      }
      if (cats) setCategories(cats as Category[]);
      if (subs) setSubcategories(subs as Subcategory[]);
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

  const handleSubFile = (subId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubFiles((prev) => ({ ...prev, [subId]: file }));
    setSubPreviews((prev) => ({ ...prev, [subId]: URL.createObjectURL(file) }));
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

  const startEditSub = (sub: Subcategory) => {
    setEditingSubId(sub.id);
    setEditName(sub.name);
    setEditPosition(sub.cover_position || "center");
  };

  const cancelEditSub = () => {
    setEditingSubId(null);
    setEditName("");
    setEditPosition("center");
  };

  const saveSubEdit = async (subId: string) => {
    const { error } = await supabase
      .from("portfolio_subcategories")
      .update({ name: editName, cover_position: editPosition })
      .eq("id", subId);
    if (error) {
      toast.error("Error al actualizar");
      return;
    }
    setSubcategories((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, name: editName, cover_position: editPosition } : s))
    );
    setEditingSubId(null);
    toast.success("Botón actualizado");
  };

  const toggleCatVisibility = async (catId: string, visible: boolean) => {
    const { error } = await supabase.from("portfolio_categories").update({ is_visible: visible }).eq("id", catId);
    if (error) { toast.error("Error al actualizar"); return; }
    setCategories((prev) => prev.map((c) => (c.id === catId ? { ...c, is_visible: visible } : c)));
    toast.success(visible ? "Categoría visible" : "Categoría oculta");
  };

  const toggleSubVisibility = async (subId: string, visible: boolean) => {
    const { error } = await supabase.from("portfolio_subcategories").update({ is_visible: visible }).eq("id", subId);
    if (error) { toast.error("Error al actualizar"); return; }
    setSubcategories((prev) => prev.map((s) => (s.id === subId ? { ...s, is_visible: visible } : s)));
    toast.success(visible ? "Botón visible" : "Botón oculto");
  };

  const handleSaveAll = async () => {
    setSaving(true);

    if (heroFile) {
      const url = await uploadFile(heroFile, "landing");
      if (url && heroSetting) {
        await supabase.from("site_settings").update({ value: url }).eq("id", heroSetting.id);
        setHeroSetting({ ...heroSetting, value: url });
        setHeroFile(null);
      }
    }

    for (const [catId, file] of Object.entries(catFiles)) {
      const url = await uploadFile(file, "covers/categories");
      if (url) {
        await supabase.from("portfolio_categories").update({ cover_image: url }).eq("id", catId);
        setCategories((prev) => prev.map((c) => (c.id === catId ? { ...c, cover_image: url } : c)));
      }
    }
    setCatFiles({});

    for (const [subId, file] of Object.entries(subFiles)) {
      const url = await uploadFile(file, "covers/subcategories");
      if (url) {
        await supabase.from("portfolio_subcategories").update({ cover_image: url }).eq("id", subId);
        setSubcategories((prev) => prev.map((s) => (s.id === subId ? { ...s, cover_image: url } : s)));
      }
    }
    setSubFiles({});

    setSaving(false);
    toast.success("Imágenes de la landing actualizadas");
  };

  const hasChanges = heroFile || Object.keys(catFiles).length > 0 || Object.keys(subFiles).length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Imágenes de la Landing</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona las imágenes y botones que aparecen en la página principal</p>
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
      <div className="rounded-xl border border-border bg-card p-6 mb-6">
        <h2 className="font-display text-lg font-bold text-foreground mb-4">Imágenes del Portafolio</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Estas imágenes aparecen como tarjetas en la sección de portafolio de la landing page. Oculta categorías para que no aparezcan en la web.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const preview = catPreviews[cat.id] || cat.cover_image;
            return (
              <div key={cat.id} className={`rounded-lg border overflow-hidden bg-secondary/30 transition-opacity ${!cat.is_visible ? "opacity-50 border-border/50" : "border-border"}`}>
                <div className="aspect-[4/3] relative">
                  {preview ? (
                    <img src={preview} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <span className="font-display font-bold text-foreground">{cat.name}</span>
                    {!cat.is_visible && <EyeOff className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>
                <div className="p-3 flex items-center gap-2">
                  <label className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground cursor-pointer hover:bg-secondary/80 transition-colors">
                    <Upload className="w-4 h-4" /> {preview ? "Cambiar" : "Subir imagen"}
                    <input type="file" accept="image/*" onChange={(e) => handleCatFile(cat.id, e)} className="hidden" />
                  </label>
                  <div className="flex items-center gap-1.5">
                    {cat.is_visible ? <Eye className="w-3.5 h-3.5 text-muted-foreground" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                    <Switch
                      checked={cat.is_visible}
                      onCheckedChange={(checked) => toggleCatVisibility(cat.id, checked)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subcategory Buttons (Service Cards) */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold text-foreground mb-2">Botones de Servicios</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Estos son los botones que aparecen en la landing agrupados por categoría. Puedes editar nombre, imagen, posición del encuadre y visibilidad.
        </p>

        {categories.map((cat) => {
          const subs = subcategories.filter((s) => s.category_id === cat.id);
          if (subs.length === 0) return null;

          return (
            <div key={cat.id} className="mb-8 last:mb-0">
              <h3 className="font-display text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                <div className="w-1 h-5 bg-primary rounded-full" />
                {cat.name}
                {!cat.is_visible && <span className="text-xs text-muted-foreground font-normal">(categoría oculta)</span>}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subs.map((sub) => {
                  const preview = subPreviews[sub.id] || sub.cover_image;
                  const isEditing = editingSubId === sub.id;

                  return (
                    <div key={sub.id} className={`rounded-lg border overflow-hidden bg-secondary/30 transition-opacity ${!sub.is_visible ? "opacity-50 border-border/50" : "border-border"}`}>
                      {/* Preview */}
                      <div className="aspect-[4/3] relative">
                        {preview ? (
                          <img
                            src={preview}
                            alt={sub.name}
                            className="w-full h-full object-cover"
                            style={{ objectPosition: isEditing ? editPosition : sub.cover_position }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-secondary">
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full px-2 py-1 rounded bg-background/90 border border-border text-sm font-bold text-foreground"
                              autoFocus
                            />
                          ) : (
                            <div className="flex items-end justify-between">
                              <span className="font-display font-bold text-foreground text-sm">{sub.name}</span>
                              {!sub.is_visible && <EyeOff className="w-4 h-4 text-muted-foreground" />}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="p-3 space-y-2">
                        {isEditing && (
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Posición del encuadre</label>
                            <select
                              value={editPosition}
                              onChange={(e) => setEditPosition(e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground"
                            >
                              {POSITION_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="flex gap-2 items-center">
                          <label className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground cursor-pointer hover:bg-secondary/80 transition-colors">
                            <Upload className="w-4 h-4" /> {preview ? "Cambiar" : "Subir"}
                            <input type="file" accept="image/*" onChange={(e) => handleSubFile(sub.id, e)} className="hidden" />
                          </label>

                          <div className="flex items-center gap-1">
                            <Switch
                              checked={sub.is_visible}
                              onCheckedChange={(checked) => toggleSubVisibility(sub.id, checked)}
                            />
                          </div>

                          <button
                            onClick={async () => {
                              const newVal = !sub.link_enabled;
                              const { error } = await supabase.from("portfolio_subcategories").update({ link_enabled: newVal }).eq("id", sub.id);
                              if (error) { toast.error("Error al actualizar"); return; }
                              setSubcategories(prev => prev.map(s => s.id === sub.id ? { ...s, link_enabled: newVal } : s));
                              toast.success(newVal ? "Link activado" : "Link desactivado");
                            }}
                            className={`p-2 rounded-lg border transition-colors ${sub.link_enabled ? "bg-primary/10 border-primary/30 text-primary" : "bg-secondary border-border text-muted-foreground"}`}
                            title={sub.link_enabled ? "Link activado – clic para desactivar" : "Link desactivado – clic para activar"}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>

                          {isEditing ? (
                            <>
                              <button
                                onClick={() => saveSubEdit(sub.id)}
                                className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                                title="Guardar"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEditSub}
                                className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                title="Cancelar"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => startEditSub(sub)}
                              className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                              title="Editar nombre y posición"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminLanding;
