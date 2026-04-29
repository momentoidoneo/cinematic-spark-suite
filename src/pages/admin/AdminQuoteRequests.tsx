import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  CheckCheck,
  Download,
  Inbox,
  Loader2,
  Mail,
  MailOpen,
  MessageCircle,
  RefreshCw,
  Save,
  Search,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

type Status = "new" | "in_progress" | "closed";
type StatusFilter = "all" | Status;
type ReadFilter = "all" | "unread" | "read";

type PricingReference = {
  name: string;
  category?: string | null;
  price?: number;
  priceSuffix?: string | null;
  source?: string;
};

type QuoteResponsePayload = {
  pricingSource?: string;
  pricingReferences?: PricingReference[];
  source?: string;
};

type QuoteRequest = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  service: string;
  scope: string;
  location: string;
  urgency: string;
  details: string | null;
  min_amount: number | null;
  max_amount: number | null;
  currency: string;
  summary: string | null;
  includes: string[];
  notes: string | null;
  whatsapp_message: string | null;
  response_payload: QuoteResponsePayload | null;
  source: string;
  ai_provider: string | null;
  ai_model: string | null;
  is_read: boolean;
  status: Status;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_META: Record<Status, { label: string; className: string }> = {
  new: { label: "Nuevo", className: "bg-primary/15 text-primary border-primary/30" },
  in_progress: {
    label: "En curso",
    className: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  },
  closed: {
    label: "Cerrado",
    className: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  },
};

const money = (min: number | null, max: number | null, currency = "EUR") => {
  if (min === null && max === null) return "Sin importe";
  const fmt = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
  if (min !== null && max !== null) return `${fmt.format(min)} - ${fmt.format(max)}`;
  return fmt.format(min ?? max ?? 0);
};

const getPricingReferences = (payload: QuoteResponsePayload | null) =>
  Array.isArray(payload?.pricingReferences)
    ? payload.pricingReferences.filter((item) => item.name && typeof item.price === "number")
    : [];

const csvEscape = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  return `"${s.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
};

const AdminQuoteRequests = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteSavedFor, setNoteSavedFor] = useState<string | null>(null);

  const { data: requests = [], isLoading, isFetching, refetch, error: requestsError } = useQuery({
    queryKey: ["quote_requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quote_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as QuoteRequest[];
    },
  });

  const updateRequest = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<QuoteRequest> }) => {
      const { error } = await supabase.from("quote_requests").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["quote_requests"] }),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((item) => {
      const matchesSearch =
        !q ||
        item.email.toLowerCase().includes(q) ||
        (item.name ?? "").toLowerCase().includes(q) ||
        (item.phone ?? "").toLowerCase().includes(q) ||
        item.service.toLowerCase().includes(q) ||
        item.scope.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        (item.details ?? "").toLowerCase().includes(q) ||
        (item.summary ?? "").toLowerCase().includes(q) ||
        (item.internal_notes ?? "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesRead =
        readFilter === "all" ||
        (readFilter === "unread" && !item.is_read) ||
        (readFilter === "read" && item.is_read);
      return matchesSearch && matchesStatus && matchesRead;
    });
  }, [requests, search, statusFilter, readFilter]);

  const selected = useMemo(
    () => requests.find((item) => item.id === selectedId) ?? null,
    [requests, selectedId],
  );
  const selectedPricingReferences = useMemo(
    () => getPricingReferences(selected?.response_payload ?? null),
    [selected],
  );

  const counts = useMemo(() => {
    const byStatus = { new: 0, in_progress: 0, closed: 0 } as Record<Status, number>;
    requests.forEach((item) => {
      byStatus[item.status] = (byStatus[item.status] || 0) + 1;
    });
    return {
      total: requests.length,
      unread: requests.filter((item) => !item.is_read).length,
      byStatus,
    };
  }, [requests]);
  const requestsErrorMessage = requestsError instanceof Error ? requestsError.message : "";

  const openRequest = (item: QuoteRequest) => {
    setSelectedId(item.id);
    setNoteDraft(item.internal_notes ?? "");
    setNoteSavedFor(null);
    if (!item.is_read) updateRequest.mutate({ id: item.id, patch: { is_read: true } });
  };

  const changeStatus = (id: string, status: Status) => {
    updateRequest.mutate({ id, patch: { status } });
  };

  const saveNote = () => {
    if (!selected) return;
    updateRequest.mutate(
      { id: selected.id, patch: { internal_notes: noteDraft } },
      {
        onSuccess: () => {
          setNoteSavedFor(selected.id);
          toast({ title: "Nota guardada" });
        },
      },
    );
  };

  const exportCSV = () => {
    const rows = filtered.map((item) => ({
      fecha: format(new Date(item.created_at), "yyyy-MM-dd HH:mm"),
      email: item.email,
      nombre: item.name ?? "",
      telefono: item.phone ?? "",
      servicio: item.service,
      alcance: item.scope,
      ubicacion: item.location,
      urgencia: item.urgency,
      importe: money(item.min_amount, item.max_amount, item.currency),
      estado: STATUS_META[item.status].label,
      resumen: item.summary ?? "",
      detalles: item.details ?? "",
      notas_internas: item.internal_notes ?? "",
    }));

    if (rows.length === 0) {
      toast({ title: "No hay solicitudes para exportar" });
      return;
    }

    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((row) => headers.map((h) => csvEscape((row as Record<string, unknown>)[h])).join(",")),
    ].join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `solicitudes-ia-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `Exportadas ${rows.length} solicitudes` });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6" /> Solicitudes IA
          </h1>
          <p className="text-muted-foreground text-sm">
            {counts.unread > 0 ? `${counts.unread} sin leer` : "Todas leídas"} · {counts.total} total
            {" · "}
            <span className="text-primary">{counts.byStatus.new} nuevas</span>
            {" · "}
            <span className="text-amber-500">{counts.byStatus.in_progress} en curso</span>
            {" · "}
            <span className="text-emerald-500">{counts.byStatus.closed} cerradas</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1" />
            Exportar CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={cn("h-4 w-4 mr-1", isFetching && "animate-spin")} />
            Actualizar
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por email, servicio, ciudad, alcance o notas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="new">Nuevo</SelectItem>
              <SelectItem value="in_progress">En curso</SelectItem>
              <SelectItem value="closed">Cerrado</SelectItem>
            </SelectContent>
          </Select>
          {(["all", "unread", "read"] as const).map((filter) => (
            <Button
              key={filter}
              variant={readFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setReadFilter(filter)}
            >
              {filter === "all" ? "Todas" : filter === "unread" ? "Sin leer" : "Leídas"}
            </Button>
          ))}
        </div>
      </div>

      {requestsErrorMessage && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-600">
          No se pudieron cargar las solicitudes IA. Es probable que falte aplicar la migración de Supabase `quote_requests`.
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(360px,0.85fr)_minmax(0,1.35fr)] gap-4 min-h-[60vh]">
        <Card className="overflow-hidden">
          <div className="border-b border-border px-3 py-2 bg-muted/30 text-xs text-muted-foreground">
            {filtered.length} de {requests.length} solicitudes
          </div>

          <div className="max-h-[72vh] overflow-y-auto divide-y divide-border">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Cargando...
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-muted-foreground text-center py-12 text-sm">No hay solicitudes</p>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => openRequest(item)}
                  className={cn(
                    "w-full text-left px-3 py-3 transition-colors hover:bg-muted/50",
                    selectedId === item.id && "bg-muted",
                    !item.is_read && "bg-primary/5",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn("truncate text-sm", !item.is_read ? "font-bold text-foreground" : "font-medium text-foreground/90")}>
                          {item.service}
                        </span>
                        {!item.is_read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{item.email}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {format(new Date(item.created_at), "dd MMM HH:mm", { locale: es })}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-foreground/70 line-clamp-2">
                    {item.scope} · {item.location} · {item.urgency}
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", STATUS_META[item.status].className)}>
                      {STATUS_META[item.status].label}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {money(item.min_amount, item.max_amount, item.currency)}
                    </span>
                    {item.internal_notes && (
                      <span className="text-[10px] text-muted-foreground ml-auto">nota</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        <Card className="overflow-hidden">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full p-12 text-muted-foreground">
              <Inbox className="h-12 w-12 mb-3 opacity-40" />
              <p className="text-sm">Selecciona una solicitud para ver todo el detalle</p>
            </div>
          ) : (
            <div className="flex flex-col h-full max-h-[78vh]">
              <div className="p-4 border-b border-border space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg font-display font-semibold text-foreground truncate">
                      {selected.service}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(selected.created_at), "EEEE dd 'de' MMMM yyyy, HH:mm", { locale: es })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    title={selected.is_read ? "Marcar no leída" : "Marcar leída"}
                    onClick={() =>
                      updateRequest.mutate({
                        id: selected.id,
                        patch: { is_read: !selected.is_read },
                      })
                    }
                  >
                    {selected.is_read ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4 text-primary" />}
                  </Button>
                </div>

                <div className="flex items-center gap-3 text-sm flex-wrap">
                  <a href={`mailto:${selected.email}`} className="text-primary hover:underline truncate">
                    {selected.email}
                  </a>
                  {selected.phone && (
                    <a
                      href={`https://wa.me/${selected.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener"
                      className="flex items-center gap-1 text-muted-foreground hover:text-primary"
                    >
                      <MessageCircle className="h-3 w-3" /> {selected.phone}
                    </a>
                  )}
                  <span className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(selected.updated_at), "dd MMM HH:mm", { locale: es })}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="text-xs text-muted-foreground">Estado:</span>
                  <Select
                    value={selected.status}
                    onValueChange={(v) => changeStatus(selected.id, v as Status)}
                  >
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Nuevo</SelectItem>
                      <SelectItem value="in_progress">En curso</SelectItem>
                      <SelectItem value="closed">Cerrado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant="outline" className={cn("ml-auto", STATUS_META[selected.status].className)}>
                    {STATUS_META[selected.status].label}
                  </Badge>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                <section>
                  <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                    Respuestas del cliente
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <Info label="Nombre" value={selected.name || "No indicado"} />
                    <Info label="Servicio" value={selected.service} />
                    <Info label="Alcance" value={selected.scope} />
                    <Info label="Ubicación" value={selected.location} />
                    <Info label="Urgencia" value={selected.urgency} />
                    <Info label="Origen" value={selected.source} />
                  </div>
                  {selected.details && (
                    <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Detalles adicionales</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{selected.details}</p>
                    </div>
                  )}
                </section>

                <section>
                  <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                    Presupuesto generado
                  </h3>
                  <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Importe orientativo</p>
                      <p className="font-display text-2xl font-bold text-gradient-primary">
                        {money(selected.min_amount, selected.max_amount, selected.currency)}
                      </p>
                    </div>
                    {selected.summary && <p className="text-sm text-foreground leading-relaxed">{selected.summary}</p>}
                    {selected.includes.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Incluye</p>
                        <ul className="space-y-1.5">
                          {selected.includes.map((item, idx) => (
                            <li key={`${item}-${idx}`} className="text-sm text-foreground flex gap-2">
                              <CheckCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selected.notes && (
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">Nota:</strong> {selected.notes}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground">
                      Motor: {selected.ai_provider || "sin dato"} · {selected.ai_model || "sin modelo"}
                    </p>
                    {selectedPricingReferences.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                          Referencias de precio usadas
                        </p>
                        <div className="grid gap-2">
                          {selectedPricingReferences.slice(0, 5).map((item, idx) => (
                            <div key={`${item.name}-${idx}`} className="rounded-md border border-border bg-background/50 px-3 py-2 text-xs">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="font-medium text-foreground">{item.name}</p>
                                  {item.category && <p className="text-muted-foreground">{item.category}</p>}
                                </div>
                                <p className="shrink-0 font-semibold text-primary">
                                  desde {item.price}€{item.priceSuffix ? ` ${item.priceSuffix}` : ""}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        {selected.response_payload?.pricingSource && (
                          <p className="mt-2 text-[11px] text-muted-foreground">
                            Fuente de precios: {selected.response_payload.pricingSource === "admin-pricing" ? "panel de precios" : "reglas internas"}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </section>

                {selected.whatsapp_message && (
                  <section>
                    <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                      Mensaje preparado para WhatsApp
                    </h3>
                    <p className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-foreground whitespace-pre-wrap">
                      {selected.whatsapp_message}
                    </p>
                  </section>
                )}

                <section>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs uppercase tracking-wide text-muted-foreground">
                      Notas internas
                    </h3>
                    <Button
                      size="sm"
                      variant={noteSavedFor === selected.id ? "outline" : "default"}
                      onClick={saveNote}
                      disabled={updateRequest.isPending || (selected.internal_notes ?? "") === noteDraft}
                    >
                      <Save className="h-3.5 w-3.5 mr-1" />
                      {noteSavedFor === selected.id ? "Guardado" : "Guardar"}
                    </Button>
                  </div>
                  <Textarea
                    value={noteDraft}
                    onChange={(e) => {
                      setNoteDraft(e.target.value);
                      setNoteSavedFor(null);
                    }}
                    placeholder="Añade seguimiento, precio final, próxima acción o contexto comercial..."
                    rows={5}
                    className="resize-none"
                  />
                </section>
              </div>

              <div className="border-t border-border p-3 flex gap-2 flex-wrap bg-muted/20">
                <Button asChild size="sm">
                  <a href={`mailto:${selected.email}`}>Responder por email</a>
                </Button>
                {selected.phone && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://wa.me/${selected.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener"
                    >
                      WhatsApp
                    </a>
                  </Button>
                )}
                {selected.status !== "closed" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={() => changeStatus(selected.id, "closed")}
                  >
                    Marcar como cerrada
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

const Info = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-border bg-muted/30 p-3">
    <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
    <p className="text-sm text-foreground break-words">{value}</p>
  </div>
);

export default AdminQuoteRequests;
