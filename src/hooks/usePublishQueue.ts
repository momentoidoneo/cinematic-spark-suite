import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface PublishQueueItem {
  id: string;
  content_id: string | null;
  platform: string;
  publish_mode: string;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  title: string | null;
  caption: string | null;
  hashtags: string[];
  media_url: string | null;
  media_type: string | null;
  platform_post_id: string | null;
  platform_post_url: string | null;
  platform_response: Json | null;
  attempt_count: number;
  max_attempts: number;
  last_error: string | null;
  next_retry_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlatformConnection {
  id: string;
  platform: string;
  account_name: string | null;
  account_id: string | null;
  access_token?: string | null;
  refresh_token?: string | null;
  token_expires_at: string | null;
  scopes: string[] | null;
  is_active: boolean;
  connection_status: string;
  last_verified_at: string | null;
  meta_data: Json | null;
  created_at: string;
  updated_at: string;
}

export interface PublishLog {
  id: string;
  queue_id: string | null;
  platform: string;
  action: string;
  status: string;
  error_message: string | null;
  duration_ms: number | null;
  created_at: string;
}

export function usePlatformConnections() {
  const qc = useQueryClient();
  const key = ["platform-connections"];

  const { data: connections = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_platform_connections")
        .select("id,platform,account_name,account_id,token_expires_at,scopes,is_active,connection_status,last_verified_at,meta_data,created_at,updated_at")
        .order("platform");
      if (error) throw error;
      return data as unknown as PlatformConnection[];
    },
  });

  const upsertConnection = useMutation({
    mutationFn: async (conn: Partial<PlatformConnection> & { platform: string }) => {
      const { error } = await supabase.from("social_platform_connections").upsert(conn, { onConflict: "platform" });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: key }); toast.success("Conexión actualizada"); },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Error actualizando conexión"),
  });

  const deleteConnection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("social_platform_connections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: key }); toast.success("Conexión eliminada"); },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Error eliminando conexión"),
  });

  const verifyConnection = useMutation({
    mutationFn: async (platform: string) => {
      const { data, error } = await supabase.functions.invoke("publish-social", { body: { action: "verify_connection", platform } });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: key });
      if (data.connected) toast.success("Conexión verificada ✓");
      else toast.error("Conexión no válida");
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Error al verificar"),
  });

  const getConnection = (platform: string) => connections.find(c => c.platform === platform);

  return { connections, isLoading, upsertConnection, deleteConnection, verifyConnection, getConnection };
}

export function usePublishQueue() {
  const qc = useQueryClient();
  const key = ["publish-queue"];

  const { data: queue = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase.from("social_publish_queue").select("*").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data as unknown as PublishQueueItem[];
    },
  });

  const enqueue = useMutation({
    mutationFn: async (params: { contentId: string; platform?: string; publishMode?: string }) => {
      const { data, error } = await supabase.functions.invoke("publish-social", { body: { action: "enqueue", ...params } });
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: key }); toast.success("Añadido a la cola"); },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Error al encolar"),
  });

  const publish = useMutation({
    mutationFn: async (queueId: string) => {
      const { data, error } = await supabase.functions.invoke("publish-social", { body: { action: "publish", queueId } });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: key });
      qc.invalidateQueries({ queryKey: ["social_content"] });
      if (data.success) toast.success("¡Publicado!");
      else toast.error(data.result?.error || "Error al publicar");
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Error al publicar"),
  });

  const cancel = useMutation({
    mutationFn: async (params: { queueId: string; platform?: string }) => {
      const { data, error } = await supabase.functions.invoke("publish-social", { body: { action: "cancel", ...params } });
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: key }); toast.success("Cancelado"); },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Error al cancelar"),
  });

  return { queue, isLoading, enqueue, publish, cancel };
}

export function usePublishLogs() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["publish-logs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("social_publish_logs").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data as unknown as PublishLog[];
    },
  });
  return { logs, isLoading };
}

export function useFetchAnalytics() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (platform?: string) => {
      const { data, error } = await supabase.functions.invoke("fetch-social-analytics", { body: platform ? { platform } : {} });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["social_analytics"] });
      const ok = data.results?.filter((r: { status: string }) => r.status === "success").length || 0;
      if (ok > 0) toast.success(`Métricas actualizadas de ${ok} plataforma(s)`);
      else toast.error("No se pudieron obtener métricas");
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Error al obtener métricas"),
  });
}

export function useRepurposeContent() {
  return useMutation({
    mutationFn: async (params: { sourceContent: string | object; sourcePlatform: string; targetPlatform: string; contentType?: string }) => {
      const { data, error } = await supabase.functions.invoke("repurpose-content", { body: params });
      if (error) throw error;
      return data;
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Error al adaptar contenido"),
  });
}
