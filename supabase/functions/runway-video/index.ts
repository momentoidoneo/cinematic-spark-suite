import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const RUNWAY_API_KEY = Deno.env.get("RUNWAY_API_KEY");
    if (!RUNWAY_API_KEY) throw new Error("RUNWAY_API_KEY not configured");

    const body = await req.json();
    const { action } = body;

    // ─── Text to Video ────────────────────────────
    if (action === "text_to_video") {
      const { prompt, ratio, duration, model } = body;
      if (!prompt) throw new Error("Missing prompt");

      const res = await fetch("https://api.dev.runwayml.com/v1/text_to_video", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RUNWAY_API_KEY}`,
          "Content-Type": "application/json",
          "X-Runway-Version": "2024-11-06",
        },
        body: JSON.stringify({
          model: model || "gen4",
          promptText: prompt,
          ratio: ratio || "1280:720",
          duration: duration || 5,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        if (res.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Espera un momento." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (res.status === 402) return new Response(JSON.stringify({ error: "Créditos insuficientes en Runway." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error(`Runway API error [${res.status}]: ${errText}`);
      }

      const data = await res.json();
      return new Response(JSON.stringify({ taskId: data.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ─── Image to Video ───────────────────────────
    if (action === "image_to_video") {
      const { prompt, imageUrl, ratio, duration, model } = body;
      if (!imageUrl) throw new Error("Missing imageUrl");

      const res = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RUNWAY_API_KEY}`,
          "Content-Type": "application/json",
          "X-Runway-Version": "2024-11-06",
        },
        body: JSON.stringify({
          model: model || "gen4",
          promptImage: imageUrl,
          promptText: prompt || "",
          ratio: ratio || "1280:720",
          duration: duration || 5,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        if (res.status === 429) return new Response(JSON.stringify({ error: "Rate limit. Espera un momento." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (res.status === 402) return new Response(JSON.stringify({ error: "Créditos insuficientes en Runway." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error(`Runway API error [${res.status}]: ${errText}`);
      }

      const data = await res.json();
      return new Response(JSON.stringify({ taskId: data.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ─── Check Task Status ────────────────────────
    if (action === "check_status") {
      const { taskId } = body;
      if (!taskId) throw new Error("Missing taskId");

      const res = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${RUNWAY_API_KEY}`,
          "X-Runway-Version": "2024-11-06",
        },
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Runway status error [${res.status}]: ${errText}`);
      }

      const data = await res.json();
      return new Response(JSON.stringify({
        status: data.status,
        progress: data.progress,
        output: data.output,
        failure: data.failure,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error: any) {
    console.error("runway-video error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
