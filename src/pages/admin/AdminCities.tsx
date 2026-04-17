import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink, MapPin, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SeoCity {
  id: string;
  slug: string;
  name: string;
  region: string;
  country: string;
  intro: string;
  highlights: string[];
  zones: string[];
  postal: string | null;
  geo_lat: number | null;
  geo_lng: number | null;
  is_visible: boolean;
  order: number;
}

const EMPTY: Omit<SeoCity, "id"> = {
  slug: "", name: "", region: "", country: "España", intro: "",
  highlights: [], zones: [], postal: null, geo_lat: null, geo_lng: null,
  is_visible: true, order: 0,
};

const slugify = (v: string) =>
  v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
   .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const ListEditor = ({
  label, value, onChange, placeholder,
}: { label: string; value: string[]; onChange: (v: string[]) => void; placeholder: string }) => {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...value, v]);
    setDraft("");
  };
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
        />
        <Button type="button" variant="secondary" onClick={add}>Añadir</Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item, i) => (
            <Badge key={i} variant="secondary" className="gap-1 pr-1">
              {item}
              <button
                type="button"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                className="rounded-full hover:bg-destructive/20 p-0.5"
                aria-label={`Quitar ${item}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminCities = () => {
  const [cities, setCities] = useState<SeoCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<SeoCity | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<SeoCity, "id">>(EMPTY);

  const fetchCities = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("seo_cities" as any)
      .select("*")
      .order("order", { ascending: true })
      .order("name", { ascending: true });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setCities((data as any) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCities(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q)
    );
  }, [cities, search]);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (city: SeoCity) => {
    setEditing(city);
    setForm({
      slug: city.slug, name: city.name, region: city.region, country: city.country,
      intro: city.intro, highlights: city.highlights || [], zones: city.zones || [],
      postal: city.postal, geo_lat: city.geo_lat, geo_lng: city.geo_lng,
      is_visible: city.is_visible, order: city.order,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.slug || !form.name || !form.region) {
      toast({ title: "Faltan datos", description: "Slug, nombre y región son obligatorios", variant: "destructive" });
      return;
    }
    const payload = {
      ...form,
      slug: slugify(form.slug),
      geo_lat: form.geo_lat === null || Number.isNaN(form.geo_lat) ? null : Number(form.geo_lat),
      geo_lng: form.geo_lng === null || Number.isNaN(form.geo_lng) ? null : Number(form.geo_lng),
    };
    if (editing) {
      const { error } = await supabase.from("seo_cities" as any).update(payload).eq("id", editing.id);
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
      toast({ title: "Ciudad actualizada" });
    } else {
      const { error } = await supabase.from("seo_cities" as any).insert(payload as any);
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
      toast({ title: "Ciudad creada" });
    }
    setOpen(false);
    fetchCities();
  };

  const toggleVisible = async (city: SeoCity) => {
    const { error } = await supabase.from("seo_cities" as any)
      .update({ is_visible: !city.is_visible }).eq("id", city.id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    fetchCities();
  };

  const remove = async (city: SeoCity) => {
    if (!confirm(`¿Eliminar "${city.name}"? Esta acción no se puede deshacer.`)) return;
    const { error } = await supabase.from("seo_cities" as any).delete().eq("id", city.id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Ciudad eliminada" });
    fetchCities();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6" /> Ciudades SEO
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestiona páginas locales <code>/fotografia-[slug]</code>. Las ciudades antiguas siguen en código; añade aquí las nuevas.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Nueva ciudad</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar ciudad" : "Nueva ciudad"}</DialogTitle>
              <DialogDescription>
                Los datos alimentan la página <code>/fotografia-[slug]</code> y el JSON-LD LocalBusiness.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Nombre *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setForm((f) => ({ ...f, name, slug: editing ? f.slug : slugify(name) }));
                    }}
                    placeholder="Valladolid"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Slug *</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                    placeholder="valladolid"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Región *</Label>
                  <Input value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} placeholder="Castilla y León" />
                </div>
                <div className="space-y-1.5">
                  <Label>País</Label>
                  <Select value={form.country} onValueChange={(v) => setForm((f) => ({ ...f, country: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="España">España</SelectItem>
                      <SelectItem value="Portugal">Portugal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Introducción (meta description / hero)</Label>
                <Textarea
                  rows={4}
                  value={form.intro}
                  onChange={(e) => setForm((f) => ({ ...f, intro: e.target.value }))}
                  placeholder="Fotografía profesional en [ciudad]: inmobiliaria, arquitectura…"
                />
                <p className="text-xs text-muted-foreground">{form.intro.length} caracteres · ideal 140-160</p>
              </div>

              <ListEditor
                label="Highlights (puntos destacados)"
                value={form.highlights}
                onChange={(v) => setForm((f) => ({ ...f, highlights: v }))}
                placeholder="Hoteles boutique, restaurantes con estrella…"
              />

              <ListEditor
                label="Zonas cubiertas"
                value={form.zones}
                onChange={(v) => setForm((f) => ({ ...f, zones: v }))}
                placeholder="Centro, Norte, Sur…"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Código postal</Label>
                  <Input value={form.postal ?? ""} onChange={(e) => setForm((f) => ({ ...f, postal: e.target.value || null }))} placeholder="47001" />
                </div>
                <div className="space-y-1.5">
                  <Label>Latitud</Label>
                  <Input
                    type="number" step="any" inputMode="decimal"
                    value={form.geo_lat ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, geo_lat: e.target.value === "" ? null : Number(e.target.value) }))}
                    placeholder="41.6523"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Longitud</Label>
                  <Input
                    type="number" step="any" inputMode="decimal"
                    value={form.geo_lng ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, geo_lng: e.target.value === "" ? null : Number(e.target.value) }))}
                    placeholder="-4.7245"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Orden</Label>
                  <Input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) || 0 }))}
                  />
                </div>
                <div className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div>
                    <Label className="cursor-pointer">Visible</Label>
                    <p className="text-xs text-muted-foreground">Solo aparece en web y sitemap si está activo</p>
                  </div>
                  <Switch
                    checked={form.is_visible}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, is_visible: v }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save}>{editing ? "Guardar cambios" : "Crear ciudad"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle>Ciudades en base de datos</CardTitle>
              <CardDescription>{cities.length} total · {cities.filter(c => c.is_visible).length} visibles</CardDescription>
            </div>
            <Input
              placeholder="Buscar por nombre, slug o región…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm py-8 text-center">Cargando…</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <MapPin className="h-10 w-10 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground">
                {cities.length === 0 ? "Aún no hay ciudades en base de datos." : "Sin resultados."}
              </p>
              {cities.length === 0 && (
                <Button variant="outline" onClick={openNew}><Plus className="h-4 w-4 mr-2" />Añadir la primera</Button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((c) => (
                <div key={c.id} className="flex items-center gap-3 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{c.name}</span>
                      <code className="text-xs text-muted-foreground">/fotografia-{c.slug}</code>
                      {!c.is_visible && <Badge variant="outline">Oculta</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {c.region} · {c.country} · {c.highlights?.length || 0} highlights · {c.zones?.length || 0} zonas
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => toggleVisible(c)} title={c.is_visible ? "Ocultar" : "Mostrar"}>
                      {c.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" asChild title="Ver página">
                      <a href={`/fotografia-${c.slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)} title="Editar">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(c)} title="Eliminar" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCities;
