import { createClient } from "jsr:@supabase/supabase-js@2";

declare const EdgeRuntime: { waitUntil?: (promise: Promise<unknown>) => void } | undefined;

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
  pricingSource?: "admin-pricing" | "default-rules";
  pricingReferences?: PricingReference[];
}

interface PricingReference {
  name: string;
  category: string | null;
  description: string | null;
  price: number;
  priceSuffix: string | null;
  source: "plan" | "service" | "default";
}

interface PricingPlanRow {
  name: string;
  description: string | null;
  price: number | string | null;
  price_suffix: string | null;
  features: string[] | null;
}

interface PricingServiceRow {
  name: string;
  description: string | null;
  price: number | string | null;
  price_suffix: string | null;
  category: string | null;
}

const MODEL = "google/gemini-2.5-flash";

const DEFAULT_PRICING_REFERENCES: PricingReference[] = [
  { name: "Fotografía inmobiliaria estándar", category: "Fotografía", description: "Sesión para vivienda estándar.", price: 180, priceSuffix: "/inmueble", source: "default" },
  { name: "Fotografía inmobiliaria premium", category: "Fotografía", description: "Cobertura ampliada para inmuebles de alto valor.", price: 280, priceSuffix: "/inmueble", source: "default" },
  { name: "Fotografía de arquitectura e interiorismo", category: "Fotografía", description: "Reportaje para arquitectura, interiorismo y espacios comerciales.", price: 350, priceSuffix: "/sesión", source: "default" },
  { name: "Vídeo inmobiliario", category: "Vídeo y dron", description: "Pieza audiovisual para venta o alquiler.", price: 450, priceSuffix: "/inmueble", source: "default" },
  { name: "Vídeo corporativo", category: "Vídeo y dron", description: "Vídeo para presentar empresa, equipo, instalaciones o servicio.", price: 800, priceSuffix: "/proyecto", source: "default" },
  { name: "Grabación aérea con dron", category: "Vídeo y dron", description: "Tomas aéreas profesionales en 4K.", price: 350, priceSuffix: "/sesión", source: "default" },
  { name: "Tour virtual Matterport hasta 200 m²", category: "Tours virtuales y 360", description: "Escaneo Matterport para espacio pequeño.", price: 250, priceSuffix: "/espacio", source: "default" },
  { name: "Tour virtual Matterport 200-500 m²", category: "Tours virtuales y 360", description: "Recorrido virtual para espacios medianos.", price: 450, priceSuffix: "/espacio", source: "default" },
  { name: "Render 3D fotorrealista", category: "Renders y 3D", description: "Imagen 3D para arquitectura, interiorismo o producto.", price: 180, priceSuffix: "/imagen", source: "default" },
  { name: "Streaming profesional básico", category: "Streaming y eventos", description: "Retransmisión sencilla para eventos.", price: 600, priceSuffix: "/evento", source: "default" },
  { name: "Fotografía de eventos 4 horas", category: "Fotografía", description: "Cobertura fotográfica de evento corto.", price: 400, priceSuffix: "/evento", source: "default" },
  { name: "Fotografía de eventos día completo", category: "Fotografía", description: "Cobertura fotográfica extendida.", price: 800, priceSuffix: "/evento", source: "default" },
];

const buildSystemPrompt = (pricingReferences: PricingReference[]) => {
  const pricingContext = pricingReferences.length > 0
    ? pricingReferences
        .slice(0, 12)
        .map((item) => {
          const suffix = item.priceSuffix ? ` ${item.priceSuffix}` : "";
          const category = item.category ? ` (${item.category})` : "";
          return `- ${item.name}${category}: desde ${item.price} €${suffix}${item.description ? ` — ${item.description}` : ""}`;
        })
        .join("\n")
    : DEFAULT_PRICING_REFERENCES.slice(0, 10)
        .map((item) => `- ${item.name}: desde ${item.price} €${item.priceSuffix ? ` ${item.priceSuffix}` : ""}`)
        .join("\n");

  return `Eres el asistente de presupuestos de Silvio Costa Photography (silviocosta.net), estudio profesional de fotografía, vídeo, dron, tours virtuales Matterport, eventos y renders 3D con base en Portugal/España.

Tu tarea: dada la información del cliente, generar un presupuesto orientativo en EUR con un rango (mínimo-máximo), explicar qué incluye y qué factores hacen variar el precio. Usa tono profesional, cercano y conciso.

Tarifas de referencia visibles en el panel de administración (EUR, sin IVA):
${pricingContext}

Factores de incremento: urgencia (<48h: +20-30%), desplazamiento >50km, post-producción avanzada, exclusividad de derechos, fines de semana.
Usa las tarifas visibles del panel como base principal cuando encajen con el servicio solicitado. Ajusta por alcance, superficie, número de piezas, duración, ubicación y urgencia. No presentes el importe como cerrado: siempre es orientativo hasta revisar briefing.

Devuelve SIEMPRE JSON válido con esta estructura exacta:
{
  "min": number,
  "max": number,
  "summary": "string (1-2 frases describiendo el servicio recomendado)",
  "includes": ["string", "string", "string"],
  "notes": "string (1 frase con factores que pueden hacer variar)",
  "whatsappMessage": "string (mensaje listo para enviar por WhatsApp solicitando confirmación de presupuesto, en primera persona)"
}`;
};

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

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const serviceSignals = (body: QuoteRequest) => {
  const text = normalize(`${body.service} ${body.scope} ${body.details || ""}`);
  if (text.includes("matterport") || text.includes("tour") || text.includes("360")) {
    return ["matterport", "tour", "360", "plano", "street view", "espacio"];
  }
  if (text.includes("stream") || text.includes("directo")) {
    return ["streaming", "multicamara", "evento", "conferencia"];
  }
  if (text.includes("render") || text.includes("3d")) {
    return ["render", "3d", "visualizacion", "modelo"];
  }
  if (text.includes("dron") || text.includes("aereo") || text.includes("aerea")) {
    return ["dron", "aereo", "fotogrametria", "video"];
  }
  if (text.includes("video") || text.includes("reel") || text.includes("spot")) {
    return ["video", "reel", "spot", "corporativo", "inmobiliario"];
  }
  if (text.includes("evento") || text.includes("boda") || text.includes("congreso") || text.includes("feria")) {
    return ["evento", "boda", "congreso", "feria", "streaming"];
  }
  return ["fotografia", "producto", "gastronomia", "arquitectura", "inmobiliaria", "retrato"];
};

const scorePricingReference = (body: QuoteRequest, item: PricingReference) => {
  const text = normalize(`${item.name} ${item.category || ""} ${item.description || ""}`);
  const input = normalize(`${body.service} ${body.scope} ${body.details || ""}`);
  const signals = serviceSignals(body);
  let score = 0;

  signals.forEach((signal) => {
    if (text.includes(signal)) score += 4;
    if (input.includes(signal) && text.includes(signal)) score += 2;
  });

  normalize(body.service)
    .split(" ")
    .filter((word) => word.length > 3)
    .forEach((word) => {
      if (text.includes(word)) score += 1;
    });

  if (item.source === "plan") score += 0.5;
  return score;
};

const matchPricingReferences = (body: QuoteRequest, catalog: PricingReference[]) => {
  const scored = catalog
    .map((item) => ({ item, score: scorePricingReference(body, item) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.item.price - b.item.price)
    .map(({ item }) => item);

  const unique = new Map<string, PricingReference>();
  scored.forEach((item) => {
    const key = normalize(item.name);
    if (!unique.has(key)) unique.set(key, item);
  });

  return [...unique.values()].slice(0, 8);
};

const loadPricingCatalog = async (): Promise<PricingReference[]> => {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const key = serviceRoleKey || Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !key) return [];

  try {
    const supabase = createClient(url, key);
    const [plansRes, servicesRes] = await Promise.all([
      supabase
        .from("pricing_plans")
        .select("name,description,price,price_suffix,features,is_highlighted,show_from,order")
        .eq("is_visible", true)
        .order("order"),
      supabase
        .from("pricing_services")
        .select("name,description,price,price_suffix,category,show_from,order")
        .eq("is_visible", true)
        .order("order"),
    ]);

    if (plansRes.error) console.error("[generate-quote] pricing_plans read error:", plansRes.error);
    if (servicesRes.error) console.error("[generate-quote] pricing_services read error:", servicesRes.error);

    const planReferences = ((plansRes.data || []) as PricingPlanRow[])
      .map((plan) => {
        const price = Number(plan.price);
        if (!Number.isFinite(price)) return null;
        return {
          name: plan.name,
          category: "Plan",
          description: plan.description || plan.features?.slice(0, 2).join(". ") || null,
          price,
          priceSuffix: plan.price_suffix,
          source: "plan" as const,
        };
      })
      .filter(Boolean) as PricingReference[];

    const serviceReferences = ((servicesRes.data || []) as PricingServiceRow[])
      .map((service) => {
        const price = Number(service.price);
        if (!Number.isFinite(price)) return null;
        return {
          name: service.name,
          category: service.category,
          description: service.description,
          price,
          priceSuffix: service.price_suffix,
          source: "service" as const,
        };
      })
      .filter(Boolean) as PricingReference[];

    return [...planReferences, ...serviceReferences];
  } catch (error) {
    console.error("[generate-quote] pricing catalog unavailable:", error);
    return [];
  }
};

const getBaseRange = (service: string, pricingReferences: PricingReference[] = []): [number, number] => {
  if (pricingReferences.length > 0) {
    const prices = pricingReferences.map((item) => item.price).filter((price) => Number.isFinite(price));
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return [
      min,
      Math.max(min + 90, max * 1.35, min * 1.6),
    ];
  }

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

const buildFallbackQuote = (body: QuoteRequest, pricingReferences: PricingReference[] = []): QuoteResult => {
  const [baseMin, baseMax] = getBaseRange(body.service, pricingReferences);
  const multiplier = scopeMultiplier(body.scope, body.service) * urgencyMultiplier(body.urgency);
  const min = roundAmount(baseMin * multiplier);
  const max = Math.max(min + 80, roundAmount(baseMax * multiplier));
  const referenceNames = pricingReferences.slice(0, 3).map((item) => item.name).join(", ");
  const pricingSource = pricingReferences.some((item) => item.source !== "default")
    ? "admin-pricing"
    : "default-rules";

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
    notes: referenceNames
      ? `Referencia usada del panel: ${referenceNames}. El precio final puede variar por desplazamiento, urgencia, derechos de uso, número de piezas finales o postproducción.`
      : "El precio final puede variar por desplazamiento, urgencia, derechos de uso, número de piezas finales o necesidades de postproducción.",
    whatsappMessage: `Hola Silvio, acabo de usar el cotizador IA para ${body.service} en ${body.location}. Me gustaría confirmar disponibilidad y presupuesto para: ${body.scope}.`,
    source: "fallback",
    pricingSource,
    pricingReferences,
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
    pricingSource: fallback.pricingSource,
    pricingReferences: fallback.pricingReferences,
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
        { role: "system", content: buildSystemPrompt(fallback.pricingReferences || []) },
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
    ai_model: quote.source === "ai"
      ? `${MODEL}${quote.pricingSource === "admin-pricing" ? " + admin-pricing" : ""}`
      : quote.pricingSource === "admin-pricing"
        ? "pricing-table-v2"
        : "pricing-rules-v1",
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

    const pricingCatalog = await loadPricingCatalog();
    const adminPricingReferences = matchPricingReferences(body, pricingCatalog);
    const pricingReferences = adminPricingReferences.length > 0
      ? adminPricingReferences
      : matchPricingReferences(body, DEFAULT_PRICING_REFERENCES);
    const fallback = buildFallbackQuote(body, pricingReferences);
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

    if (typeof EdgeRuntime !== "undefined" && typeof EdgeRuntime.waitUntil === "function") {
      EdgeRuntime.waitUntil(emailPromise);
    }

    return jsonResponse({ ...quote, requestId });
  } catch (err) {
    console.error("[generate-quote] Error:", err);
    return jsonResponse({ error: "No se pudo generar el presupuesto. Inténtalo de nuevo o contacta por WhatsApp." }, 500);
  }
});
