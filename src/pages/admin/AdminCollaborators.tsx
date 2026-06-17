import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Camera,
  CheckCheck,
  Download,
  Eye,
  Inbox,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plane,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Users,
  Video,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type CollaboratorStatus = "new" | "reviewing" | "approved" | "rejected" | "archived";
type StatusFilter = "all" | CollaboratorStatus;
type ReadFilter = "all" | "unread" | "read";

type CollaboratorApplication = {
  id: string;
  full_name: string;
  email: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  cameras: string[];
  lenses: string[];
  drones: string[];
  camera_360: string;
  matterport_compatible: boolean;
  offers_video: boolean;
  has_gimbal: boolean;
  comments: string | null;
  status: CollaboratorStatus;
  is_read: boolean;
  internal_notes: string | null;
  source: string;
  privacy_accepted: boolean;
  privacy_accepted_at: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_META: Record<CollaboratorStatus, { label: string; className: string }> = {
  new: { label: "Nuevo", className: "border-primary/30 bg-primary/15 text-primary" },
  reviewing: { label: "En revisión", className: "border-amber-500/30 bg-amber-500/15 text-amber-500" },
  approved: { label: "Aprobado", className: "border-emerald-500/30 bg-emerald-500/15 text-emerald-500" },
  rejected: { label: "Descartado", className: "border-destructive/30 bg-destructive/15 text-destructive" },
  archived: { label: "Archivado", className: "border-muted-foreground/30 bg-muted text-muted-foreground" },
};

const statusOptions = Object.entries(STATUS_META) as [CollaboratorStatus, (typeof STATUS_META)[CollaboratorStatus]][];

const csvEscape = (value: unknown) => {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
};

const yesNo = (value: boolean) => (value ? "Sí" : "No");

const joinList = (items: string[] | null | undefined) =>
  Array.isArray(items) && items.length > 0 ? items.join(", ") : "—";

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="rounded-lg bg-muted/30 p-3">
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
    <div className="mt-1 text-sm text-foreground">{value || "—"}</div>
  </div>
);

const AdminCollaborators = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const {
    data: collaborators = [],
    isLoading,
    isFetching,
    refetch,
    error,
  } = useQuery({
    queryKey: ["collaborator_applications"],
    queryFn: async () => {
      const { data, error: queryError } = await supabase
        .from("collaborator_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (queryError) throw queryError;
      return data as CollaboratorApplication[];
    },
  });

  const updateCollaborator = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<CollaboratorApplication> }) => {
      const { error: updateError } = await supabase
        .from("collaborator_applications")
        .update(patch)
        .eq("id", id);
      if (updateError) throw updateError;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["collaborator_applications"] }),
  });

  const deleteCollaborator = useMutation({
    mutationFn: async (id: string) => {
      const { error: deleteError } = await supabase.from("collaborator_applications").delete().eq("id", id);
      if (deleteError) throw deleteError;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["collaborator_applications"] });
      if (selectedId === id) setSelectedId(null);
      toast({ title: "Colaborador eliminado" });
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return collaborators.filter((item) => {
      const haystack = [
        item.full_name,
        item.email,
        item.phone,
        item.city,
        item.country,
        item.address,
        item.camera_360,
        item.comments ?? "",
        item.internal_notes ?? "",
        ...item.cameras,
        ...item.lenses,
        ...item.drones,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !q || haystack.includes(q);
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesRead =
        readFilter === "all" ||
        (readFilter === "unread" && !item.is_read) ||
        (readFilter === "read" && item.is_read);
      return matchesSearch && matchesStatus && matchesRead;
    });
  }, [collaborators, search, statusFilter, readFilter]);

  const selected = useMemo(
    () => collaborators.find((item) => item.id === selectedId) ?? null,
    [collaborators, selectedId],
  );

  const counts = useMemo(() => {
    const byStatus = {
      new: 0,
      reviewing: 0,
      approved: 0,
      rejected: 0,
      archived: 0,
    } as Record<CollaboratorStatus, number>;
    collaborators.forEach((item) => {
      byStatus[item.status] = (byStatus[item.status] || 0) + 1;
    });
    return {
      total: collaborators.length,
      unread: collaborators.filter((item) => !item.is_read).length,
      byStatus,
    };
  }, [collaborators]);

  const openCollaborator = (item: CollaboratorApplication) => {
    setSelectedId(item.id);
    setNoteDraft(item.internal_notes ?? "");
    if (!item.is_read) updateCollaborator.mutate({ id: item.id, patch: { is_read: true } });
  };

  const changeStatus = (id: string, status: CollaboratorStatus) => {
    updateCollaborator.mutate(
      { id, patch: { status } },
      { onSuccess: () => toast({ title: `Estado cambiado a ${STATUS_META[status].label}` }) },
    );
  };

  const saveNotes = () => {
    if (!selected) return;
    updateCollaborator.mutate(
      { id: selected.id, patch: { internal_notes: noteDraft } },
      { onSuccess: () => toast({ title: "Notas guardadas" }) },
    );
  };

  const markAllRead = () => {
    const unreadIds = filtered.filter((item) => !item.is_read).map((item) => item.id);
    if (unreadIds.length === 0) return;
    Promise.all(
      unreadIds.map((id) =>
        supabase.from("collaborator_applications").update({ is_read: true }).eq("id", id),
      ),
    ).then(() => {
      queryClient.invalidateQueries({ queryKey: ["collaborator_applications"] });
      toast({ title: `${unreadIds.length} solicitud(es) marcadas como leídas` });
    });
  };

  const exportCSV = () => {
    const rows = filtered.map((item) => ({
      fecha: format(new Date(item.created_at), "yyyy-MM-dd HH:mm"),
      estado: STATUS_META[item.status].label,
      leido: yesNo(item.is_read),
      nombre: item.full_name,
      email: item.email,
      telefono: item.phone,
      direccion: item.address,
      poblacion: item.city,
      pais: item.country,
      camaras: joinList(item.cameras),
      lentes: joinList(item.lenses),
      drones: joinList(item.drones),
      camara_360: item.camera_360,
      matterport: yesNo(item.matterport_compatible),
      video: yesNo(item.offers_video),
      gimbal: yesNo(item.has_gimbal),
      comentarios: item.comments ?? "",
      notas_internas: item.internal_notes ?? "",
    }));
    if (rows.length === 0) {
      toast({ title: "No hay colaboradores para exportar" });
      return;
    }
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((row) => headers.map((header) => csvEscape((row as any)[header])).join(",")),
    ].join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `colaboradores-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: `Exportados ${rows.length} colaboradores` });
  };

  const errorMessage = error instanceof Error ? error.message : "";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-display font-bold text-foreground">
            <Users className="h-6 w-6" />
            Colaboradores
          </h1>
          <p className="text-sm text-muted-foreground">
            {counts.unread > 0 ? `${counts.unread} sin leer` : "Todo leído"} · {counts.total} total ·{" "}
            <span className="text-emerald-500">{counts.byStatus.approved} aprobados</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")} />
            Actualizar
          </Button>
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Marcar leídos
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_170px_150px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, zona, equipo, email..."
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {statusOptions.map(([status, meta]) => (
                <SelectItem key={status} value={status}>{meta.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={readFilter} onValueChange={(value) => setReadFilter(value as ReadFilter)}>
            <SelectTrigger>
              <SelectValue placeholder="Lectura" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="unread">Sin leer</SelectItem>
              <SelectItem value="read">Leídos</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {errorMessage && (
        <Card className="border-destructive/40">
          <CardContent className="p-4 text-sm text-destructive">
            No se pudieron cargar los colaboradores: {errorMessage}
          </CardContent>
        </Card>
      )}

      <div className="grid min-h-[62vh] gap-4 xl:grid-cols-[minmax(340px,0.9fr)_minmax(0,1.45fr)]">
        <Card className="overflow-hidden">
          <CardContent className="h-full p-0">
            <div className="border-b border-border px-4 py-3 text-sm font-semibold text-muted-foreground">
              {filtered.length} resultado(s)
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Cargando colaboradores...
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                  <Inbox className="mb-2 h-8 w-8" />
                  No hay solicitudes con estos filtros.
                </div>
              ) : (
                filtered.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openCollaborator(item)}
                    className={cn(
                      "w-full border-b border-border p-4 text-left transition-colors hover:bg-secondary/60",
                      selectedId === item.id && "bg-primary/10",
                      !item.is_read && "bg-primary/5",
                    )}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{item.full_name}</h3>
                        <p className="text-xs text-muted-foreground">{format(new Date(item.created_at), "dd MMM yyyy · HH:mm", { locale: es })}</p>
                      </div>
                      <Badge variant="outline" className={STATUS_META[item.status].className}>
                        {STATUS_META[item.status].label}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{item.email}</p>
                      <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{item.city}, {item.country}</p>
                      <p className="line-clamp-1">
                        {[item.cameras[0], item.lenses[0], item.drones[0]].filter(Boolean).join(" · ") || "Sin equipo detallado"}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            {!selected ? (
              <div className="flex min-h-[55vh] flex-col items-center justify-center text-center text-muted-foreground">
                <Users className="mb-3 h-10 w-10" />
                <p>Selecciona una solicitud para ver todos los datos del colaborador.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={STATUS_META[selected.status].className}>
                        {STATUS_META[selected.status].label}
                      </Badge>
                      <Badge variant="outline">{selected.is_read ? "Leído" : "Sin leer"}</Badge>
                      {selected.privacy_accepted && <Badge variant="secondary">Privacidad aceptada</Badge>}
                    </div>
                    <h2 className="text-2xl font-display font-bold text-foreground">{selected.full_name}</h2>
                    <p className="text-sm text-muted-foreground">
                      Recibido el {format(new Date(selected.created_at), "dd MMMM yyyy · HH:mm", { locale: es })}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select value={selected.status} onValueChange={(value) => changeStatus(selected.id, value as CollaboratorStatus)}>
                      <SelectTrigger className="w-[170px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(([status, meta]) => (
                          <SelectItem key={status} value={status}>{meta.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCollaborator.mutate({ id: selected.id, patch: { is_read: !selected.is_read } })}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {selected.is_read ? "Marcar sin leer" : "Marcar leído"}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Eliminar solicitud</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción eliminará definitivamente la solicitud de {selected.full_name}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteCollaborator.mutate(selected.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <section className="grid gap-3 md:grid-cols-3">
                  <DetailRow label="Email" value={<a href={`mailto:${selected.email}`} className="text-primary hover:underline">{selected.email}</a>} />
                  <DetailRow label="Teléfono" value={<a href={`tel:${selected.phone}`} className="text-primary hover:underline">{selected.phone}</a>} />
                  <DetailRow label="Ubicación" value={`${selected.city}, ${selected.country}`} />
                </section>

                <section className="grid gap-3 md:grid-cols-2">
                  <DetailRow label="Dirección / zona" value={selected.address} />
                  <DetailRow label="Origen" value={selected.source} />
                </section>

                <section className="grid gap-3 md:grid-cols-3">
                  <DetailRow label="Cámaras" value={<span className="whitespace-pre-wrap">{joinList(selected.cameras)}</span>} />
                  <DetailRow label="Lentes" value={<span className="whitespace-pre-wrap">{joinList(selected.lenses)}</span>} />
                  <DetailRow label="Drones" value={<span className="whitespace-pre-wrap">{joinList(selected.drones)}</span>} />
                </section>

                <section className="grid gap-3 md:grid-cols-4">
                  <DetailRow label="Cámara 360" value={selected.camera_360 || "—"} />
                  <DetailRow label="Matterport" value={yesNo(selected.matterport_compatible)} />
                  <DetailRow label="Vídeo" value={yesNo(selected.offers_video)} />
                  <DetailRow label="Gimbal" value={yesNo(selected.has_gimbal)} />
                </section>

                <section className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg border border-border p-4">
                    <Camera className="mb-2 h-5 w-5 text-primary" />
                    <p className="text-sm font-semibold text-foreground">{selected.cameras.length} cámara(s)</p>
                    <p className="text-xs text-muted-foreground">Equipo de foto declarado</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <Video className="mb-2 h-5 w-5 text-primary" />
                    <p className="text-sm font-semibold text-foreground">{selected.offers_video ? "Puede hacer vídeo" : "No indica vídeo"}</p>
                    <p className="text-xs text-muted-foreground">Gimbal: {yesNo(selected.has_gimbal)}</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <Plane className="mb-2 h-5 w-5 text-primary" />
                    <p className="text-sm font-semibold text-foreground">{selected.drones.length} dron(es)</p>
                    <p className="text-xs text-muted-foreground">Para asignaciones aéreas</p>
                  </div>
                </section>

                {selected.comments && (
                  <section>
                    <h3 className="mb-2 text-sm font-semibold text-foreground">Comentarios del colaborador</h3>
                    <div className="whitespace-pre-wrap rounded-lg bg-muted/30 p-4 text-sm text-muted-foreground">
                      {selected.comments}
                    </div>
                  </section>
                )}

                <section>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-foreground">Notas internas</h3>
                    <Button size="sm" onClick={saveNotes} disabled={updateCollaborator.isPending}>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar
                    </Button>
                  </div>
                  <Textarea
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    rows={5}
                    placeholder="Zonas reales de cobertura, tarifas pactadas, calidad, disponibilidad, incidencias, links de portfolio..."
                  />
                </section>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCollaborators;
