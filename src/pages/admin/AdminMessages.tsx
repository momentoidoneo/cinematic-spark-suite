import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Mail,
  MailOpen,
  Trash2,
  Phone,
  Calendar,
  RefreshCw,
  Download,
  CheckCheck,
  Inbox,
  Loader2,
  Save,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type Status = "new" | "in_progress" | "closed";
type StatusFilter = "all" | Status;
type ReadFilter = "all" | "unread" | "read";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  is_read: boolean;
  status: Status;
  notes: string | null;
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

const csvEscape = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  return `"${s.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
};

const AdminMessages = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [noteDraft, setNoteDraft] = useState("");
  const [noteSavedFor, setNoteSavedFor] = useState<string | null>(null);

  const { data: messages = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["contact_messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ContactMessage[];
    },
  });

  const updateMessage = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<ContactMessage> }) => {
      const { error } = await supabase.from("contact_messages").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contact_messages"] }),
  });

  const bulkUpdate = useMutation({
    mutationFn: async ({ ids, patch }: { ids: string[]; patch: Partial<ContactMessage> }) => {
      const { error } = await supabase.from("contact_messages").update(patch).in("id", ids);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["contact_messages"] });
      toast({ title: `${vars.ids.length} mensaje(s) actualizado(s)` });
      setCheckedIds(new Set());
    },
  });

  const bulkDelete = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("contact_messages").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ["contact_messages"] });
      toast({ title: `${ids.length} mensaje(s) eliminado(s)` });
      setCheckedIds(new Set());
      if (selectedId && ids.includes(selectedId)) setSelectedId(null);
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return messages.filter((m) => {
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q) ||
        (m.notes ?? "").toLowerCase().includes(q) ||
        (m.phone ?? "").toLowerCase().includes(q);
      const matchesRead =
        readFilter === "all" ||
        (readFilter === "unread" && !m.is_read) ||
        (readFilter === "read" && m.is_read);
      const matchesStatus = statusFilter === "all" || m.status === statusFilter;
      return matchesSearch && matchesRead && matchesStatus;
    });
  }, [messages, search, readFilter, statusFilter]);

  const selected = useMemo(
    () => messages.find((m) => m.id === selectedId) ?? null,
    [messages, selectedId],
  );

  const counts = useMemo(() => {
    const total = messages.length;
    const unread = messages.filter((m) => !m.is_read).length;
    const byStatus = { new: 0, in_progress: 0, closed: 0 } as Record<Status, number>;
    messages.forEach((m) => {
      byStatus[m.status] = (byStatus[m.status] || 0) + 1;
    });
    return { total, unread, byStatus };
  }, [messages]);

  const allFilteredChecked =
    filtered.length > 0 && filtered.every((m) => checkedIds.has(m.id));

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCheckAll = () => {
    if (allFilteredChecked) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(filtered.map((m) => m.id)));
    }
  };

  const openMessage = (msg: ContactMessage) => {
    setSelectedId(msg.id);
    setNoteDraft(msg.notes ?? "");
    setNoteSavedFor(null);
    if (!msg.is_read) updateMessage.mutate({ id: msg.id, patch: { is_read: true } });
  };

  const saveNote = () => {
    if (!selected) return;
    updateMessage.mutate(
      { id: selected.id, patch: { notes: noteDraft } },
      {
        onSuccess: () => {
          setNoteSavedFor(selected.id);
          toast({ title: "Nota guardada" });
        },
      },
    );
  };

  const changeStatus = (id: string, status: Status) => {
    updateMessage.mutate({ id, patch: { status } });
  };

  const exportCSV = () => {
    const rows = (checkedIds.size > 0
      ? messages.filter((m) => checkedIds.has(m.id))
      : filtered
    ).map((m) => ({
      fecha: format(new Date(m.created_at), "yyyy-MM-dd HH:mm"),
      nombre: m.name,
      email: m.email,
      telefono: m.phone ?? "",
      estado: STATUS_META[m.status].label,
      leido: m.is_read ? "sí" : "no",
      mensaje: m.message,
      notas: m.notes ?? "",
    }));
    if (rows.length === 0) {
      toast({ title: "No hay mensajes para exportar" });
      return;
    }
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => csvEscape((r as any)[h])).join(",")),
    ].join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mensajes-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `Exportados ${rows.length} mensajes` });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Inbox className="h-6 w-6" /> Bandeja de mensajes
          </h1>
          <p className="text-muted-foreground text-sm">
            {counts.unread > 0 ? `${counts.unread} sin leer` : "Todos leídos"} · {counts.total} total
            {" · "}
            <span className="text-primary">{counts.byStatus.new} nuevos</span>
            {" · "}
            <span className="text-amber-500">{counts.byStatus.in_progress} en curso</span>
            {" · "}
            <span className="text-emerald-500">{counts.byStatus.closed} cerrados</span>
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

      {/* Filtros */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email, teléfono, mensaje o notas..."
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
          {(["all", "unread", "read"] as const).map((f) => (
            <Button
              key={f}
              variant={readFilter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setReadFilter(f)}
            >
              {f === "all" ? "Todos" : f === "unread" ? "Sin leer" : "Leídos"}
            </Button>
          ))}
        </div>
      </div>

      {/* Acciones masivas */}
      {checkedIds.size > 0 && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="p-3 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium">
              {checkedIds.size} seleccionado(s)
            </span>
            <div className="flex gap-2 flex-wrap ml-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  bulkUpdate.mutate({ ids: [...checkedIds], patch: { is_read: true } })
                }
              >
                <CheckCheck className="h-4 w-4 mr-1" /> Marcar leídos
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  bulkUpdate.mutate({ ids: [...checkedIds], patch: { is_read: false } })
                }
              >
                <Mail className="h-4 w-4 mr-1" /> Marcar no leídos
              </Button>
              <Select
                onValueChange={(v) =>
                  bulkUpdate.mutate({ ids: [...checkedIds], patch: { status: v as Status } })
                }
              >
                <SelectTrigger className="w-[150px] h-9">
                  <SelectValue placeholder="Cambiar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Nuevo</SelectItem>
                  <SelectItem value="in_progress">En curso</SelectItem>
                  <SelectItem value="closed">Cerrado</SelectItem>
                </SelectContent>
              </Select>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar {checkedIds.size} mensajes?</AlertDialogTitle>
                    <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => bulkDelete.mutate([...checkedIds])}>
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bandeja: lista + detalle */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-4 min-h-[60vh]">
        {/* Lista */}
        <Card className="overflow-hidden">
          <div className="border-b border-border p-2 flex items-center gap-2 bg-muted/30">
            <Checkbox
              checked={allFilteredChecked}
              onCheckedChange={toggleCheckAll}
              aria-label="Seleccionar todos"
            />
            <span className="text-xs text-muted-foreground">
              {filtered.length} de {messages.length}
            </span>
          </div>

          <div className="max-h-[70vh] overflow-y-auto divide-y divide-border">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Cargando…
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-muted-foreground text-center py-12 text-sm">No hay mensajes</p>
            ) : (
              filtered.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => openMessage(msg)}
                  className={cn(
                    "w-full text-left px-3 py-3 flex gap-3 items-start transition-colors hover:bg-muted/50",
                    selectedId === msg.id && "bg-muted",
                    !msg.is_read && "bg-primary/5",
                  )}
                >
                  <div onClick={(e) => e.stopPropagation()} className="pt-1">
                    <Checkbox
                      checked={checkedIds.has(msg.id)}
                      onCheckedChange={() => toggleCheck(msg.id)}
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "truncate text-sm",
                          !msg.is_read ? "font-bold text-foreground" : "font-medium text-foreground/90",
                        )}
                      >
                        {msg.name}
                      </span>
                      {!msg.is_read && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                      <span className="ml-auto text-[10px] text-muted-foreground shrink-0">
                        {format(new Date(msg.created_at), "dd MMM HH:mm", { locale: es })}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{msg.email}</div>
                    <p className="text-xs text-foreground/70 line-clamp-2">{msg.message}</p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] px-1.5 py-0", STATUS_META[msg.status].className)}
                      >
                        {STATUS_META[msg.status].label}
                      </Badge>
                      {msg.notes && (
                        <span className="text-[10px] text-muted-foreground">📝 nota</span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Detalle */}
        <Card className="overflow-hidden">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full p-12 text-muted-foreground">
              <Inbox className="h-12 w-12 mb-3 opacity-40" />
              <p className="text-sm">Selecciona un mensaje para ver el detalle</p>
            </div>
          ) : (
            <div className="flex flex-col h-full max-h-[75vh]">
              <div className="p-4 border-b border-border space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="text-lg font-display font-semibold text-foreground truncate">
                      {selected.name}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(selected.created_at), "EEEE dd 'de' MMMM yyyy, HH:mm", {
                        locale: es,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      title={selected.is_read ? "Marcar no leído" : "Marcar leído"}
                      onClick={() =>
                        updateMessage.mutate({
                          id: selected.id,
                          patch: { is_read: !selected.is_read },
                        })
                      }
                    >
                      {selected.is_read ? (
                        <MailOpen className="h-4 w-4" />
                      ) : (
                        <Mail className="h-4 w-4 text-primary" />
                      )}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar mensaje?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Se eliminará permanentemente el mensaje de {selected.name}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => bulkDelete.mutate([selected.id])}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm flex-wrap">
                  <a
                    href={`mailto:${selected.email}`}
                    className="text-primary hover:underline truncate"
                  >
                    {selected.email}
                  </a>
                  {selected.phone && (
                    <a
                      href={`tel:${selected.phone}`}
                      className="flex items-center gap-1 text-muted-foreground hover:text-primary"
                    >
                      <Phone className="h-3 w-3" /> {selected.phone}
                    </a>
                  )}
                  <span className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(selected.updated_at), "dd MMM HH:mm", { locale: es })}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
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
                  <Badge
                    variant="outline"
                    className={cn("ml-auto", STATUS_META[selected.status].className)}
                  >
                    {STATUS_META[selected.status].label}
                  </Badge>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                    Mensaje
                  </h3>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {selected.message}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs uppercase tracking-wide text-muted-foreground">
                      Notas internas
                    </h3>
                    <Button
                      size="sm"
                      variant={noteSavedFor === selected.id ? "outline" : "default"}
                      onClick={saveNote}
                      disabled={updateMessage.isPending || (selected.notes ?? "") === noteDraft}
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
                    placeholder="Añade notas privadas sobre este contacto (no se envían al cliente)..."
                    rows={5}
                    className="resize-none"
                  />
                </div>
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
                    Marcar como cerrado
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

export default AdminMessages;
