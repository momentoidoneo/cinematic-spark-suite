import { requireAdmin } from "../_shared/adminAuth.ts";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import {
  callIndependentChat,
  getAssistantText,
  getFirstToolArguments,
  isIndependentStatus,
  parseJsonFromText,
} from "../_shared/independentAi.ts";

interface Body {
  title?: string;
  excerpt?: string;
  content?: string;
  page_path?: string;
  current_title?: string;
  current_description?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const adminAuth = await requireAdmin(req, corsHeaders);
    if ("response" in adminAuth) return adminAuth.response;

    const body = (await req.json()) as Body;
    const context = [
      body.title && `Título: ${body.title}`,
      body.page_path && `Ruta: ${body.page_path}`,
      body.excerpt && `Extracto: ${body.excerpt}`,
      body.content &&
      `Contenido: ${
        String(body.content).replace(/<[^>]*>/g, " ").slice(0, 1500)
      }`,
      body.current_title && `Meta title actual: ${body.current_title}`,
      body.current_description &&
      `Meta desc actual: ${body.current_description}`,
    ]
      .filter(Boolean)
      .join("\n");

    const systemPrompt =
      `Eres un experto SEO para Silvio Costa Photography (silviocosta.net), fotografía y vídeo profesional en España y Portugal. Genera meta tags optimizados para Google en español.

Reglas estrictas:
- meta_title: 50-60 caracteres, incluye marca al final si cabe (" | Silvio Costa"), sin clickbait.
- meta_description: 140-160 caracteres, persuasiva, con CTA implícito y palabra clave principal al inicio.
- Sin comillas dobles dentro de los valores.
- Devuelve solo un objeto JSON con meta_title y meta_description. No ejecutes herramientas.`;

    let data: any;
    try {
      data = await callIndependentChat({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: context || "Genera meta tags genéricos para la home.",
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "seo_meta",
              description: "Devuelve meta title y meta description optimizados",
              parameters: {
                type: "object",
                properties: {
                  meta_title: {
                    type: "string",
                    description: "50-60 caracteres",
                  },
                  meta_description: {
                    type: "string",
                    description: "140-160 caracteres",
                  },
                },
                required: ["meta_title", "meta_description"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "seo_meta" } },
      });
    } catch (error) {
      if (isIndependentStatus(error, 429)) {
        return new Response(
          JSON.stringify({
            error: "Límite de uso de IA alcanzado. Inténtalo en un momento.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      if (isIndependentStatus(error, 503)) {
        return new Response(
          JSON.stringify({
            error:
              "OpenClaw no está disponible temporalmente. Inténtalo más tarde.",
          }),
          {
            status: 503,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      console.error("Gateway error", error);
      throw new Error("AI gateway error");
    }

    const parsed = getFirstToolArguments(data) ??
      parseJsonFromText(getAssistantText(data), "object");

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-seo-meta error", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
