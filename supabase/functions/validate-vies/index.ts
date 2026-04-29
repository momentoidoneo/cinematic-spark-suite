import { requireAdmin } from "../_shared/adminAuth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const cleanVat = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, "");

const splitVat = (rawVat: string, fallbackCountry?: string) => {
  const cleaned = cleanVat(rawVat);
  const fallback = cleanVat(fallbackCountry || "").slice(0, 2);
  const countryCode = /^[A-Z]{2}/.test(cleaned) ? cleaned.slice(0, 2) : fallback;
  const vatNumber = /^[A-Z]{2}/.test(cleaned) ? cleaned.slice(2) : cleaned;
  return { countryCode, vatNumber };
};

const xmlValue = (xml: string, tag: string) => {
  const match = xml.match(new RegExp(`<(?:\\w+:)?${tag}>([\\s\\S]*?)</(?:\\w+:)?${tag}>`, "i"));
  return match?.[1]
    ?.replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .trim() || "";
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Método no permitido" }, 405);

  const auth = await requireAdmin(req, corsHeaders);
  if ("response" in auth) return auth.response;

  try {
    const body = await req.json();
    const { countryCode, vatNumber } = splitVat(String(body.vatNumber || ""), String(body.countryCode || ""));

    if (!countryCode || !vatNumber || countryCode.length !== 2) {
      return jsonResponse({ error: "Indica un VAT/NIF intracomunitario con código de país" }, 400);
    }

    const envelope = `<?xml version="1.0" encoding="UTF-8"?>
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
        <soapenv:Header/>
        <soapenv:Body>
          <urn:checkVat>
            <urn:countryCode>${countryCode}</urn:countryCode>
            <urn:vatNumber>${vatNumber}</urn:vatNumber>
          </urn:checkVat>
        </soapenv:Body>
      </soapenv:Envelope>`;

    const response = await fetch("https://ec.europa.eu/taxation_customs/vies/services/checkVatService", {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "",
      },
      body: envelope,
    });

    const xml = await response.text();
    if (!response.ok || xml.includes("<Fault>") || xml.includes(":Fault>")) {
      const fault = xmlValue(xml, "faultstring") || `VIES respondió con estado ${response.status}`;
      return jsonResponse({ error: fault, countryCode, vatNumber }, 502);
    }

    return jsonResponse({
      countryCode: xmlValue(xml, "countryCode") || countryCode,
      vatNumber: xmlValue(xml, "vatNumber") || vatNumber,
      requestDate: xmlValue(xml, "requestDate"),
      valid: xmlValue(xml, "valid").toLowerCase() === "true",
      name: xmlValue(xml, "name"),
      address: xmlValue(xml, "address"),
    });
  } catch (error) {
    console.error("[validate-vies] Error:", error);
    return jsonResponse({ error: "No se pudo validar el VAT en VIES" }, 500);
  }
});
