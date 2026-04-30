import { requireAdmin } from "../_shared/adminAuth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const WEO_BASE = "https://weoinvoice.com/plugins/woocommerce";

type WeoLineItem = {
  pid: string;
  quantity: number;
  item: string;
  provider_name?: string;
  price: string;
  discount: string;
  type: "S" | "P";
  tax: number;
  taxreason: string;
};

type WeoPayload = {
  quote_number?: string;
  client: {
    name: string;
    entity?: string;
    email?: string;
    nif?: string;
    address?: string;
    postcode?: string;
    city?: string;
    country?: string;
  };
  ordercart: WeoLineItem[];
  footer?: string;
  payment_method?: string;
  currency_code?: number;
  exch_rate?: number | string;
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const cleanText = (value: unknown, max = 500) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const hasApiKey = () => !!Deno.env.get("WEOINVOICE_API_KEY");

const storeUrl = () => Deno.env.get("WEOINVOICE_STORE_URL") || "https://silviocosta.net";

const issueEnabled = () => Deno.env.get("WEOINVOICE_ENABLE_ISSUE") === "true";

const defaultTaxReason = () => Deno.env.get("WEOINVOICE_TAX_REASON") || "M07";

const sanitizePayload = (payload: unknown): WeoPayload => {
  const data = payload as Partial<WeoPayload>;
  const client = (data.client || {}) as Partial<WeoPayload["client"]>;
  const ordercart = Array.isArray(data.ordercart) ? data.ordercart as Partial<WeoLineItem>[] : [];

  return {
    quote_number: cleanText(data.quote_number, 80),
    client: {
      name: cleanText(client.name, 180) || "Consumidor Final",
      entity: cleanText(client.entity, 180),
      email: cleanText(client.email, 254),
      nif: cleanText(client.nif, 40).replace(/[^A-Za-z0-9]/g, ""),
      address: cleanText(client.address, 500),
      postcode: cleanText(client.postcode, 40),
      city: cleanText(client.city, 120),
      country: cleanText(client.country, 2).toUpperCase() || "PT",
    },
    ordercart: ordercart
      .map((item) => {
        const tax = Number(item.tax) || 0;
        const rawTaxReason = cleanText(item.taxreason, 40).toUpperCase();
        return {
          pid: cleanText(item.pid, 80) || "service",
          quantity: Number(item.quantity) || 1,
          item: cleanText(item.item, 1000),
          provider_name: cleanText(item.provider_name, 180),
          price: String(item.price || "0"),
          discount: String(item.discount || "0"),
          type: item.type === "P" ? "P" : "S",
          tax,
          taxreason: tax > 0 ? "" : /^M\d{2}$/.test(rawTaxReason) ? rawTaxReason : defaultTaxReason(),
        };
      })
      .filter((item) => item.item && Number(item.price) >= 0),
    footer: cleanText(data.footer, 2000),
    payment_method: cleanText(data.payment_method, 4) || "TB",
    currency_code: Number(data.currency_code) || 0,
    exch_rate: data.exch_rate || "",
  };
};

const verifyKey = async () => {
  const apiKey = Deno.env.get("WEOINVOICE_API_KEY");
  if (!apiKey) return jsonResponse({ configured: false, error: "WEOINVOICE_API_KEY no configurada" }, 400);

  const form = new FormData();
  form.set("store_url", storeUrl());
  form.set("api_key", apiKey);
  form.set("auto_invoicing", "0");
  form.set("taxreason", "M07");

  const response = await fetch(`${WEO_BASE}/save_api_key.php`, {
    method: "POST",
    body: form,
  });
  const text = await response.text();
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { raw: text.slice(0, 500) };
  }

  return jsonResponse({
    configured: true,
    ok: response.ok,
    status: response.status,
    store_url: storeUrl(),
    company: parsed.company ?? null,
    exclusive: parsed.exclusive ?? null,
    message: parsed.error || parsed.message || null,
  }, response.ok ? 200 : 502);
};

const issueInvoice = async (payload: WeoPayload, confirmation: string) => {
  const apiKey = Deno.env.get("WEOINVOICE_API_KEY");
  if (!apiKey) return jsonResponse({ error: "WEOINVOICE_API_KEY no configurada" }, 400);
  if (!issueEnabled()) {
    return jsonResponse({
      error: "Emisión real bloqueada",
      detail: "Configura WEOINVOICE_ENABLE_ISSUE=true solo cuando quieras permitir emisión fiscal desde este puente.",
    }, 403);
  }
  if (confirmation !== "EMITIR_DOCUMENTO_FISCAL") {
    return jsonResponse({ error: "Confirmación explícita requerida" }, 400);
  }
  if (payload.ordercart.length === 0) {
    return jsonResponse({ error: "No hay líneas para emitir" }, 400);
  }

  const orderId = payload.quote_number || crypto.randomUUID();
  const response = await fetch(`${WEO_BASE}/emit_invoice.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      store_url: storeUrl(),
      api_key: apiKey,
      order_id: orderId,
      client: payload.client,
      ordercart: payload.ordercart,
      footer: payload.footer || "",
      payment_method: payload.payment_method || "TB",
      currency_code: payload.currency_code || 0,
      exch_rate: payload.exch_rate || "",
    }),
  });

  const text = await response.text();
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { raw: text.slice(0, 500) };
  }

  return jsonResponse({
    ok: response.ok,
    status: response.status,
    response: parsed,
  }, response.ok ? 200 : 502);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Método no permitido" }, 405);

  const auth = await requireAdmin(req, corsHeaders);
  if ("response" in auth) return auth.response;

  try {
    const body = await req.json();
    const action = cleanText(body.action, 40);

    if (action === "status") {
      return jsonResponse({
        configured: hasApiKey(),
        store_url: storeUrl(),
        issue_enabled: issueEnabled(),
        taxreason: defaultTaxReason(),
      });
    }

    if (action === "verify") {
      return await verifyKey();
    }

    if (action === "prepare") {
      const payload = sanitizePayload(body.payload);
      return jsonResponse({
        configured: hasApiKey(),
        store_url: storeUrl(),
        issue_enabled: issueEnabled(),
        payload,
      });
    }

    if (action === "issue_invoice") {
      return await issueInvoice(sanitizePayload(body.payload), cleanText(body.confirmation, 80));
    }

    return jsonResponse({ error: "Acción no soportada" }, 400);
  } catch (error) {
    console.error("[weoinvoice-bridge] Error:", error);
    return jsonResponse({ error: "No se pudo procesar la integración WeoInvoice" }, 500);
  }
});
