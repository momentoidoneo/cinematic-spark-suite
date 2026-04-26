import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type TrackingPayload =
  | {
      action: "start";
      page_path: string;
      referrer?: string | null;
      user_agent?: string | null;
      session_id: string;
      device_type?: string | null;
      browser?: string | null;
      os?: string | null;
      screen_size?: string | null;
      utm_source?: string | null;
      utm_medium?: string | null;
      utm_campaign?: string | null;
      utm_term?: string | null;
      utm_content?: string | null;
      country?: string | null;
      city?: string | null;
      region?: string | null;
    }
  | {
      action: "finish";
      id: string;
      session_id: string;
      duration_seconds: number;
      is_exit?: boolean;
    };

const cleanText = (value: unknown, maxLength: number) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
};

const cleanSessionId = (value: unknown) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!/^[A-Za-z0-9_-]{12,80}$/.test(trimmed)) return null;
  return trimmed;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as TrackingPayload;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (body.action === "finish") {
      const sessionId = cleanSessionId(body.session_id);
      const duration = Math.max(0, Math.min(24 * 60 * 60, Math.round(Number(body.duration_seconds) || 0)));

      if (!sessionId || !body.id) {
        return new Response(JSON.stringify({ error: "Datos inválidos" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabase
        .from("page_views")
        .update({ duration_seconds: duration, is_exit: Boolean(body.is_exit) })
        .eq("id", body.id)
        .eq("session_id", sessionId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.action !== "start") {
      return new Response(JSON.stringify({ error: "Acción inválida" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sessionId = cleanSessionId(body.session_id);
    const pagePath = cleanText(body.page_path, 500);
    if (!sessionId || !pagePath) {
      return new Response(JSON.stringify({ error: "Datos inválidos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data, error } = await supabase
      .from("page_views")
      .insert({
        page_path: pagePath,
        referrer: cleanText(body.referrer, 500),
        user_agent: cleanText(body.user_agent, 500),
        session_id: sessionId,
        device_type: cleanText(body.device_type, 50),
        browser: cleanText(body.browser, 50),
        os: cleanText(body.os, 50),
        screen_size: cleanText(body.screen_size, 50),
        utm_source: cleanText(body.utm_source, 100),
        utm_medium: cleanText(body.utm_medium, 100),
        utm_campaign: cleanText(body.utm_campaign, 200),
        utm_term: cleanText(body.utm_term, 200),
        utm_content: cleanText(body.utm_content, 200),
        country: cleanText(body.country, 100),
        city: cleanText(body.city, 100),
        region: cleanText(body.region, 100),
      })
      .select("id")
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[track-page-view] Error:", err);
    return new Response(JSON.stringify({ error: "No se pudo registrar la visita" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
