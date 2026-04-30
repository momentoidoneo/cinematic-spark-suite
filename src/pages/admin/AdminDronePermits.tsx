import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileText,
  Mail,
  MapPinned,
  MessageCircle,
  Plane,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type DronePermit = Database["public"]["Tables"]["drone_permit_requests"]["Row"];
type DronePermitInsert = Database["public"]["Tables"]["drone_permit_requests"]["Insert"];
type DronePermitUpdate = Database["public"]["Tables"]["drone_permit_requests"]["Update"];

type Status =
  | "needs_data"
  | "zone_review"
  | "coordination"
  | "submitted"
  | "approved"
  | "rejected"
  | "ready_to_fly"
  | "completed";

type Priority = "low" | "normal" | "urgent";

const STATUS_META: Record<Status, { label: string; className: string }> = {
  needs_data: { label: "Faltan datos", className: "bg-slate-500/15 text-slate-500 border-slate-500/30" },
  zone_review: { label: "Revisar zona", className: "bg-blue-500/15 text-blue-500 border-blue-500/30" },
  coordination: { label: "Coordinar", className: "bg-amber-500/15 text-amber-500 border-amber-500/30" },
  submitted: { label: "Solicitado", className: "bg-violet-500/15 text-violet-500 border-violet-500/30" },
  approved: { label: "Aprobado", className: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" },
  rejected: { label: "Rechazado", className: "bg-destructive/15 text-destructive border-destructive/30" },
  ready_to_fly: { label: "Listo vuelo", className: "bg-primary/15 text-primary border-primary/30" },
  completed: { label: "Completado", className: "bg-muted text-muted-foreground border-border" },
};

const PRIORITY_META: Record<Priority, { label: string; className: string }> = {
  low: { label: "Baja", className: "bg-muted text-muted-foreground border-border" },
  normal: { label: "Normal", className: "bg-blue-500/15 text-blue-500 border-blue-500/30" },
  urgent: { label: "Urgente", className: "bg-destructive/15 text-destructive border-destructive/30" },
};

const CHECKLIST = [
  {
    id: "zone_check",
    label: "Revisar zona geográfica UAS",
    detail: "Comprobar ENAIRE Drones, restricciones, espacio controlado, aeródromos y entorno.",
  },
  {
    id: "operator_registration",
    label: "Operador UAS identificado",
    detail: "Confirmar número de operador, datos fiscales y responsabilidad de la operación.",
  },
  {
    id: "pilot_certificate",
    label: "Piloto y formación válida",
    detail: "Verificar piloto remoto, categoría aplicable, certificados y experiencia.",
  },
  {
    id: "insurance",
    label: "Seguro y documentación del UAS",
    detail: "Comprobar seguro, modelo de dron, marcado/clase si aplica y mantenimiento.",
  },
  {
    id: "client_authorization",
    label: "Autorización del cliente o titular",
    detail: "Permiso de acceso, uso del espacio, horarios y contacto de responsable local.",
  },
  {
    id: "risk_assessment",
    label: "Evaluación básica de riesgos",
    detail: "Personas, obstáculos, meteorología, privacidad, emergencias y zona de despegue.",
  },
  {
    id: "airspace_coordination",
    label: "Coordinación o solicitud si procede",
    detail: "Registrar si hace falta ENAIRE Planea, aeropuerto, gestor de espacio o AESA.",
  },
  {
    id: "flight_briefing",
    label: "Briefing final pre-vuelo",
    detail: "Checklist de día de vuelo, meteorología, equipo, baterías, rutas y plan de contingencia.",
  },
];

const emptyForm: DronePermitInsert = {
  title: "",
  client_name: "",
  client_email: "",
  client_phone: "",
  service: "Grabación aérea con dron",
  location: "",
  operation_address: "",
  requested_flight_date: null,
  requested_time_window: "",
  status: "needs_data",
  priority: "normal",
  operation_category: "pending_review",
  source: "admin",
};

const statusValues = Object.keys(STATUS_META) as Status[];
const priorityValues = Object.keys(PRIORITY_META) as Priority[];

const normalize = (value: string | null | undefined) => (value ?? "").toLowerCase();

const errorDescription = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const details = error as { code?: string; details?: string; hint?: string; message?: string };
    return [details.message, details.details, details.hint, details.code ? `Código: ${details.code}` : ""]
      .filter(Boolean)
      .join(" · ");
  }
  return "Revisa permisos de administrador y migraciones de Supabase.";
};

const progressFor = (permit: DronePermit) => {
  const required = permit.required_actions.length > 0 ? permit.required_actions : CHECKLIST.map((item) => item.id);
  const done = required.filter((id) => permit.completed_actions.includes(id)).length;
  return { done, total: required.length, percent: required.length ? Math.round((done / required.length) * 100) : 0 };
};

const AdminDronePermits = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<DronePermitInsert>(emptyForm);

  const { data: permits = [], isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ["drone_permit_requests"],
    queryFn: async () => {
      const { data, error: queryError } = await supabase
        .from("drone_permit_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (queryError) throw queryError;
      return data as DronePermit[];
    },
  });

  const updatePermit = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: DronePermitUpdate }) => {
      const { error: updateError } = await supabase.from("drone_permit_requests").update(patch).eq("id", id);
      if (updateError) throw updateError;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["drone_permit_requests"] }),
    onError: (error) => toast({
      title: "No se pudo guardar el cambio",
      description: errorDescription(error),
      variant: "destructive",
    }),
  });

  const createPermit = useMutation({
    mutationFn: async (payload: DronePermitInsert) => {
      const { error: insertError } = await supabase.from("drone_permit_requests").insert(payload);
      if (insertError) throw insertError;
    },
    onSuccess: () => {
      setDialogOpen(false);
      setForm(emptyForm);
      queryClient.invalidateQueries({ queryKey: ["drone_permit_requests"] });
      toast({ title: "Trámite de dron creado" });
    },
    onError: (error) => toast({
      title: "No se pudo crear el trámite",
      description: errorDescription(error),
      variant: "destructive",
    }),
  });

  const deletePermit = useMutation({
    mutationFn: async (id: string) => {
      const { error: deleteError } = await supabase.from("drone_permit_requests").delete().eq("id", id);
      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      setSelectedId(null);
      queryClient.invalidateQueries({ queryKey: ["drone_permit_requests"] });
      toast({ title: "Trámite eliminado" });
    },
    onError: (error) => toast({
      title: "No se pudo eliminar el trámite",
      description: errorDescription(error),
      variant: "destructive",
    }),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return permits.filter((permit) => {
      const matchesSearch =
        !q ||
        normalize(permit.title).includes(q) ||
        normalize(permit.client_name).includes(q) ||
        normalize(permit.client_email).includes(q) ||
        normalize(permit.service).includes(q) ||
        normalize(permit.location).includes(q) ||
        normalize(permit.operation_address).includes(q) ||
        normalize(permit.internal_notes).includes(q);
      const isActive = !["completed", "rejected"].includes(permit.status);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isActive) ||
        permit.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [permits, search, statusFilter]);

  const selected = useMemo(
    () => permits.find((permit) => permit.id === selectedId) ?? filtered[0] ?? null,
    [permits, selectedId, filtered],
  );

  const counts = useMemo(() => {
    const active = permits.filter((permit) => !["completed", "rejected"].includes(permit.status)).length;
    const urgent = permits.filter((permit) => permit.priority === "urgent" && !["completed", "rejected"].includes(permit.status)).length;
    const approved = permits.filter((permit) => ["approved", "ready_to_fly"].includes(permit.status)).length;
    return { total: permits.length, active, urgent, approved };
  }, [permits]);

  const saveField = (id: string, field: keyof DronePermitUpdate, value: string | null) => {
    updatePermit.mutate({ id, patch: { [field]: value || null } });
  };

  const toggleChecklist = (permit: DronePermit, actionId: string) => {
    const completed = permit.completed_actions.includes(actionId)
      ? permit.completed_actions.filter((id) => id !== actionId)
      : [...permit.completed_actions, actionId];
    updatePermit.mutate({ id: permit.id, patch: { completed_actions: completed } });
  };

  const handleCreate = () => {
    if (!form.title?.trim() || !form.location?.trim()) {
      toast({ title: "Título y ubicación son obligatorios", variant: "destructive" });
      return;
    }
    createPermit.mutate({
      ...form,
      title: form.title.trim(),
      location: form.location.trim(),
      operation_address: form.operation_address || form.location,
      client_name: form.client_name || null,
      client_email: form.client_email || null,
      client_phone: form.client_phone || null,
      service: form.service || null,
      requested_time_window: form.requested_time_window || null,
    });
  };

  const selectedProgress = selected ? progressFor(selected) : null;
  const errorMessage = error ? errorDescription(error) : "";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Plane className="h-6 w-6" /> Permisos Dron
          </h1>
          <p className="text-sm text-muted-foreground">
            Workflow interno para revisar zona, documentación, coordinación y preparación de vuelos con dron.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={cn("h-4 w-4 mr-1", isFetching && "animate-spin")} />
            Actualizar
          </Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Nuevo trámite
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Metric icon={ClipboardCheck} label="Activos" value={counts.active} />
        <Metric icon={AlertTriangle} label="Urgentes" value={counts.urgent} tone="destructive" />
        <Metric icon={ShieldCheck} label="Aprobados/listos" value={counts.approved} tone="primary" />
        <Metric icon={FileText} label="Total" value={counts.total} />
      </div>

      <Card className="border-amber-500/25 bg-amber-500/10">
        <CardContent className="flex flex-col gap-3 py-4 text-sm text-amber-700 dark:text-amber-300 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              Este módulo organiza la revisión y documentación interna. La autorización final debe validarse siempre con fuentes oficiales,
              operador UAS responsable y normativa vigente antes de confirmar un vuelo.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="https://drones.enaire.es/" target="_blank" rel="noopener noreferrer">
                ENAIRE Drones <ExternalLink className="ml-1 h-3.5 w-3.5" />
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="https://www.seguridadaerea.gob.es/es/ambitos/drones" target="_blank" rel="noopener noreferrer">
                AESA <ExternalLink className="ml-1 h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {errorMessage && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          No se pudieron cargar los permisos de dron. {errorMessage}
        </div>
      )}

      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, ubicación, servicio o notas..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full lg:w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
            {statusValues.map((status) => (
              <SelectItem key={status} value={status}>{STATUS_META[status].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid min-h-[64vh] gap-4 xl:grid-cols-[minmax(340px,0.9fr)_minmax(0,1.4fr)]">
        <Card className="overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            {filtered.length} de {permits.length} trámites
          </div>
          <div className="max-h-[74vh] divide-y divide-border overflow-y-auto">
            {isLoading ? (
              <p className="py-12 text-center text-sm text-muted-foreground">Cargando trámites...</p>
            ) : filtered.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">No hay trámites de dron.</p>
            ) : (
              filtered.map((permit) => {
                const progress = progressFor(permit);
                const status = permit.status as Status;
                const priority = permit.priority as Priority;
                return (
                  <button
                    key={permit.id}
                    onClick={() => setSelectedId(permit.id)}
                    className={cn(
                      "w-full px-3 py-3 text-left transition-colors hover:bg-muted/50",
                      selected?.id === permit.id && "bg-muted",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{permit.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{permit.location}</p>
                      </div>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {format(new Date(permit.created_at), "dd MMM", { locale: es })}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", STATUS_META[status]?.className)}>
                        {STATUS_META[status]?.label || permit.status}
                      </Badge>
                      <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", PRIORITY_META[priority]?.className)}>
                        {PRIORITY_META[priority]?.label || permit.priority}
                      </Badge>
                      <span className="ml-auto text-[10px] text-muted-foreground">{progress.percent}% checklist</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        <Card className="overflow-hidden">
          {!selected ? (
            <div className="flex h-full flex-col items-center justify-center p-12 text-muted-foreground">
              <Plane className="mb-3 h-12 w-12 opacity-40" />
              <p className="text-sm">Selecciona o crea un trámite para gestionarlo.</p>
            </div>
          ) : (
            <div className="flex max-h-[80vh] flex-col">
              <div className="border-b border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-display font-semibold text-foreground">{selected.title}</h2>
                    <p className="text-xs text-muted-foreground">
                      Creado {format(new Date(selected.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={selected.status}
                      onValueChange={(status) => updatePermit.mutate({ id: selected.id, patch: { status } })}
                    >
                      <SelectTrigger className="h-8 w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusValues.map((status) => (
                          <SelectItem key={status} value={status}>{STATUS_META[status].label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={selected.priority}
                      onValueChange={(priority) => updatePermit.mutate({ id: selected.id, patch: { priority } })}
                    >
                      <SelectTrigger className="h-8 w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityValues.map((priority) => (
                          <SelectItem key={priority} value={priority}>{PRIORITY_META[priority].label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {selectedProgress && (
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>Checklist operativo</span>
                      <span>{selectedProgress.done}/{selectedProgress.total} · {selectedProgress.percent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${selectedProgress.percent}%` }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto p-4">
                <section>
                  <h3 className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">Datos de operación</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Editable label="Título" value={selected.title} onSave={(value) => saveField(selected.id, "title", value)} />
                    <Editable label="Servicio" value={selected.service} onSave={(value) => saveField(selected.id, "service", value)} />
                    <Editable label="Cliente" value={selected.client_name} onSave={(value) => saveField(selected.id, "client_name", value)} />
                    <Editable label="Email" value={selected.client_email} onSave={(value) => saveField(selected.id, "client_email", value)} />
                    <Editable label="Teléfono" value={selected.client_phone} onSave={(value) => saveField(selected.id, "client_phone", value)} />
                    <Editable label="Ubicación" value={selected.location} onSave={(value) => saveField(selected.id, "location", value)} />
                    <Editable label="Dirección / punto de vuelo" value={selected.operation_address} onSave={(value) => saveField(selected.id, "operation_address", value)} />
                    <Editable label="Fecha prevista" value={selected.requested_flight_date} type="date" onSave={(value) => saveField(selected.id, "requested_flight_date", value)} />
                    <Editable label="Franja horaria" value={selected.requested_time_window} onSave={(value) => saveField(selected.id, "requested_time_window", value)} />
                    <Editable label="Modelo de dron" value={selected.drone_model} onSave={(value) => saveField(selected.id, "drone_model", value)} />
                    <Editable label="Piloto" value={selected.pilot_name} onSave={(value) => saveField(selected.id, "pilot_name", value)} />
                    <Editable label="Operador UAS" value={selected.operator_registration} onSave={(value) => saveField(selected.id, "operator_registration", value)} />
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <Editable label="Categoría operacional" value={selected.operation_category} onSave={(value) => saveField(selected.id, "operation_category", value)} />
                    <Editable label="Latitud" value={selected.latitude?.toString() ?? ""} onSave={(value) => updatePermit.mutate({ id: selected.id, patch: { latitude: value ? Number(value) : null } })} />
                    <Editable label="Longitud" value={selected.longitude?.toString() ?? ""} onSave={(value) => updatePermit.mutate({ id: selected.id, patch: { longitude: value ? Number(value) : null } })} />
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">Checklist</h3>
                  <div className="grid gap-2">
                    {CHECKLIST.map((item) => {
                      const checked = selected.completed_actions.includes(item.id);
                      return (
                        <label key={item.id} className="flex cursor-pointer gap-3 rounded-lg border border-border bg-muted/30 p-3">
                          <Checkbox checked={checked} onCheckedChange={() => toggleChecklist(selected, item.id)} />
                          <div>
                            <p className={cn("text-sm font-medium", checked ? "text-foreground" : "text-foreground/90")}>
                              {item.label}
                            </p>
                            <p className="text-xs text-muted-foreground">{item.detail}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </section>

                <section className="grid gap-3 md:grid-cols-2">
                  <TextAreaField label="Notas de espacio aéreo" value={selected.airspace_notes} onSave={(value) => saveField(selected.id, "airspace_notes", value)} />
                  <TextAreaField label="Riesgos / mitigaciones" value={selected.risk_notes} onSave={(value) => saveField(selected.id, "risk_notes", value)} />
                  <div className="md:col-span-2">
                    <TextAreaField label="Notas internas" value={selected.internal_notes} onSave={(value) => saveField(selected.id, "internal_notes", value)} rows={4} />
                  </div>
                </section>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-border bg-muted/20 p-3">
                {selected.client_email && (
                  <Button size="sm" asChild>
                    <a href={`mailto:${selected.client_email}`}>
                      <Mail className="mr-1 h-4 w-4" /> Email
                    </a>
                  </Button>
                )}
                {selected.client_phone && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={`https://wa.me/${selected.client_phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-1 h-4 w-4" /> WhatsApp
                    </a>
                  </Button>
                )}
                <Button size="sm" variant="outline" asChild>
                  <a href="https://drones.enaire.es/" target="_blank" rel="noopener noreferrer">
                    <MapPinned className="mr-1 h-4 w-4" /> Revisar zona
                  </a>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href="https://www.seguridadaerea.gob.es/es/ambitos/drones" target="_blank" rel="noopener noreferrer">
                    <ShieldCheck className="mr-1 h-4 w-4" /> AESA
                  </a>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto text-destructive"
                  onClick={() => {
                    if (confirm("¿Eliminar este trámite de dron?")) deletePermit.mutate(selected.id);
                  }}
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Eliminar
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nuevo trámite de permisos dron</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <FormInput label="Título *" value={form.title ?? ""} onChange={(value) => setForm((f) => ({ ...f, title: value }))} />
            <FormInput label="Servicio" value={form.service ?? ""} onChange={(value) => setForm((f) => ({ ...f, service: value }))} />
            <FormInput label="Cliente" value={form.client_name ?? ""} onChange={(value) => setForm((f) => ({ ...f, client_name: value }))} />
            <FormInput label="Email" value={form.client_email ?? ""} onChange={(value) => setForm((f) => ({ ...f, client_email: value }))} />
            <FormInput label="Teléfono" value={form.client_phone ?? ""} onChange={(value) => setForm((f) => ({ ...f, client_phone: value }))} />
            <FormInput label="Ubicación *" value={form.location ?? ""} onChange={(value) => setForm((f) => ({ ...f, location: value }))} />
            <FormInput label="Dirección / punto de vuelo" value={form.operation_address ?? ""} onChange={(value) => setForm((f) => ({ ...f, operation_address: value }))} />
            <FormInput label="Fecha prevista" type="date" value={form.requested_flight_date ?? ""} onChange={(value) => setForm((f) => ({ ...f, requested_flight_date: value || null }))} />
            <FormInput label="Franja horaria" value={form.requested_time_window ?? ""} onChange={(value) => setForm((f) => ({ ...f, requested_time_window: value }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={createPermit.isPending}>
              {createPermit.isPending ? "Creando..." : "Crear trámite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Metric = ({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone?: "primary" | "destructive";
}) => (
  <Card>
    <CardContent className="flex items-center justify-between py-4">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
      <Icon className={cn("h-5 w-5 text-muted-foreground", tone === "primary" && "text-primary", tone === "destructive" && "text-destructive")} />
    </CardContent>
  </Card>
);

const Editable = ({
  label,
  value,
  onSave,
  type = "text",
}: {
  label: string;
  value: string | null;
  onSave: (value: string) => void;
  type?: string;
}) => (
  <div>
    <Label className="text-xs text-muted-foreground">{label}</Label>
    <Input
      key={`${label}-${value ?? ""}`}
      type={type}
      defaultValue={value ?? ""}
      onBlur={(event) => {
        if (event.currentTarget.value !== (value ?? "")) onSave(event.currentTarget.value);
      }}
      className="mt-1"
    />
  </div>
);

const TextAreaField = ({
  label,
  value,
  onSave,
  rows = 3,
}: {
  label: string;
  value: string | null;
  onSave: (value: string) => void;
  rows?: number;
}) => (
  <div>
    <Label className="text-xs text-muted-foreground">{label}</Label>
    <Textarea
      key={`${label}-${value ?? ""}`}
      defaultValue={value ?? ""}
      rows={rows}
      onBlur={(event) => {
        if (event.currentTarget.value !== (value ?? "")) onSave(event.currentTarget.value);
      }}
      className="mt-1 resize-none"
    />
  </div>
);

const FormInput = ({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) => (
  <div>
    <Label>{label}</Label>
    <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1" />
  </div>
);

export default AdminDronePermits;
