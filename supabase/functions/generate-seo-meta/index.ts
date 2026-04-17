import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

interface Body {
  title?: string;
  excerpt?: string;
  content?: string;
  page_path?: string;
  current_title?: string;
  current_description?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const body = (await req.json()) as Body;
    const context = [
      body.title && `Título: ${body.title}`,
      body.page_path && `Ruta: ${body.page_path}`,
      body.excerpt && `Extracto: ${body.excerpt}`,
      body.content && `Contenido: ${String(body.content).replace(/<[^>]*>/g, " ").slice(0, 1500)}`,
      body.current_title && `Meta title actual: ${body.current_title}`,
      body.current_description && `Meta desc actual: ${body.current_description}`,
    ]
      .filter(Boolean)
      .join("\n");

    const systemPrompt = `Eres un experto SEO para Silvio Costa Photography (silviocosta.net), fotografía y vídeo profesional en España y Portugal. Genera meta tags optimizados para Google en español.

Reglas estrictas:
- meta_title: 50-60 caracteres, incluye marca al final si cabe (" | Silvio Costa"), sin clickbait.
- meta_description: 140-160 caracteres, persuasiva, con CTA implícito y palabra clave principal al inicio.
- Sin comillas dobles dentro de los valores.
- Devuelve solo a través de la herramienta seo_meta.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: context || "Genera meta tags genéricos para la home." },
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
                  meta_title: { type: "string", description: "50-60 caracteres" },
                  meta_description: { type: "string", description: "140-160 caracteres" },
                },
                required: ["meta_title", "meta_description"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "seo_meta" } },
      }),
    });

    if (resp.status === 429) {
      return new Response(
        JSON.stringify({ error: "Límite de uso de IA alcanzado. Inténtalo en un momento." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (resp.status === 402) {
      return new Response(
        JSON.stringify({ error: "Créditos de IA agotados. Añade créditos en Settings → Workspace → Usage." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!resp.ok) {
      const t = await resp.text();
      console.error("Gateway error", resp.status, t);
      throw new Error("AI gateway error");
    }

    const data = await resp.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall?.function?.arguments;
    const parsed = typeof args === "string" ? JSON.parse(args) : args;

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-seo-meta error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
