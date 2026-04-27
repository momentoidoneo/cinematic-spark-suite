import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const eventTypes: Record<string, "cta" | "whatsapp" | "form" | "quote"> = {
  cta_click: "cta",
  whatsapp_click: "whatsapp",
  quoter_whatsapp: "whatsapp",
  generate_lead: "form",
  quoter_complete: "quote",
};

const cleanText = (value: unknown, maxLength: number) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
};

const cleanSessionId = (value: unknown) => {
  const trimmed = cleanText(value, 80);
  if (!trimmed || !/^[A-Za-z0-9_-]{8,80}$/.test(trimmed)) return null;
  return trimmed;
};

const cleanMetadata = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => ["string", "number", "boolean"].includes(typeof v))
      .slice(0, 20)
      .map(([k, v]) => [k.slice(0, 80), typeof v === "string" ? v.slice(0, 300) : v]),
  );
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const eventName = cleanText(body.event_name, 80);
    if (!eventName || !eventTypes[eventName]) {
      return new Response(JSON.stringify({ error: "Evento inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sessionId = cleanSessionId(body.session_id);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (sessionId) {
      const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
      const { count } = await supabase
        .from("conversion_events")
        .select("id", { count: "exact", head: true })
        .eq("session_id", sessionId)
        .eq("event_name", eventName)
        .gte("created_at", oneMinuteAgo);

      if ((count ?? 0) >= 5) {
        return new Response(JSON.stringify({ success: true, rate_limited: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { error } = await supabase.from("conversion_events").insert({
      event_name: eventName,
      event_type: eventTypes[eventName],
      event_label: cleanText(body.event_label, 200),
      page_path: cleanText(body.page_path, 500),
      session_id: sessionId,
      referrer: cleanText(body.referrer, 500),
      utm_source: cleanText(body.utm_source, 100),
      utm_medium: cleanText(body.utm_medium, 100),
      utm_campaign: cleanText(body.utm_campaign, 200),
      user_agent: cleanText(body.user_agent, 500),
      metadata: cleanMetadata(body.metadata),
    });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[track-conversion-event] Error:", err);
    return new Response(JSON.stringify({ error: "No se pudo registrar la conversión" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

