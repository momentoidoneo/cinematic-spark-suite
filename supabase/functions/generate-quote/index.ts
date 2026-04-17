import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuoteRequest {
  service: string;        // tipo de servicio
  scope: string;          // alcance/m2/duración
  location: string;       // ubicación
  urgency: string;        // urgencia
  details?: string;       // detalles adicionales
}

const SYSTEM_PROMPT = `Eres el asistente de presupuestos de Silvio Costa Photography (silviocosta.net), estudio profesional de fotografía, vídeo, dron, tours virtuales Matterport, eventos y renders 3D con base en Portugal/España.

Tu tarea: dada la información del cliente, generar un presupuesto orientativo en EUR con un rango (mínimo–máximo), explicar qué incluye y qué factores hacen variar el precio. Usa tono profesional, cercano y conciso.

Tarifas de referencia (EUR, sin IVA):
- Fotografía corporativa/producto: 250–600 €/sesión (4h)
- Fotografía inmobiliaria estándar (hasta 150m²): 180–280 €
- Fotografía inmobiliaria premium + dron: 350–550 €
- Vídeo corporativo (1 día rodaje + edición): 800–2.500 €
- Vídeo dron: 350–800 €/sesión
- Tour Virtual Matterport (hasta 200m²): 250–450 €
- Tour Matterport grandes espacios (>500m²): 600–1.500 €
- Eventos (cobertura 4h): 400–800 € — día completo: 800–1.800 €
- Renders 3D: 150–400 € por render fotorrealista
- Streaming profesional: 600–1.800 €/evento

Factores de incremento: urgencia (<48h: +20–30%), desplazamiento >50km, post-producción avanzada, exclusividad de derechos, fines de semana.

Devuelve SIEMPRE JSON válido con esta estructura exacta:
{
  "min": number,
  "max": number,
  "summary": "string (1-2 frases describiendo el servicio recomendado)",
  "includes": ["string", "string", ...] (3-5 elementos),
  "notes": "string (1 frase con factores que pueden hacer variar)",
  "whatsappMessage": "string (mensaje listo para enviar por WhatsApp solicitando confirmación de presupuesto, en primera persona)"
}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body: QuoteRequest = await req.json();

    if (!body.service || !body.scope || !body.location || !body.urgency) {
      return new Response(JSON.stringify({ error: "Faltan campos obligatorios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY no configurada");

    const userPrompt = `Cliente solicita presupuesto:
- Servicio: ${body.service}
- Alcance/Tamaño: ${body.scope}
- Ubicación: ${body.location}
- Urgencia: ${body.urgency}
${body.details ? `- Detalles adicionales: ${body.details}` : ""}

Genera el presupuesto orientativo en JSON.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Inténtalo en un momento." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "Servicio temporalmente sin créditos. Contacta directamente por WhatsApp." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`AI error: ${response.status} ${txt}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    const quote = JSON.parse(content);

    // Save anonymously for marketing analysis (optional)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    await supabase.from("page_views").insert({
      page_path: `/cotizador/${body.service}`,
      user_agent: req.headers.get("user-agent") || null,
      referrer: `quote:${body.scope}|${body.location}|${body.urgency}`,
    }).catch(() => {});

    return new Response(JSON.stringify(quote), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[generate-quote] Error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
