import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, X, Eye, EyeOff, Sparkles } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { defaultPricingPlans, defaultPricingServices } from "@/lib/defaultPricing";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  price_suffix: string | null;
  features: string[];
  is_highlighted: boolean;
  is_visible: boolean;
  show_from: boolean;
  order: number;
}

interface PricingService {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  price_suffix: string | null;
  category: string | null;
  is_visible: boolean;
  show_from: boolean;
  order: number;
}

const emptyPlan = { name: "", description: "", price: "", price_suffix: "/proyecto", features: [""], is_highlighted: false, is_visible: true, show_from: false };
const emptyService = { name: "", description: "", price: "", price_suffix: "", category: "", is_visible: true, show_from: false };
const normalizeName = (name: string) => name.trim().toLowerCase();

const AdminPricing = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [services, setServices] = useState<PricingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [seedingDefaults, setSeedingDefaults] = useState(false);

  // Plan dialog
  const [planOpen, setPlanOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planForm, setPlanForm] = useState(emptyPlan);

  // Service dialog
  const [serviceOpen, setServiceOpen] = useState(false);
  const [editingService, setEditingService] = useState<PricingService | null>(null);
  const [serviceForm, setServiceForm] = useState(emptyService);

  const fetchData = async () => {
    setLoading(true);
    const [plansRes, servicesRes] = await Promise.all([
      supabase.from("pricing_plans").select("*").order("order"),
      supabase.from("pricing_services").select("*").order("order"),
    ]);
    if (plansRes.data) setPlans(plansRes.data as Plan[]);
    if (servicesRes.data) setServices(servicesRes.data as PricingService[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // ---- PLANS ----
  const openCreatePlan = () => {
    setEditingPlan(null);
    setPlanForm({ ...emptyPlan, features: [""] });
    setPlanOpen(true);
  };

  const openEditPlan = (p: Plan) => {
    setEditingPlan(p);
    setPlanForm({
      name: p.name,
      description: p.description || "",
      price: p.price?.toString() || "",
      price_suffix: p.price_suffix || "/proyecto",
      features: p.features.length ? p.features : [""],
      is_highlighted: p.is_highlighted,
      is_visible: p.is_visible,
      show_from: p.show_from,
    });
    setPlanOpen(true);
  };

  const savePlan = async () => {
    if (!planForm.name.trim()) { toast.error("El nombre es obligatorio"); return; }
    const data = {
      name: planForm.name.trim(),
      description: planForm.description.trim() || null,
      price: planForm.price ? parseFloat(planForm.price) : null,
      price_suffix: planForm.price_suffix || null,
      features: planForm.features.filter(f => f.trim()),
      is_highlighted: planForm.is_highlighted,
      is_visible: planForm.is_visible,
      show_from: planForm.show_from,
    };

    if (editingPlan) {
      const { error } = await supabase.from("pricing_plans").update(data).eq("id", editingPlan.id);
      if (error) { toast.error("Error al actualizar"); return; }
      toast.success("Plan actualizado");
    } else {
      const { error } = await supabase.from("pricing_plans").insert({ ...data, order: plans.length });
      if (error) { toast.error("Error al crear"); return; }
      toast.success("Plan creado");
    }
    setPlanOpen(false);
    fetchData();
  };

  const deletePlan = async (id: string) => {
    if (!confirm("¿Eliminar este plan?")) return;
    await supabase.from("pricing_plans").delete().eq("id", id);
    toast.success("Plan eliminado");
    fetchData();
  };

  const togglePlanVisibility = async (p: Plan) => {
    await supabase.from("pricing_plans").update({ is_visible: !p.is_visible }).eq("id", p.id);
    fetchData();
  };

  // ---- SERVICES ----
  const openCreateService = () => {
    setEditingService(null);
    setServiceForm({ ...emptyService });
    setServiceOpen(true);
  };

  const openEditService = (s: PricingService) => {
    setEditingService(s);
    setServiceForm({
      name: s.name,
      description: s.description || "",
      price: s.price?.toString() || "",
      price_suffix: s.price_suffix || "",
      category: s.category || "",
      is_visible: s.is_visible,
      show_from: s.show_from,
    });
    setServiceOpen(true);
  };

  const saveService = async () => {
    if (!serviceForm.name.trim()) { toast.error("El nombre es obligatorio"); return; }
    const data = {
      name: serviceForm.name.trim(),
      description: serviceForm.description.trim() || null,
      price: serviceForm.price ? parseFloat(serviceForm.price) : null,
      price_suffix: serviceForm.price_suffix || null,
      category: serviceForm.category.trim() || null,
      is_visible: serviceForm.is_visible,
      show_from: serviceForm.show_from,
    };

    if (editingService) {
      const { error } = await supabase.from("pricing_services").update(data).eq("id", editingService.id);
      if (error) { toast.error("Error al actualizar"); return; }
      toast.success("Servicio actualizado");
    } else {
      const { error } = await supabase.from("pricing_services").insert({ ...data, order: services.length });
      if (error) { toast.error("Error al crear"); return; }
      toast.success("Servicio creado");
    }
    setServiceOpen(false);
    fetchData();
  };

  const deleteService = async (id: string) => {
    if (!confirm("¿Eliminar este servicio?")) return;
    await supabase.from("pricing_services").delete().eq("id", id);
    toast.success("Servicio eliminado");
    fetchData();
  };

  const toggleServiceVisibility = async (s: PricingService) => {
    await supabase.from("pricing_services").update({ is_visible: !s.is_visible }).eq("id", s.id);
    fetchData();
  };

  const existingPlanNames = new Set(plans.map(plan => normalizeName(plan.name)));
  const existingServiceNames = new Set(services.map(service => normalizeName(service.name)));
  const missingDefaultPlans = defaultPricingPlans.filter(plan => !existingPlanNames.has(normalizeName(plan.name)));
  const missingDefaultServices = defaultPricingServices.filter(service => !existingServiceNames.has(normalizeName(service.name)));
  const missingDefaultCount = missingDefaultPlans.length + missingDefaultServices.length;

  const seedDefaultPricing = async () => {
    if (missingDefaultCount === 0) {
      toast.info("El catálogo estándar ya está cargado");
      return;
    }

    setSeedingDefaults(true);
    try {
      if (missingDefaultPlans.length > 0) {
        const { error } = await supabase.from("pricing_plans").insert(missingDefaultPlans);
        if (error) throw error;
      }

      if (missingDefaultServices.length > 0) {
        const { error } = await supabase.from("pricing_services").insert(missingDefaultServices);
        if (error) throw error;
      }

      toast.success(`Precios estándar cargados: ${missingDefaultCount} nuevos registros`);
      await fetchData();
    } catch (error) {
      console.error("Error loading default pricing", error);
      toast.error("No se pudieron cargar los precios estándar. Verifica que tu usuario tenga permisos de admin.");
    } finally {
      setSeedingDefaults(false);
    }
  };

  // Feature helpers
  const addFeature = () => setPlanForm(f => ({ ...f, features: [...f.features, ""] }));
  const removeFeature = (i: number) => setPlanForm(f => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }));
  const updateFeature = (i: number, val: string) => setPlanForm(f => ({ ...f, features: f.features.map((v, idx) => idx === i ? val : v) }));

  // Get unique categories
  const categories = [...new Set(services.map(s => s.category).filter(Boolean))] as string[];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Precios</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Los precios publicados en la web salen de estas tablas. Puedes cambiar importes, sufijos, textos,
          visibilidad y el indicador “desde” sin tocar código.
        </p>
      </div>

      {missingDefaultCount > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-foreground">Faltan precios estándar por cargar</p>
                <p className="text-sm text-muted-foreground">
                  Se añadirán {missingDefaultPlans.length} planes y {missingDefaultServices.length} servicios sin modificar los precios existentes.
                </p>
              </div>
            </div>
            <Button onClick={seedDefaultPricing} disabled={seedingDefaults} className="shrink-0">
              {seedingDefaults ? "Cargando..." : "Cargar precios estándar"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="plans">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="plans">Planes ({plans.length})</TabsTrigger>
          <TabsTrigger value="services">Servicios ({services.length})</TabsTrigger>
        </TabsList>

        {/* ===== PLANS TAB ===== */}
        <TabsContent value="plans" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openCreatePlan} size="sm">
              <Plus className="w-4 h-4 mr-1" /> Nuevo Plan
            </Button>
          </div>

          {plans.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No hay planes creados aún.</CardContent></Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map(p => (
                <Card key={p.id} className={`relative ${!p.is_visible ? "opacity-50" : ""}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{p.name}</CardTitle>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePlanVisibility(p)}>
                          {p.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditPlan(p)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deletePlan(p.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {p.price != null && (
                      <p className="text-2xl font-bold text-primary">
                        {p.show_from && <span className="text-sm font-normal text-muted-foreground">desde </span>}
                        {p.price}€ <span className="text-sm font-normal text-muted-foreground">{p.price_suffix}</span>
                      </p>
                    )}
                    {p.description && <p className="text-sm text-muted-foreground">{p.description}</p>}
                    {p.features.length > 0 && (
                      <ul className="text-sm space-y-1">
                        {p.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-muted-foreground">
                            <span className="text-primary mt-0.5">✓</span> {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ===== SERVICES TAB ===== */}
        <TabsContent value="services" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openCreateService} size="sm">
              <Plus className="w-4 h-4 mr-1" /> Nuevo Servicio
            </Button>
          </div>

          {services.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No hay servicios creados aún.</CardContent></Card>
          ) : (
            <div className="space-y-6">
              {/* Grouped by category */}
              {categories.length > 0 && categories.map(cat => (
                <div key={cat}>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{cat}</h3>
                  <div className="grid gap-3">
                    {services.filter(s => s.category === cat).map(s => (
                      <ServiceRow key={s.id} s={s} onEdit={openEditService} onDelete={deleteService} onToggle={toggleServiceVisibility} />
                    ))}
                  </div>
                </div>
              ))}
              {/* Uncategorized */}
              {services.filter(s => !s.category).length > 0 && (
                <div>
                  {categories.length > 0 && <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Otros</h3>}
                  <div className="grid gap-3">
                    {services.filter(s => !s.category).map(s => (
                      <ServiceRow key={s.id} s={s} onEdit={openEditService} onDelete={deleteService} onToggle={toggleServiceVisibility} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ===== PLAN DIALOG ===== */}
      <Dialog open={planOpen} onOpenChange={setPlanOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Editar Plan" : "Nuevo Plan"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre *</Label>
              <Input value={planForm.name} onChange={e => setPlanForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Plan Profesional" />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={planForm.description} onChange={e => setPlanForm(f => ({ ...f, description: e.target.value }))} placeholder="Descripción del plan" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Precio (€)</Label>
                <Input type="number" value={planForm.price} onChange={e => setPlanForm(f => ({ ...f, price: e.target.value }))} placeholder="300" />
              </div>
              <div>
                <Label>Sufijo</Label>
                <Input value={planForm.price_suffix} onChange={e => setPlanForm(f => ({ ...f, price_suffix: e.target.value }))} placeholder="/proyecto" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Características</Label>
                <Button variant="ghost" size="sm" onClick={addFeature}><Plus className="w-3 h-3 mr-1" /> Añadir</Button>
              </div>
              <div className="space-y-2">
                {planForm.features.map((f, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={f} onChange={e => updateFeature(i, e.target.value)} placeholder="Ej: 50 fotografías editadas" />
                    {planForm.features.length > 1 && (
                      <Button variant="ghost" size="icon" className="shrink-0 h-10 w-10" onClick={() => removeFeature(i)}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={planForm.show_from} onCheckedChange={v => setPlanForm(f => ({ ...f, show_from: v }))} />
              <Label>Mostrar "desde" antes del precio</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={planForm.is_visible} onCheckedChange={v => setPlanForm(f => ({ ...f, is_visible: v }))} />
              <Label>Visible en la web</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanOpen(false)}>Cancelar</Button>
            <Button onClick={savePlan}>{editingPlan ? "Guardar" : "Crear"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== SERVICE DIALOG ===== */}
      <Dialog open={serviceOpen} onOpenChange={setServiceOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingService ? "Editar Servicio" : "Nuevo Servicio"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre *</Label>
              <Input value={serviceForm.name} onChange={e => setServiceForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Fotografía de eventos" />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={serviceForm.description} onChange={e => setServiceForm(f => ({ ...f, description: e.target.value }))} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Precio (€)</Label>
                <Input type="number" value={serviceForm.price} onChange={e => setServiceForm(f => ({ ...f, price: e.target.value }))} placeholder="150" />
              </div>
              <div>
                <Label>Sufijo</Label>
                <Input value={serviceForm.price_suffix} onChange={e => setServiceForm(f => ({ ...f, price_suffix: e.target.value }))} placeholder="/hora" />
              </div>
            </div>
            <div>
              <Label>Categoría</Label>
              <Input value={serviceForm.category} onChange={e => setServiceForm(f => ({ ...f, category: e.target.value }))} placeholder="Ej: Fotografía" list="service-categories" />
              <datalist id="service-categories">
                {categories.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={serviceForm.show_from} onCheckedChange={v => setServiceForm(f => ({ ...f, show_from: v }))} />
              <Label>Mostrar "desde" antes del precio</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={serviceForm.is_visible} onCheckedChange={v => setServiceForm(f => ({ ...f, is_visible: v }))} />
              <Label>Visible en la web</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setServiceOpen(false)}>Cancelar</Button>
            <Button onClick={saveService}>{editingService ? "Guardar" : "Crear"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ServiceRow = ({ s, onEdit, onDelete, onToggle }: {
  s: PricingService;
  onEdit: (s: PricingService) => void;
  onDelete: (id: string) => void;
  onToggle: (s: PricingService) => void;
}) => (
  <Card className={`${!s.is_visible ? "opacity-50" : ""}`}>
    <CardContent className="flex items-center justify-between py-3 px-4 gap-3">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground truncate">{s.name}</p>
        {s.description && <p className="text-sm text-muted-foreground truncate">{s.description}</p>}
      </div>
      {s.price != null && (
        <p className="text-lg font-bold text-primary whitespace-nowrap">
          {s.show_from && <span className="text-xs font-normal text-muted-foreground">desde </span>}
          {s.price}€ <span className="text-xs font-normal text-muted-foreground">{s.price_suffix}</span>
        </p>
      )}
      <div className="flex gap-1 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onToggle(s)}>
          {s.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(s)}>
          <Pencil className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(s.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default AdminPricing;
