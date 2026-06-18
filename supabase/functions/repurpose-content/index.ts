import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAdmin } from "../_shared/adminAuth.ts";
import {
  callLovableChat,
  getAssistantText,
  isLovableStatus,
  parseJsonFromText,
} from "../_shared/lovableAi.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const adminAuth = await requireAdmin(req, corsHeaders);
    if ("response" in adminAuth) return adminAuth.response;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const {
      sourceContent,
      sourcePlatform,
      targetPlatform,
      contentType,
      language,
    } = await req.json();
    if (!sourceContent || !sourcePlatform || !targetPlatform) {
      throw new Error("Missing required fields");
    }

    const platformSpecs: Record<string, string> = {
      instagram:
        "Instagram: Captions hasta 2200 chars, hashtags estratégicos (máx 15), emojis, CTA claro. Stories: texto corto con interacción. Reels: hook en 3s.",
      tiktok:
        "TikTok: Descripciones cortas (máx 150 chars), hook en 2s, hashtags trending (máx 5), tono informal, formato vertical 9:16.",
      youtube:
        "YouTube: Título SEO (máx 60 chars), descripción completa, timestamps, tags, formato 16:9.",
    };

    const systemPrompt =
      `Eres un experto en repurposing de contenido para redes sociales de "Silvio Costa Photography" (fotografía, vídeo, drones, tours virtuales 360°).

Adapta contenido de ${sourcePlatform.toUpperCase()} a ${targetPlatform.toUpperCase()}.

PLATAFORMA DESTINO: ${
        platformSpecs[targetPlatform] || "Adapta al formato estándar."
      }

REGLAS: Mantén el mensaje central, adapta tono y formato, no copies textualmente, responde en ${
        language || "español"
      }, optimiza para engagement.

Responde en JSON:
{
  "title": "título adaptado",
  "caption": "caption adaptada",
  "hashtags": ["hashtag1", "hashtag2"],
  "hook": "gancho inicial",
  "callToAction": "CTA adaptado",
  "formatNotes": "notas de formato",
  "visualSuggestions": "sugerencias visuales",
  "adaptationNotes": "qué se cambió y por qué"
}`;

    let data: any;
    try {
      data = await callLovableChat(LOVABLE_API_KEY, {
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `CONTENIDO ORIGINAL (${sourcePlatform.toUpperCase()}):\n${
              typeof sourceContent === "string"
                ? sourceContent
                : JSON.stringify(sourceContent, null, 2)
            }\n\nAdapta para ${targetPlatform.toUpperCase()} en formato: ${
              contentType || "post"
            }.`,
          },
        ],
        temperature: 0.7,
      });
    } catch (error) {
      if (isLovableStatus(error, 429)) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (isLovableStatus(error, 402)) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw error;
    }

    const content = getAssistantText(data);
    let parsed: Record<string, unknown>;
    try {
      parsed = parseJsonFromText<Record<string, unknown>>(content, "object");
    } catch {
      parsed = { caption: content };
    }

    return new Response(
      JSON.stringify({
        ...parsed,
        sourcePlatform,
        targetPlatform,
        contentType: contentType || "post",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
