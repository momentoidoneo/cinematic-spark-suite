import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SocialContent {
  id: string;
  title: string;
  caption: string | null;
  platform: string;
  content_type: string;
  status: string;
  scheduled_at: string | null;
  campaign: string | null;
  hashtags: string[];
  image_url: string | null;
  video_url: string | null;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface SocialBankItem {
  id: string;
  name: string;
  type: string;
  content: string | null;
  image_url: string | null;
  category: string | null;
  tags: string[];
  times_used: number;
  created_at: string;
}

export interface SocialAnalyticsEntry {
  id: string;
  platform: string;
  metric_date: string;
  followers: number;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  engagement_rate: number;
  profile_views: number;
  website_clicks: number;
}

// ─── Content Calendar ──────────────────────────────
export function useSocialContent() {
  const qc = useQueryClient();
  const key = ["social_content"];

  const { data: contents = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_content")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as SocialContent[];
    },
  });

  const createContent = useMutation({
    mutationFn: async (input: Partial<SocialContent>) => {
      const { error } = await supabase.from("social_content").insert(input as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: key }); toast.success("Contenido creado"); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateContent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SocialContent> & { id: string }) => {
      const { error } = await supabase.from("social_content").update(updates as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: key }); toast.success("Contenido actualizado"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteContent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("social_content").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: key }); toast.success("Contenido eliminado"); },
    onError: (e: any) => toast.error(e.message),
  });

  return { contents, isLoading, createContent, updateContent, deleteContent };
}

// ─── Content Bank ──────────────────────────────────
export function useSocialContentBank() {
  const qc = useQueryClient();
  const key = ["social_content_bank"];

  const { data: bankItems = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_content_bank")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as SocialBankItem[];
    },
  });

  const createBankItem = useMutation({
    mutationFn: async (input: Partial<SocialBankItem>) => {
      const { error } = await supabase.from("social_content_bank").insert(input as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: key }); toast.success("Guardado en banco"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteBankItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("social_content_bank").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: key }); toast.success("Eliminado del banco"); },
    onError: (e: any) => toast.error(e.message),
  });

  return { bankItems, isLoading, createBankItem, deleteBankItem };
}

// ─── Analytics ─────────────────────────────────────
export function useSocialAnalytics() {
  const qc = useQueryClient();
  const key = ["social_analytics"];

  const { data: analytics = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_analytics")
        .select("*")
        .order("metric_date", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as SocialAnalyticsEntry[];
    },
  });

  const upsertAnalytics = useMutation({
    mutationFn: async (input: Partial<SocialAnalyticsEntry>) => {
      const { error } = await supabase.from("social_analytics").upsert(input as any, { onConflict: "platform,metric_date" });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: key }); toast.success("Métricas guardadas"); },
    onError: (e: any) => toast.error(e.message),
  });

  return { analytics, isLoading, upsertAnalytics };
}

// ─── AI Content Generation ─────────────────────────
export function useGenerateSocialContent() {
  return useMutation({
    mutationFn: async (params: {
      platform: string;
      contentType: string;
      topic: string;
      tone: string;
      includeHashtags: boolean;
      includeEmojis: boolean;
      campaignContext: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("generate-social-content", {
        body: params,
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onError: (e: any) => toast.error(e.message || "Error generando contenido"),
  });
}
