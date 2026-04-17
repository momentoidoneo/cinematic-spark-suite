// Edge function: notifica IndexNow (Bing/Yandex/Seznam) + ping Google sitemap
// POST /functions/v1/indexnow  body: { urls: string[], triggered_by?: string }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_HOST = "silviocosta.net";
const SITE_URL = `https://${SITE_HOST}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { urls, triggered_by } = await req.json().catch(() => ({ urls: [], triggered_by: "manual" }));

    if (!Array.isArray(urls) || urls.length === 0) {
      return new Response(JSON.stringify({ error: "urls array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get IndexNow key from site_settings
    const { data: keyRow } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "indexnow_key")
      .maybeSingle();

    const indexNowKey = keyRow?.value;
    if (!indexNowKey) {
      return new Response(JSON.stringify({ error: "indexnow_key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Normalize URLs to absolute
    const fullUrls = urls.map((u: string) =>
      u.startsWith("http") ? u : `${SITE_URL}${u.startsWith("/") ? "" : "/"}${u}`
    );

    const results: any[] = [];

    // 1) IndexNow (Bing + Yandex)
    const indexNowEndpoints = [
      "https://api.indexnow.org/IndexNow",
      "https://www.bing.com/indexnow",
    ];

    for (const endpoint of indexNowEndpoints) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({
            host: SITE_HOST,
            key: indexNowKey,
            keyLocation: `${SITE_URL}/${indexNowKey}.txt`,
            urlList: fullUrls,
          }),
        });
        const text = await res.text().catch(() => "");
        results.push({ endpoint, status: res.status, body: text.slice(0, 300) });
        // Log each URL
        for (const url of fullUrls) {
          await supabase.from("indexnow_pings").insert({
            url,
            engine: endpoint.includes("bing") ? "bing" : "indexnow",
            status: res.ok ? "ok" : "error",
            http_status: res.status,
            response: text.slice(0, 500),
            triggered_by: triggered_by || "manual",
          });
        }
      } catch (err: any) {
        results.push({ endpoint, error: err.message });
      }
    }

    // 2) Ping Google sitemap (deprecated but still works in many cases)
    try {
      const sitemapUrl = `${SITE_URL}/sitemap.xml`;
      const googlePing = await fetch(
        `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
        { method: "GET" }
      );
      results.push({ engine: "google_ping", status: googlePing.status });
      await supabase.from("indexnow_pings").insert({
        url: sitemapUrl,
        engine: "google_ping",
        status: googlePing.ok ? "ok" : "error",
        http_status: googlePing.status,
        triggered_by: triggered_by || "manual",
      });
    } catch (err: any) {
      results.push({ engine: "google_ping", error: err.message });
    }

    return new Response(JSON.stringify({ ok: true, count: fullUrls.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("indexnow error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
