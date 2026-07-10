import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  CircleDollarSign,
  ExternalLink,
  Eye,
  EyeOff,
  ListChecks,
  Pencil,
  Plus,
  Save,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  defaultPricingPlans,
  defaultPricingServices,
} from "@/lib/defaultPricing";
import {
  getFallbackLandingPricingPlanIds,
  isLandingPricingReady,
  LANDING_PRICING_LIMIT,
  LANDING_PRICING_SETTING_KEY,
  parseLandingPricingPlanIds,
} from "@/lib/landingPricing";

type PricingPlanRow = Database["public"]["Tables"]["pricing_plans"]["Row"];
type PricingService = Database["public"]["Tables"]["pricing_services"]["Row"];
type Plan = Omit<PricingPlanRow, "features"> & { features: string[] };

type PlanForm = {
  name: string;
  description: string;
  price: string;
  price_suffix: string;
  features: string[];
  is_highlighted: boolean;
  is_visible: boolean;
  show_from: boolean;
  order: string;
};

type ServiceForm = {
  name: string;
  description: string;
  price: string;
  price_suffix: string;
  category: string;
  is_visible: boolean;
  show_from: boolean;
  order: string;
};

const emptyPlan: PlanForm = {
  name: "",
  description: "",
  price: "",
  price_suffix: "/proyecto",
  features: [""],
  is_highlighted: false,
  is_visible: true,
  show_from: false,
  order: "0",
};

const emptyService: ServiceForm = {
  name: "",
  description: "",
  price: "",
  price_suffix: "",
  category: "",
  is_visible: true,
  show_from: false,
  order: "0",
};

const normalizeName = (name: string) => name.trim().toLowerCase();

const formatPrice = (price: number | null) =>
  price == null
    ? "Sin precio"
    : `${Number(price).toLocaleString("es-ES", {
        maximumFractionDigits: 2,
      })}€`;

const parsePrice = (value: string) => {
  if (!value.trim()) return { value: null, error: null };
  const parsed = Number(value.trim().replace(",", "."));
  if (!Number.isFinite(parsed) || parsed < 0) {
    return {
      value: null,
      error: "Introduce un precio válido igual o mayor que 0.",
    };
  }
  return { value: parsed, error: null };
};

const nextOrder = (rows: Array<{ order: number }>) =>
  rows.length ? Math.max(...rows.map((row) => row.order)) + 10 : 0;

const AdminPricing = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [services, setServices] = useState<PricingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [seedingDefaults, setSeedingDefaults] = useState(false);

  const [landingPlanIds, setLandingPlanIds] = useState<string[]>([]);
  const [savedLandingPlanIds, setSavedLandingPlanIds] = useState<string[]>([]);
  const [savingLanding, setSavingLanding] = useState(false);

  const [planOpen, setPlanOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planForm, setPlanForm] = useState<PlanForm>(emptyPlan);
  const [savingPlan, setSavingPlan] = useState(false);

  const [serviceOpen, setServiceOpen] = useState(false);
  const [editingService, setEditingService] = useState<PricingService | null>(
    null,
  );
  const [serviceForm, setServiceForm] = useState<ServiceForm>(emptyService);
  const [savingService, setSavingService] = useState(false);

  const [serviceQuery, setServiceQuery] = useState("");
  const [serviceCategory, setServiceCategory] = useState("all");
  const [showHiddenServices, setShowHiddenServices] = useState(false);

  const fetchData = async (preserveLandingSelection = false) => {
    setLoading(true);
    const [plansResult, servicesResult, landingSettingResult] =
      await Promise.all([
        supabase.from("pricing_plans").select("*").order("order"),
        supabase.from("pricing_services").select("*").order("order"),
        supabase
          .from("site_settings")
          .select("value")
          .eq("key", LANDING_PRICING_SETTING_KEY)
          .maybeSingle(),
      ]);

    if (plansResult.error || servicesResult.error) {
      toast.error("No se pudo cargar el catálogo de precios.");
      setLoading(false);
      return;
    }

    const nextPlans: Plan[] = (plansResult.data || []).map((plan) => ({
      ...plan,
      features: (plan.features || []).filter(Boolean),
    }));
    const nextServices = servicesResult.data || [];

    setPlans(nextPlans);
    setServices(nextServices);

    const configuredIds = parseLandingPricingPlanIds(
      landingSettingResult.data?.value,
    );
    const effectiveIds = (
      configuredIds ?? getFallbackLandingPricingPlanIds(nextPlans)
    ).filter((id) => nextPlans.some((plan) => plan.id === id));

    if (preserveLandingSelection) {
      setLandingPlanIds((current) =>
        current.filter((id) => nextPlans.some((plan) => plan.id === id)),
      );
    } else {
      setLandingPlanIds(effectiveIds);
      setSavedLandingPlanIds(effectiveIds);
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const landingPlans = landingPlanIds
    .map((id) => plans.find((plan) => plan.id === id))
    .filter((plan): plan is Plan => Boolean(plan));
  const landingSelectionDirty =
    JSON.stringify(landingPlanIds) !== JSON.stringify(savedLandingPlanIds);

  const persistLandingSelection = async (ids: string[]) => {
    const { error } = await supabase.from("site_settings").upsert(
      {
        key: LANDING_PRICING_SETTING_KEY,
        label: "Planes publicados en la Landing",
        value: JSON.stringify(ids),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );

    if (error) throw error;
    setLandingPlanIds(ids);
    setSavedLandingPlanIds(ids);
  };

  const saveLandingSelection = async () => {
    if (landingPlanIds.length === 0) {
      toast.error("Selecciona al menos un plan para la Landing.");
      return;
    }

    const invalidPlan = landingPlans.find(
      (plan) => !isLandingPricingReady(plan),
    );
    if (invalidPlan) {
      toast.error(
        `${invalidPlan.name} necesita precio, visibilidad y al menos un servicio incluido.`,
      );
      return;
    }

    setSavingLanding(true);
    try {
      await persistLandingSelection(landingPlanIds);
      toast.success("Precios de la Landing actualizados.");
    } catch (error) {
      console.error("Error saving landing pricing selection", error);
      toast.error("No se pudo guardar la selección de la Landing.");
    } finally {
      setSavingLanding(false);
    }
  };

  const addPlanToLanding = (plan: Plan) => {
    if (landingPlanIds.includes(plan.id)) return;
    if (landingPlanIds.length >= LANDING_PRICING_LIMIT) {
      toast.error(
        `La Landing admite un máximo de ${LANDING_PRICING_LIMIT} planes.`,
      );
      return;
    }
    if (!isLandingPricingReady(plan)) {
      toast.error(
        "Añade precio y al menos un servicio incluido antes de publicar este plan.",
      );
      openEditPlan(plan);
      return;
    }
    setLandingPlanIds((current) => [...current, plan.id]);
  };

  const removePlanFromLanding = (id: string) => {
    if (landingPlanIds.length === 1 && landingPlanIds.includes(id)) {
      toast.error(
        "La Landing debe conservar al menos un plan. Añade otro antes de retirar este.",
      );
      return;
    }
    setLandingPlanIds((current) => current.filter((planId) => planId !== id));
  };

  const moveLandingPlan = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= landingPlanIds.length) return;
    setLandingPlanIds((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const openCreatePlan = () => {
    setEditingPlan(null);
    setPlanForm({
      ...emptyPlan,
      features: [""],
      order: String(nextOrder(plans)),
    });
    setPlanOpen(true);
  };

  const openEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      description: plan.description || "",
      price: plan.price?.toString() || "",
      price_suffix: plan.price_suffix || "/proyecto",
      features: plan.features.length ? plan.features : [""],
      is_highlighted: plan.is_highlighted,
      is_visible: plan.is_visible,
      show_from: plan.show_from,
      order: String(plan.order),
    });
    setPlanOpen(true);
  };

  const savePlan = async () => {
    if (!planForm.name.trim()) {
      toast.error("El nombre es obligatorio.");
      return;
    }

    const parsedPrice = parsePrice(planForm.price);
    if (parsedPrice.error) {
      toast.error(parsedPrice.error);
      return;
    }

    const parsedOrder = Number(planForm.order);
    if (!Number.isFinite(parsedOrder)) {
      toast.error("Introduce un orden válido.");
      return;
    }

    const features = planForm.features
      .map((feature) => feature.trim())
      .filter(Boolean);
    const selectedOnLanding = Boolean(
      editingPlan && landingPlanIds.includes(editingPlan.id),
    );

    if (
      selectedOnLanding &&
      (!planForm.is_visible || parsedPrice.value == null)
    ) {
      toast.error(
        "Un plan publicado en la Landing debe estar visible y tener precio.",
      );
      return;
    }
    if (selectedOnLanding && features.length === 0) {
      toast.error(
        "Añade al menos un servicio incluido al plan publicado en la Landing.",
      );
      return;
    }

    const data = {
      name: planForm.name.trim(),
      description: planForm.description.trim() || null,
      price: parsedPrice.value,
      price_suffix: planForm.price_suffix.trim() || null,
      features,
      is_highlighted: planForm.is_highlighted,
      is_visible: planForm.is_visible,
      show_from: planForm.show_from,
      order: Math.round(parsedOrder),
      updated_at: new Date().toISOString(),
    };

    setSavingPlan(true);
    try {
      let savedId = editingPlan?.id;
      if (editingPlan) {
        const { error } = await supabase
          .from("pricing_plans")
          .update(data)
          .eq("id", editingPlan.id);
        if (error) throw error;
      } else {
        const { data: inserted, error } = await supabase
          .from("pricing_plans")
          .insert(data)
          .select("id")
          .single();
        if (error) throw error;
        savedId = inserted.id;
      }

      if (data.is_highlighted && savedId) {
        const { error } = await supabase
          .from("pricing_plans")
          .update({ is_highlighted: false })
          .neq("id", savedId);
        if (error) throw error;
      }

      toast.success(editingPlan ? "Plan actualizado." : "Plan creado.");
      setPlanOpen(false);
      await fetchData(true);
    } catch (error) {
      console.error("Error saving pricing plan", error);
      toast.error("No se pudo guardar el plan.");
    } finally {
      setSavingPlan(false);
    }
  };

  const deletePlan = async (plan: Plan) => {
    const isOnLanding = landingPlanIds.includes(plan.id);
    if (isOnLanding && landingPlanIds.length === 1) {
      toast.error(
        "No puedes eliminar el único plan de la Landing. Añade otro plan primero.",
      );
      return;
    }
    const message = isOnLanding
      ? "Este plan está publicado en la Landing. Se eliminará también de esa sección. ¿Continuar?"
      : "¿Eliminar este plan?";
    if (!window.confirm(message)) return;

    const { error } = await supabase
      .from("pricing_plans")
      .delete()
      .eq("id", plan.id);
    if (error) {
      toast.error("No se pudo eliminar el plan.");
      return;
    }

    if (isOnLanding) {
      const nextIds = landingPlanIds.filter((id) => id !== plan.id);
      try {
        await persistLandingSelection(nextIds);
      } catch (settingError) {
        console.error("Error updating landing selection", settingError);
      }
    }
    toast.success("Plan eliminado.");
    await fetchData();
  };

  const togglePlanVisibility = async (plan: Plan) => {
    const hidingLandingPlan =
      plan.is_visible && landingPlanIds.includes(plan.id);
    if (hidingLandingPlan && landingPlanIds.length === 1) {
      toast.error(
        "No puedes ocultar el único plan de la Landing. Añade otro plan primero.",
      );
      return;
    }
    if (
      hidingLandingPlan &&
      !window.confirm(
        "Este plan dejará de aparecer también en la Landing. ¿Continuar?",
      )
    ) {
      return;
    }

    const { error } = await supabase
      .from("pricing_plans")
      .update({
        is_visible: !plan.is_visible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", plan.id);
    if (error) {
      toast.error("No se pudo cambiar la visibilidad.");
      return;
    }

    if (hidingLandingPlan) {
      const nextIds = landingPlanIds.filter((id) => id !== plan.id);
      try {
        await persistLandingSelection(nextIds);
      } catch (settingError) {
        console.error("Error updating landing selection", settingError);
      }
    }
    await fetchData();
  };

  const openCreateService = () => {
    setEditingService(null);
    setServiceForm({
      ...emptyService,
      order: String(nextOrder(services)),
    });
    setServiceOpen(true);
  };

  const openEditService = (service: PricingService) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      description: service.description || "",
      price: service.price?.toString() || "",
      price_suffix: service.price_suffix || "",
      category: service.category || "",
      is_visible: service.is_visible,
      show_from: service.show_from,
      order: String(service.order),
    });
    setServiceOpen(true);
  };

  const saveService = async () => {
    if (!serviceForm.name.trim()) {
      toast.error("El nombre es obligatorio.");
      return;
    }

    const parsedPrice = parsePrice(serviceForm.price);
    if (parsedPrice.error) {
      toast.error(parsedPrice.error);
      return;
    }

    const parsedOrder = Number(serviceForm.order);
    if (!Number.isFinite(parsedOrder)) {
      toast.error("Introduce un orden válido.");
      return;
    }

    if (serviceForm.is_visible && parsedPrice.value == null) {
      toast.error("Un servicio visible debe tener precio.");
      return;
    }

    const data = {
      name: serviceForm.name.trim(),
      description: serviceForm.description.trim() || null,
      price: parsedPrice.value,
      price_suffix: serviceForm.price_suffix.trim() || null,
      category: serviceForm.category.trim() || null,
      is_visible: serviceForm.is_visible,
      show_from: serviceForm.show_from,
      order: Math.round(parsedOrder),
      updated_at: new Date().toISOString(),
    };

    setSavingService(true);
    try {
      const query = editingService
        ? supabase
            .from("pricing_services")
            .update(data)
            .eq("id", editingService.id)
        : supabase.from("pricing_services").insert(data);
      const { error } = await query;
      if (error) throw error;

      toast.success(
        editingService ? "Servicio actualizado." : "Servicio creado.",
      );
      setServiceOpen(false);
      await fetchData(true);
    } catch (error) {
      console.error("Error saving pricing service", error);
      toast.error("No se pudo guardar el servicio.");
    } finally {
      setSavingService(false);
    }
  };

  const deleteService = async (service: PricingService) => {
    if (!window.confirm("¿Eliminar este servicio?")) return;
    const { error } = await supabase
      .from("pricing_services")
      .delete()
      .eq("id", service.id);
    if (error) {
      toast.error("No se pudo eliminar el servicio.");
      return;
    }
    toast.success("Servicio eliminado.");
    await fetchData(true);
  };

  const toggleServiceVisibility = async (service: PricingService) => {
    const { error } = await supabase
      .from("pricing_services")
      .update({
        is_visible: !service.is_visible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", service.id);
    if (error) {
      toast.error("No se pudo cambiar la visibilidad.");
      return;
    }
    await fetchData(true);
  };

  const existingPlanNames = new Set(
    plans.map((plan) => normalizeName(plan.name)),
  );
  const existingServiceNames = new Set(
    services.map((service) => normalizeName(service.name)),
  );
  const missingDefaultPlans = defaultPricingPlans.filter(
    (plan) => !existingPlanNames.has(normalizeName(plan.name)),
  );
  const missingDefaultServices = defaultPricingServices.filter(
    (service) => !existingServiceNames.has(normalizeName(service.name)),
  );
  const missingDefaultCount =
    missingDefaultPlans.length + missingDefaultServices.length;

  const seedDefaultPricing = async () => {
    if (missingDefaultCount === 0) {
      toast.info("El catálogo estándar ya está cargado.");
      return;
    }

    setSeedingDefaults(true);
    try {
      if (missingDefaultPlans.length > 0) {
        const { error } = await supabase
          .from("pricing_plans")
          .insert(missingDefaultPlans);
        if (error) throw error;
      }
      if (missingDefaultServices.length > 0) {
        const { error } = await supabase
          .from("pricing_services")
          .insert(missingDefaultServices);
        if (error) throw error;
      }

      toast.success(
        `Precios estándar cargados: ${missingDefaultCount} nuevos registros.`,
      );
      await fetchData();
    } catch (error) {
      console.error("Error loading default pricing", error);
      toast.error(
        "No se pudieron cargar los precios estándar. Verifica los permisos de administrador.",
      );
    } finally {
      setSeedingDefaults(false);
    }
  };

  const addFeature = () =>
    setPlanForm((form) => ({
      ...form,
      features: [...form.features, ""],
    }));
  const removeFeature = (index: number) =>
    setPlanForm((form) => ({
      ...form,
      features: form.features.filter((_, itemIndex) => itemIndex !== index),
    }));
  const updateFeature = (index: number, value: string) =>
    setPlanForm((form) => ({
      ...form,
      features: form.features.map((feature, itemIndex) =>
        itemIndex === index ? value : feature,
      ),
    }));
  const moveFeature = (index: number, direction: -1 | 1) =>
    setPlanForm((form) => {
      const target = index + direction;
      if (target < 0 || target >= form.features.length) return form;
      const features = [...form.features];
      [features[index], features[target]] = [features[target], features[index]];
      return { ...form, features };
    });

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          services
            .map((service) => service.category?.trim())
            .filter((category): category is string => Boolean(category)),
        ),
      ).sort((a, b) => a.localeCompare(b, "es")),
    [services],
  );

  const filteredServices = useMemo(() => {
    const query = serviceQuery.trim().toLocaleLowerCase("es");
    return services.filter((service) => {
      const matchesQuery =
        !query ||
        [service.name, service.description || "", service.category || ""]
          .join(" ")
          .toLocaleLowerCase("es")
          .includes(query);
      const matchesCategory =
        serviceCategory === "all" || service.category === serviceCategory;
      const matchesVisibility = showHiddenServices || service.is_visible;
      return matchesQuery && matchesCategory && matchesVisibility;
    });
  }, [serviceCategory, serviceQuery, services, showHiddenServices]);

  const visiblePlanCount = plans.filter((plan) => plan.is_visible).length;
  const visibleServiceCount = services.filter(
    (service) => service.is_visible,
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Web y cotizador
          </p>
          <h1 className="text-2xl font-bold text-foreground">
            Precios y catálogo
          </h1>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Controla las tarjetas de la Landing, los planes de la página de
            precios y el catálogo que utiliza el cotizador. Los cambios de
            importes y servicios incluidos se guardan en Supabase.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/#precios-home" target="_blank" rel="noreferrer">
              Ver Landing <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/precios" target="_blank" rel="noreferrer">
              Ver todos los precios <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          icon={CircleDollarSign}
          label="Planes en Landing"
          value={`${landingPlanIds.length}/${LANDING_PRICING_LIMIT}`}
          detail={
            landingSelectionDirty ? "Cambios sin guardar" : "Selección guardada"
          }
          highlight={landingSelectionDirty}
        />
        <MetricCard
          icon={CheckCircle2}
          label="Planes visibles"
          value={String(visiblePlanCount)}
          detail={`${plans.length} planes totales`}
        />
        <MetricCard
          icon={ListChecks}
          label="Servicios visibles"
          value={String(visibleServiceCount)}
          detail={`${services.length} servicios totales`}
        />
      </div>

      {missingDefaultCount > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-foreground">
                  Faltan precios estándar por cargar
                </p>
                <p className="text-sm text-muted-foreground">
                  Se añadirán {missingDefaultPlans.length} planes y{" "}
                  {missingDefaultServices.length} servicios sin modificar los
                  registros existentes.
                </p>
              </div>
            </div>
            <Button
              onClick={seedDefaultPricing}
              disabled={seedingDefaults}
              className="shrink-0"
            >
              {seedingDefaults ? "Cargando..." : "Cargar precios estándar"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="landing">
        <TabsList className="grid h-auto w-full grid-cols-3 sm:w-fit">
          <TabsTrigger value="landing">Landing</TabsTrigger>
          <TabsTrigger value="plans">Planes ({plans.length})</TabsTrigger>
          <TabsTrigger value="services">
            Servicios ({services.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="landing" className="space-y-5">
          <Card>
            <CardHeader className="gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle>Precios publicados en la Landing</CardTitle>
                <CardDescription className="mt-2 max-w-3xl leading-relaxed">
                  Elige hasta tres planes y ordénalos. El precio, descripción y
                  los cuatro primeros servicios incluidos se muestran
                  exactamente como aparecen en esta vista previa.
                </CardDescription>
              </div>
              <Button
                onClick={saveLandingSelection}
                disabled={!landingSelectionDirty || savingLanding}
                className="shrink-0"
              >
                <Save className="mr-2 h-4 w-4" />
                {savingLanding ? "Guardando..." : "Guardar Landing"}
              </Button>
            </CardHeader>
            <CardContent>
              {landingSelectionDirty && (
                <div className="mb-5 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  La selección o el orden ha cambiado. Pulsa “Guardar Landing”
                  para publicarlo.
                </div>
              )}

              <div
                className={`grid gap-4 ${
                  landingPlans.length === 1
                    ? "max-w-md"
                    : landingPlans.length === 2
                      ? "md:grid-cols-2"
                      : "md:grid-cols-3"
                }`}
              >
                {landingPlans.map((plan, index) => (
                  <LandingPlanCard
                    key={plan.id}
                    plan={plan}
                    position={index}
                    total={landingPlans.length}
                    onEdit={() => openEditPlan(plan)}
                    onRemove={() => removePlanFromLanding(plan.id)}
                    onMove={(direction) => moveLandingPlan(index, direction)}
                  />
                ))}
                {landingPlans.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center md:col-span-3">
                    <p className="font-medium text-foreground">
                      No hay planes seleccionados
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Añade al menos un plan desde el catálogo inferior.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Planes disponibles</CardTitle>
              <CardDescription>
                Solo puedes añadir planes visibles, con precio y al menos un
                servicio incluido.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {plans.map((plan) => {
                const selected = landingPlanIds.includes(plan.id);
                const ready = isLandingPricingReady(plan);
                return (
                  <div
                    key={plan.id}
                    className={`rounded-xl border p-4 ${
                      selected
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">
                          {plan.name}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-primary">
                          {plan.show_from && (
                            <span className="font-normal text-muted-foreground">
                              desde{" "}
                            </span>
                          )}
                          {formatPrice(plan.price)}{" "}
                          <span className="font-normal text-muted-foreground">
                            {plan.price_suffix}
                          </span>
                        </p>
                      </div>
                      {selected && <Badge>Landing</Badge>}
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>{plan.features.length} servicios incluidos</span>
                      {!ready && (
                        <span className="text-amber-600">Incompleto</span>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditPlan(plan)}
                      >
                        <Pencil className="mr-1.5 h-3.5 w-3.5" /> Editar
                      </Button>
                      {!selected && (
                        <Button
                          size="sm"
                          onClick={() => addPlanToLanding(plan)}
                          disabled={
                            landingPlanIds.length >= LANDING_PRICING_LIMIT &&
                            ready
                          }
                        >
                          <Plus className="mr-1.5 h-3.5 w-3.5" /> Añadir
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Gestiona todos los packs publicados en la página completa de
              precios.
            </p>
            <Button onClick={openCreatePlan} size="sm">
              <Plus className="mr-1 h-4 w-4" /> Nuevo plan
            </Button>
          </div>

          {plans.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No hay planes creados todavía.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  landingPosition={landingPlanIds.indexOf(plan.id)}
                  onEdit={() => openEditPlan(plan)}
                  onDelete={() => deletePlan(plan)}
                  onToggle={() => togglePlanVisibility(plan)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardContent className="space-y-4 py-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={serviceQuery}
                    onChange={(event) => setServiceQuery(event.target.value)}
                    placeholder="Buscar servicio, categoría o descripción..."
                    className="pl-9"
                    aria-label="Buscar servicios"
                  />
                </div>
                <select
                  value={serviceCategory}
                  onChange={(event) => setServiceCategory(event.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                  aria-label="Filtrar por categoría"
                >
                  <option value="all">Todas las categorías</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <Switch
                    id="show-hidden-services"
                    checked={showHiddenServices}
                    onCheckedChange={setShowHiddenServices}
                  />
                  <Label
                    htmlFor="show-hidden-services"
                    className="whitespace-nowrap"
                  >
                    Mostrar ocultos
                  </Label>
                </div>
                <Button onClick={openCreateService} size="sm">
                  <Plus className="mr-1 h-4 w-4" /> Nuevo servicio
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Mostrando {filteredServices.length} de {services.length}{" "}
                servicios. Usa “Orden” para controlar la posición dentro de cada
                categoría.
              </p>
            </CardContent>
          </Card>

          {filteredServices.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No hay servicios que coincidan con los filtros.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Array.from(
                new Set(
                  filteredServices.map(
                    (service) => service.category || "Otros",
                  ),
                ),
              ).map((category) => (
                <section key={category}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      {category}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {
                        filteredServices.filter(
                          (service) =>
                            (service.category || "Otros") === category,
                        ).length
                      }
                    </span>
                  </div>
                  <div className="grid gap-3">
                    {filteredServices
                      .filter(
                        (service) => (service.category || "Otros") === category,
                      )
                      .map((service) => (
                        <ServiceRow
                          key={service.id}
                          service={service}
                          onEdit={() => openEditService(service)}
                          onDelete={() => deleteService(service)}
                          onToggle={() => toggleServiceVisibility(service)}
                        />
                      ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={planOpen} onOpenChange={setPlanOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? "Editar plan" : "Nuevo plan"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div>
              <Label htmlFor="plan-name">Nombre *</Label>
              <Input
                id="plan-name"
                value={planForm.name}
                onChange={(event) =>
                  setPlanForm((form) => ({
                    ...form,
                    name: event.target.value,
                  }))
                }
                placeholder="Ej: Producción Empresa"
              />
            </div>
            <div>
              <Label htmlFor="plan-description">Descripción</Label>
              <Textarea
                id="plan-description"
                value={planForm.description}
                onChange={(event) =>
                  setPlanForm((form) => ({
                    ...form,
                    description: event.target.value,
                  }))
                }
                placeholder="Explica para quién es este plan y qué resuelve."
                rows={3}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="plan-price">Precio (€)</Label>
                <Input
                  id="plan-price"
                  inputMode="decimal"
                  value={planForm.price}
                  onChange={(event) =>
                    setPlanForm((form) => ({
                      ...form,
                      price: event.target.value,
                    }))
                  }
                  placeholder="350"
                />
              </div>
              <div>
                <Label htmlFor="plan-suffix">Sufijo</Label>
                <Input
                  id="plan-suffix"
                  value={planForm.price_suffix}
                  onChange={(event) =>
                    setPlanForm((form) => ({
                      ...form,
                      price_suffix: event.target.value,
                    }))
                  }
                  placeholder="/proyecto"
                />
              </div>
              <div>
                <Label htmlFor="plan-order">Orden en /precios</Label>
                <Input
                  id="plan-order"
                  type="number"
                  value={planForm.order}
                  onChange={(event) =>
                    setPlanForm((form) => ({
                      ...form,
                      order: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <Label>Servicios incluidos</Label>
                  <p className="text-xs text-muted-foreground">
                    La Landing muestra los cuatro primeros, en este orden.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={addFeature}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Añadir servicio
                </Button>
              </div>
              <div className="space-y-2">
                {planForm.features.map((feature, index) => (
                  <div
                    key={`${index}-${planForm.features.length}`}
                    className="flex gap-2"
                  >
                    <div className="flex shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-8"
                        onClick={() => moveFeature(index, -1)}
                        disabled={index === 0}
                        aria-label={`Subir servicio ${index + 1}`}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-8"
                        onClick={() => moveFeature(index, 1)}
                        disabled={index === planForm.features.length - 1}
                        aria-label={`Bajar servicio ${index + 1}`}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      value={feature}
                      onChange={(event) =>
                        updateFeature(index, event.target.value)
                      }
                      placeholder="Ej: Fotografía inmobiliaria premium"
                      aria-label={`Servicio incluido ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 shrink-0"
                      onClick={() => removeFeature(index)}
                      disabled={planForm.features.length === 1}
                      aria-label={`Eliminar servicio ${index + 1}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <Switch
                  id="plan-show-from"
                  checked={planForm.show_from}
                  onCheckedChange={(value) =>
                    setPlanForm((form) => ({ ...form, show_from: value }))
                  }
                />
                <Label htmlFor="plan-show-from">Mostrar “desde”</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="plan-highlighted"
                  checked={planForm.is_highlighted}
                  onCheckedChange={(value) =>
                    setPlanForm((form) => ({
                      ...form,
                      is_highlighted: value,
                    }))
                  }
                />
                <Label htmlFor="plan-highlighted">Recomendado</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="plan-visible"
                  checked={planForm.is_visible}
                  onCheckedChange={(value) =>
                    setPlanForm((form) => ({ ...form, is_visible: value }))
                  }
                />
                <Label htmlFor="plan-visible">Visible en la web</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={savePlan} disabled={savingPlan}>
              {savingPlan
                ? "Guardando..."
                : editingPlan
                  ? "Guardar cambios"
                  : "Crear plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={serviceOpen} onOpenChange={setServiceOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Editar servicio" : "Nuevo servicio"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="service-name">Nombre *</Label>
              <Input
                id="service-name"
                value={serviceForm.name}
                onChange={(event) =>
                  setServiceForm((form) => ({
                    ...form,
                    name: event.target.value,
                  }))
                }
                placeholder="Ej: Fotografía de eventos"
              />
            </div>
            <div>
              <Label htmlFor="service-description">Descripción</Label>
              <Textarea
                id="service-description"
                value={serviceForm.description}
                onChange={(event) =>
                  setServiceForm((form) => ({
                    ...form,
                    description: event.target.value,
                  }))
                }
                rows={3}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="service-price">Precio (€)</Label>
                <Input
                  id="service-price"
                  inputMode="decimal"
                  value={serviceForm.price}
                  onChange={(event) =>
                    setServiceForm((form) => ({
                      ...form,
                      price: event.target.value,
                    }))
                  }
                  placeholder="150"
                />
              </div>
              <div>
                <Label htmlFor="service-suffix">Sufijo</Label>
                <Input
                  id="service-suffix"
                  value={serviceForm.price_suffix}
                  onChange={(event) =>
                    setServiceForm((form) => ({
                      ...form,
                      price_suffix: event.target.value,
                    }))
                  }
                  placeholder="/hora"
                />
              </div>
              <div>
                <Label htmlFor="service-order">Orden</Label>
                <Input
                  id="service-order"
                  type="number"
                  value={serviceForm.order}
                  onChange={(event) =>
                    setServiceForm((form) => ({
                      ...form,
                      order: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="service-category">Categoría</Label>
              <Input
                id="service-category"
                value={serviceForm.category}
                onChange={(event) =>
                  setServiceForm((form) => ({
                    ...form,
                    category: event.target.value,
                  }))
                }
                placeholder="Ej: Fotografía"
                list="service-categories"
              />
              <datalist id="service-categories">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>
            <div className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <Switch
                  id="service-show-from"
                  checked={serviceForm.show_from}
                  onCheckedChange={(value) =>
                    setServiceForm((form) => ({
                      ...form,
                      show_from: value,
                    }))
                  }
                />
                <Label htmlFor="service-show-from">Mostrar “desde”</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="service-visible"
                  checked={serviceForm.is_visible}
                  onCheckedChange={(value) =>
                    setServiceForm((form) => ({
                      ...form,
                      is_visible: value,
                    }))
                  }
                />
                <Label htmlFor="service-visible">Visible en la web</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setServiceOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveService} disabled={savingService}>
              {savingService
                ? "Guardando..."
                : editingService
                  ? "Guardar cambios"
                  : "Crear servicio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const MetricCard = ({
  icon: Icon,
  label,
  value,
  detail,
  highlight = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail: string;
  highlight?: boolean;
}) => (
  <Card className={highlight ? "border-amber-500/30 bg-amber-500/5" : ""}>
    <CardContent className="flex items-center gap-3 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{detail}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const LandingPlanCard = ({
  plan,
  position,
  total,
  onEdit,
  onRemove,
  onMove,
}: {
  plan: Plan;
  position: number;
  total: number;
  onEdit: () => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
}) => (
  <article
    className={`flex flex-col rounded-2xl border p-5 ${
      plan.is_highlighted
        ? "border-primary/40 bg-primary/5"
        : "border-border bg-card"
    }`}
  >
    <div className="mb-4 flex items-start justify-between gap-2">
      <Badge variant="outline">Posición {position + 1}</Badge>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onMove(-1)}
          disabled={position === 0}
          aria-label={`Mover ${plan.name} a la izquierda`}
        >
          <ArrowUp className="h-4 w-4 -rotate-90" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onMove(1)}
          disabled={position === total - 1}
          aria-label={`Mover ${plan.name} a la derecha`}
        >
          <ArrowDown className="h-4 w-4 -rotate-90" />
        </Button>
      </div>
    </div>
    {plan.is_highlighted && (
      <span className="mb-3 self-start rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
        Recomendado
      </span>
    )}
    <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
    {plan.description && (
      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
        {plan.description}
      </p>
    )}
    <p className="mt-4 text-2xl font-bold text-primary">
      {plan.show_from && (
        <span className="text-sm font-normal text-muted-foreground">
          desde{" "}
        </span>
      )}
      {formatPrice(plan.price)}{" "}
      <span className="text-sm font-normal text-muted-foreground">
        {plan.price_suffix}
      </span>
    </p>
    <ul className="mt-4 flex-1 space-y-2">
      {plan.features.slice(0, 4).map((feature) => (
        <li
          key={feature}
          className="flex items-start gap-2 text-sm text-muted-foreground"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <div className="mt-5 grid grid-cols-2 gap-2">
      <Button variant="outline" size="sm" onClick={onEdit}>
        <Pencil className="mr-1.5 h-3.5 w-3.5" /> Editar
      </Button>
      <Button variant="ghost" size="sm" onClick={onRemove}>
        <X className="mr-1.5 h-3.5 w-3.5" /> Retirar
      </Button>
    </div>
  </article>
);

const PlanCard = ({
  plan,
  landingPosition,
  onEdit,
  onDelete,
  onToggle,
}: {
  plan: Plan;
  landingPosition: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) => (
  <Card className={!plan.is_visible ? "opacity-60" : ""}>
    <CardHeader className="pb-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <CardTitle className="text-lg">{plan.name}</CardTitle>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {landingPosition >= 0 && (
              <Badge>Landing #{landingPosition + 1}</Badge>
            )}
            {plan.is_highlighted && (
              <Badge variant="secondary">Recomendado</Badge>
            )}
            {!plan.is_visible && <Badge variant="outline">Oculto</Badge>}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onToggle}
            aria-label={
              plan.is_visible ? `Ocultar ${plan.name}` : `Mostrar ${plan.name}`
            }
          >
            {plan.is_visible ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onEdit}
            aria-label={`Editar ${plan.name}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={onDelete}
            aria-label={`Eliminar ${plan.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <p className="text-2xl font-bold text-primary">
        {plan.show_from && (
          <span className="text-sm font-normal text-muted-foreground">
            desde{" "}
          </span>
        )}
        {formatPrice(plan.price)}{" "}
        <span className="text-sm font-normal text-muted-foreground">
          {plan.price_suffix}
        </span>
      </p>
      {plan.description && (
        <p className="text-sm text-muted-foreground">{plan.description}</p>
      )}
      <p className="text-xs text-muted-foreground">
        {plan.features.length} servicios incluidos · orden {plan.order}
      </p>
      <Button variant="outline" size="sm" onClick={onEdit} className="w-full">
        Editar precio y servicios
      </Button>
    </CardContent>
  </Card>
);

const ServiceRow = ({
  service,
  onEdit,
  onDelete,
  onToggle,
}: {
  service: PricingService;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) => (
  <Card className={!service.is_visible ? "opacity-60" : ""}>
    <CardContent className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-foreground">{service.name}</p>
          {!service.is_visible && <Badge variant="outline">Oculto</Badge>}
          <span className="text-[11px] text-muted-foreground">
            orden {service.order}
          </span>
        </div>
        {service.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {service.description}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <p className="whitespace-nowrap text-lg font-bold text-primary">
          {service.show_from && (
            <span className="text-xs font-normal text-muted-foreground">
              desde{" "}
            </span>
          )}
          {formatPrice(service.price)}{" "}
          <span className="text-xs font-normal text-muted-foreground">
            {service.price_suffix}
          </span>
        </p>
        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onToggle}
            aria-label={
              service.is_visible
                ? `Ocultar ${service.name}`
                : `Mostrar ${service.name}`
            }
          >
            {service.is_visible ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onEdit}
            aria-label={`Editar ${service.name}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={onDelete}
            aria-label={`Eliminar ${service.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default AdminPricing;
