import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface QuoteRequest {
  service: string;
  scope: string;
  location: string;
  urgency: string;
  details?: string;
  email: string;
  name?: string;
  phone?: string;
}

interface QuoteResult {
  min: number;
  max: number;
  summary: string;
  includes: string[];
  notes: string;
  whatsappMessage: string;
  requestId?: string | null;
  source?: "ai" | "fallback";
}

const MODEL = "google/gemini-2.5-flash";

const SYSTEM_PROMPT = `Eres el asistente de presupuestos de Silvio Costa Photography (silviocosta.net), estudio profesional de fotografía, vídeo, dron, tours virtuales Matterport, eventos y renders 3D con base en Portugal/España.

Tu tarea: dada la información del cliente, generar un presupuesto orientativo en EUR con un rango (mínimo-máximo), explicar qué incluye y qué factores hacen variar el precio. Usa tono profesional, cercano y conciso.

Tarifas de referencia (EUR, sin IVA):
- Fotografía corporativa/producto: 250-600 €/sesión (4h)
- Fotografía inmobiliaria estándar (hasta 150m2): 180-280 €
- Fotografía inmobiliaria premium + dron: 350-550 €
- Vídeo corporativo (1 día rodaje + edición): 800-2.500 €
- Vídeo dron: 350-800 €/sesión
- Tour Virtual Matterport (hasta 200m2): 250-450 €
- Tour Matterport grandes espacios (>500m2): 600-1.500 €
- Eventos (cobertura 4h): 400-800 €; día completo: 800-1.800 €
- Renders 3D: 150-400 € por render fotorrealista
- Streaming profesional: 600-1.800 €/evento

Factores de incremento: urgencia (<48h: +20-30%), desplazamiento >50km, post-producción avanzada, exclusividad de derechos, fines de semana.

Devuelve SIEMPRE JSON válido con esta estructura exacta:
{
  "min": number,
  "max": number,
  "summary": "string (1-2 frases describiendo el servicio recomendado)",
  "includes": ["string", "string", "string"],
  "notes": "string (1 frase con factores que pueden hacer variar)",
  "whatsappMessage": "string (mensaje listo para enviar por WhatsApp solicitando confirmación de presupuesto, en primera persona)"
}`;

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const cleanText = (value: unknown, max = 500) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;

const roundAmount = (value: number) => Math.max(90, Math.round(value / 10) * 10);

const getBaseRange = (service: string): [number, number] => {
  const s = service.toLowerCase();
  if (s.includes("matterport") || s.includes("tour")) return [250, 450];
  if (s.includes("dron")) return [350, 800];
  if (s.includes("vídeo") || s.includes("video")) return [800, 2500];
  if (s.includes("evento")) return [400, 1200];
  if (s.includes("render")) return [180, 500];
  if (s.includes("stream")) return [600, 1800];
  return [250, 650];
};

const scopeMultiplier = (scope: string, service: string) => {
  const s = `${scope} ${service}`.toLowerCase();
  const numbers = [...s.matchAll(/(\d+(?:[.,]\d+)?)/g)]
    .map((m) => Number(m[1].replace(",", ".")))
    .filter((n) => Number.isFinite(n));
  const maxNumber = numbers.length ? Math.max(...numbers) : 0;

  if ((s.includes("m2") || s.includes("m²") || s.includes("metros")) && maxNumber > 500) return 2.2;
  if ((s.includes("m2") || s.includes("m²") || s.includes("metros")) && maxNumber > 250) return 1.55;
  if ((s.includes("hora") || s.includes("h")) && maxNumber >= 8) return 1.75;
  if ((s.includes("render") || s.includes("foto") || s.includes("pieza")) && maxNumber >= 10) return 1.7;
  if (maxNumber >= 5) return 1.25;
  return 1;
};

const urgencyMultiplier = (urgency: string) => {
  const u = urgency.toLowerCase();
  if (u.includes("semana")) return 1.18;
  if (u.includes("mes")) return 1.05;
  return 1;
};

const buildFallbackQuote = (body: QuoteRequest): QuoteResult => {
  const [baseMin, baseMax] = getBaseRange(body.service);
  const multiplier = scopeMultiplier(body.scope, body.service) * urgencyMultiplier(body.urgency);
  const min = roundAmount(baseMin * multiplier);
  const max = Math.max(min + 80, roundAmount(baseMax * multiplier));

  const includes = [
    "Preparación del proyecto y revisión de necesidades",
    "Producción profesional adaptada al alcance indicado",
    "Edición y entrega digital optimizada para uso comercial",
    "Revisión básica incluida antes de la entrega final",
  ];

  return {
    min,
    max,
    summary: `Para ${body.service.toLowerCase()} en ${body.location}, el alcance indicado encaja en una producción personalizada con entrega profesional.`,
    includes,
    notes: "El precio final puede variar por desplazamiento, urgencia, derechos de uso, número de piezas finales o necesidades de postproducción.",
    whatsappMessage: `Hola Silvio, acabo de usar el cotizador IA para ${body.service} en ${body.location}. Me gustaría confirmar disponibilidad y presupuesto para: ${body.scope}.`,
    source: "fallback",
  };
};

const extractJson = (content: string) => {
  try {
    return JSON.parse(content);
  } catch {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(content.slice(start, end + 1));
    }
    throw new Error("La IA no devolvió JSON válido");
  }
};

const normalizeQuote = (value: unknown, fallback: QuoteResult): QuoteResult => {
  const data = value as Partial<QuoteResult>;
  const min = Number(data.min);
  const max = Number(data.max);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return fallback;

  return {
    min: roundAmount(min),
    max: Math.max(roundAmount(min), roundAmount(max)),
    summary: cleanText(data.summary, 500) || fallback.summary,
    includes: Array.isArray(data.includes)
      ? data.includes.map((item) => cleanText(item, 180)).filter(Boolean).slice(0, 5)
      : fallback.includes,
    notes: cleanText(data.notes, 500) || fallback.notes,
    whatsappMessage: cleanText(data.whatsappMessage, 900) || fallback.whatsappMessage,
    source: "ai",
  };
};

const generateWithAI = async (body: QuoteRequest, fallback: QuoteResult): Promise<QuoteResult> => {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return fallback;

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
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const txt = await response.text();
    console.error("[generate-quote] AI fallback:", response.status, txt.slice(0, 300));
    return fallback;
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "{}";
  return normalizeQuote(extractJson(content), fallback);
};

const saveQuoteRequest = async (body: QuoteRequest, quote: QuoteResult) => {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const key = serviceRoleKey || Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !key) return null;

  const supabase = createClient(url, key);
  const payload = {
    name: body.name || null,
    email: body.email.toLowerCase(),
    phone: body.phone || null,
    service: body.service,
    scope: body.scope,
    location: body.location,
    urgency: body.urgency,
    details: body.details || null,
    min_amount: quote.min,
    max_amount: quote.max,
    currency: "EUR",
    summary: quote.summary,
    includes: quote.includes,
    notes: quote.notes,
    whatsapp_message: quote.whatsappMessage,
    request_payload: body,
    response_payload: quote,
    source: "smart_quoter",
    ai_provider: quote.source === "ai" ? "lovable-ai-gateway" : "internal-estimator",
    ai_model: quote.source === "ai" ? MODEL : "pricing-rules-v1",
  };

  const query = supabase.from("quote_requests").insert(payload);
  const { data, error } = serviceRoleKey
    ? await query.select("id").single()
    : await query;

  if (error) {
    console.error("[generate-quote] quote_requests insert error:", error);
    return null;
  }

  try {
    await supabase.from("page_views").insert({
      page_path: `/cotizador/${body.service}`,
      user_agent: "generate-quote-edge-function",
      referrer: `quote:${body.scope}|${body.location}|${body.urgency}`,
    });
  } catch {
    // Analytics is useful, but a lead should never fail because tracking failed.
  }

  return serviceRoleKey ? data?.id ?? null : null;
};

const ADMIN_EMAIL = "silvio@silviocosta.net";
const GMAIL_GATEWAY = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";

const buildRawEmail = (opts: { to: string; subject: string; html: string; replyTo?: string }) => {
  const headers = [
    `To: ${opts.to}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(opts.subject)))}?=`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
  ];
  if (opts.replyTo) headers.push(`Reply-To: ${opts.replyTo}`);
  const message = headers.join("\r\n") + "\r\n\r\n" + opts.html;
  return btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const sendNotificationEmails = async (body: QuoteRequest, quote: QuoteResult, requestId: string | null) => {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const GOOGLE_MAIL_API_KEY = Deno.env.get("GOOGLE_MAIL_API_KEY");
  if (!LOVABLE_API_KEY || !GOOGLE_MAIL_API_KEY) {
    console.log("[generate-quote] Gmail connector not configured, skipping email");
    return;
  }

  const safeName = body.name || "Cliente";
  const safeDetails = (body.details || "—").replace(/</g, "&lt;");
  const rangeText = `${quote.min} – ${quote.max} €`;

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#0F172A;color:#fff;">
      <h2 style="color:#fff;margin:0 0 8px;">Nueva solicitud del Cotizador IA</h2>
      <p style="color:#94A3B8;margin:0 0 20px;">Recibida desde silviocosta.net</p>
      <div style="background:#1E293B;border-radius:8px;padding:16px;margin:0 0 16px;border-left:3px solid #5EEAD4;">
        <p style="margin:0;color:#94A3B8;font-size:13px;">Presupuesto orientativo IA</p>
        <p style="margin:6px 0 0;color:#5EEAD4;font-size:22px;font-weight:700;">${rangeText}</p>
        <p style="margin:8px 0 0;color:#CBD5E1;font-size:14px;">${quote.summary.replace(/</g, "&lt;")}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;background:#1E293B;border-radius:8px;overflow:hidden;">
        <tr><td style="padding:12px;border-bottom:1px solid #334155;color:#94A3B8;width:140px;">Cliente</td><td style="padding:12px;border-bottom:1px solid #334155;">${safeName}</td></tr>
        <tr><td style="padding:12px;border-bottom:1px solid #334155;color:#94A3B8;">Email</td><td style="padding:12px;border-bottom:1px solid #334155;"><a style="color:#5EEAD4;" href="mailto:${body.email}">${body.email}</a></td></tr>
        ${body.phone ? `<tr><td style="padding:12px;border-bottom:1px solid #334155;color:#94A3B8;">Teléfono</td><td style="padding:12px;border-bottom:1px solid #334155;"><a style="color:#5EEAD4;" href="tel:${body.phone}">${body.phone}</a></td></tr>` : ""}
        <tr><td style="padding:12px;border-bottom:1px solid #334155;color:#94A3B8;">Servicio</td><td style="padding:12px;border-bottom:1px solid #334155;">${body.service}</td></tr>
        <tr><td style="padding:12px;border-bottom:1px solid #334155;color:#94A3B8;">Alcance</td><td style="padding:12px;border-bottom:1px solid #334155;white-space:pre-wrap;">${body.scope.replace(/</g, "&lt;")}</td></tr>
        <tr><td style="padding:12px;border-bottom:1px solid #334155;color:#94A3B8;">Ubicación</td><td style="padding:12px;border-bottom:1px solid #334155;">${body.location}</td></tr>
        <tr><td style="padding:12px;border-bottom:1px solid #334155;color:#94A3B8;">Urgencia</td><td style="padding:12px;border-bottom:1px solid #334155;">${body.urgency}</td></tr>
        <tr><td style="padding:12px;color:#94A3B8;vertical-align:top;">Detalles</td><td style="padding:12px;white-space:pre-wrap;">${safeDetails}</td></tr>
      </table>
      ${requestId ? `<p style="margin-top:20px;color:#94A3B8;font-size:13px;">ID de solicitud: <code style="color:#5EEAD4;">${requestId}</code></p>` : ""}
      <p style="margin-top:8px;color:#94A3B8;font-size:13px;">Responde directamente a este email o entra al panel de administración.</p>
    </div>
  `;

  const raw = buildRawEmail({
    to: ADMIN_EMAIL,
    subject: `🤖 Nueva solicitud cotizador IA — ${body.service}`,
    html,
    replyTo: body.email,
  });

  const res = await fetch(`${GMAIL_GATEWAY}/users/me/messages/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GOOGLE_MAIL_API_KEY,
    },
    body: JSON.stringify({ raw }),
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error(`[generate-quote] Gmail send failed [${res.status}]: ${txt.slice(0, 300)}`);
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Método no permitido" }, 405);

  try {
    const raw = await req.json();
    const body: QuoteRequest = {
      service: cleanText(raw.service, 120),
      scope: cleanText(raw.scope, 500),
      location: cleanText(raw.location, 180),
      urgency: cleanText(raw.urgency, 80),
      details: cleanText(raw.details, 1200),
      email: cleanText(raw.email, 254).toLowerCase(),
      name: cleanText(raw.name, 140),
      phone: cleanText(raw.phone, 60),
    };

    if (!body.service || !body.scope || !body.location || !body.urgency) {
      return jsonResponse({ error: "Faltan campos obligatorios del proyecto" }, 400);
    }
    if (!isValidEmail(body.email)) {
      return jsonResponse({ error: "Introduce un email válido para recibir el presupuesto" }, 400);
    }

    const fallback = buildFallbackQuote(body);
    let quote = fallback;
    try {
      quote = await generateWithAI(body, fallback);
    } catch (err) {
      console.error("[generate-quote] AI parse fallback:", err);
    }

    const requestId = await saveQuoteRequest(body, quote);

    // Notificación admin (no bloquea la respuesta al usuario)
    const emailPromise = sendNotificationEmails(body, quote, requestId).catch((err) =>
      console.error("[generate-quote] Notification error:", err),
    );

    // @ts-ignore — EdgeRuntime es global en Supabase Edge Functions
    if (typeof EdgeRuntime !== "undefined" && EdgeRuntime.waitUntil) {
      // @ts-ignore
      EdgeRuntime.waitUntil(emailPromise);
    }

    return jsonResponse({ ...quote, requestId });
  } catch (err) {
    console.error("[generate-quote] Error:", err);
    return jsonResponse({ error: "No se pudo generar el presupuesto. Inténtalo de nuevo o contacta por WhatsApp." }, 500);
  }
});
