import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const { action } = body;
    if (action === "smart_search") return await handleSmartSearch(body);
    if (action === "scrape") return await handleProfileGather(body);
    if (action === "analyze_profile") return await handleAnalyzeProfile(body);
    if (action === "generate_dm") return await handleGenerateDM(body);
    return jsonResponse({ error: "Acción no válida" }, 400);
  } catch (error: any) {
    console.error("[Prospect] Error:", error);
    return jsonResponse({ error: error.message }, 500);
  }
});

async function handleSmartSearch(body: any) {
  const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
  if (!FIRECRAWL_API_KEY) return jsonResponse({ error: "Firecrawl no está configurado. Conecta Firecrawl en Settings → Connectors." }, 400);
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return jsonResponse({ error: "LOVABLE_API_KEY no configurada." }, 400);

  const { searchQuery, interests, location, followerRange } = body;
  const followerLabels: Record<string, string> = { nano: "1K-10K seguidores", micro: "10K-50K seguidores", mid: "50K-200K seguidores", macro: "200K-1M seguidores", mega: "más de 1M seguidores" };
  const followerLabel = followerRange && followerRange !== "any" ? followerLabels[followerRange] : "";

  const queries: string[] = [];
  const q1 = ["influencers instagram", interests, location, followerLabel, searchQuery].filter(Boolean).join(" ");
  queries.push(q1);
  queries.push(["mejores influencers instagram", interests ? `de ${interests}` : "", location].filter(Boolean).join(" "));
  queries.push(["instagram @", interests, location, "seguidores perfil"].filter(Boolean).join(" "));
  if (interests && location) queries.push(`ranking influencers ${interests} ${location} 2025 2026 instagram`);

  const allItems: any[] = [];
  await Promise.all(queries.map(async (q) => {
    try {
      const res = await fetch("https://api.firecrawl.dev/v1/search", { method: "POST", headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ query: q, limit: 25 }) });
      if (res.ok) { const data = await res.json(); allItems.push(...(data.data || data.results || [])); }
    } catch {}
  }));

  const combinedContent = allItems.map((item: any) => `URL: ${item.url || ""}\nTitle: ${item.title || ""}\nDesc: ${item.description || ""}`).join("\n---\n").slice(0, 20000);
  const excludeUsernames = (body.excludeUsernames || []).map((u: string) => u.toLowerCase().replace("@", ""));

  const aiPrompt = `Extrae perfiles de Instagram de estos resultados de búsqueda.
CRITERIOS: Nicho: ${interests || "cualquiera"}, Ubicación: ${location || "cualquiera"}, Seguidores: ${followerLabel || "cualquiera"}, Búsqueda: ${searchQuery || "ninguna"}
${excludeUsernames.length ? `EXCLUYE: ${excludeUsernames.join(", ")}` : ""}

RESULTADOS:
${combinedContent}

Devuelve JSON array: [{"username":"sin_arroba","followers_estimate":"~50K","niche":"fotografía","location":"Madrid","match_reason":"razón"}]
Máximo 30 perfiles. Solo JSON.`;

  try {
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST", headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages: [{ role: "system", content: "Extractor de perfiles de Instagram. Solo JSON." }, { role: "user", content: aiPrompt }], temperature: 0.3 }),
    });
    if (aiRes.ok) {
      const aiData = await aiRes.json();
      const raw = (aiData.choices?.[0]?.message?.content || "[]").replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const profiles = JSON.parse(raw);
      const results = profiles.map((p: any) => ({ username: (p.username || "").replace("@", ""), description: `${p.followers_estimate || "?"} • ${p.location || ""} • ${p.niche || ""} • ${p.match_reason || ""}`, url: `https://www.instagram.com/${(p.username || "").replace("@", "")}/` }));
      return jsonResponse({ results });
    }
  } catch {}
  return jsonResponse({ results: [], error: "No se pudieron extraer perfiles." });
}

async function handleProfileGather(body: any) {
  const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
  if (!FIRECRAWL_API_KEY) return jsonResponse({ error: "Firecrawl no está configurado." }, 400);
  const cleanUsername = body.username.replace("@", "").trim();
  const searchQuery = `"${cleanUsername}" instagram seguidores influencer perfil`;
  const res = await fetch("https://api.firecrawl.dev/v1/search", { method: "POST", headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ query: searchQuery, limit: 8 }) });
  const data = await res.json();
  if (!res.ok) return jsonResponse({ error: `Error: ${data.error || "Unknown"}` }, 400);
  const items = data.data || data.results || [];
  const combinedContent = items.map((item: any) => `${item.title || ""}\n${item.description || ""}`).join("\n\n");
  return jsonResponse({ username: cleanUsername, profileUrl: `https://www.instagram.com/${cleanUsername}/`, content: combinedContent, title: items[0]?.title || cleanUsername, description: items[0]?.description || "" });
}

async function handleAnalyzeProfile(body: any) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
  const { profileData } = body;

  const systemPrompt = `Analista de marketing de Instagram para "Silvio Costa Photography" (fotografía, vídeo, drones, tours virtuales 360° en España y Portugal).
Analiza el perfil y devuelve JSON:
{"followers_estimate":"~15K","engagement_quality":"alto|medio|bajo","brand_affinity":0-100,"interests":["lista"],"location_detected":"Ciudad o No detectada","account_quality":"evaluación breve","summary":"1-2 frases sobre potencial como colaborador"}
Solo JSON.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST", headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: `Perfil: @${profileData.username}\nTítulo: ${profileData.title}\nDescripción: ${profileData.description}\n\nContenido:\n${profileData.content?.slice(0, 4000)}` }] }),
  });
  if (!response.ok) {
    if (response.status === 429) return jsonResponse({ error: "Rate limit" }, 429);
    if (response.status === 402) return jsonResponse({ error: "Créditos agotados" }, 402);
    throw new Error("Error analizando perfil");
  }
  const aiData = await response.json();
  const raw = (aiData.choices?.[0]?.message?.content || "{}").replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  let analysis;
  try { analysis = JSON.parse(raw); } catch { analysis = { followers_estimate: "?", engagement_quality: "medio", brand_affinity: 50, interests: [], location_detected: "No detectada", account_quality: raw.slice(0, 200), summary: "No se pudo analizar" }; }
  return jsonResponse({ analysis });
}

async function handleGenerateDM(body: any) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
  const { profileData, profileAnalysis, brandContext, messageStyle } = body;

  const analysisCtx = profileAnalysis ? `\nAnálisis: ${profileAnalysis.followers_estimate} seguidores, Engagement: ${profileAnalysis.engagement_quality}, Afinidad: ${profileAnalysis.brand_affinity}%, Intereses: ${profileAnalysis.interests?.join(", ")}, Ubicación: ${profileAnalysis.location_detected}` : "";

  const systemPrompt = `Experta en outreach de Instagram para "Silvio Costa Photography" — estudio profesional de fotografía, vídeo, dron y tours virtuales 360° con Matterport en España y Portugal.

SERVICIOS: Fotografía inmobiliaria/arquitectura/producto/eventos, vídeo corporativo/aéreo con dron, tours virtuales 360° Matterport, streaming profesional.

REGLAS: Máx 200 palabras, menciona algo específico del perfil, presenta servicios relevantes, tono: ${messageStyle || "cercano y profesional"}.
${brandContext ? `Contexto: ${brandContext}` : ""}

Genera 3 versiones del DM:
1. Colaboración / Partnership
2. Embajador de marca
3. Casual / Amigable

Para cada versión incluye **Enfoque** y **Mensaje completo**.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST", headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: `Perfil: @${profileData.username}\nTítulo: ${profileData.title}\nDescripción: ${profileData.description}${analysisCtx}\n\nContenido:\n${profileData.content?.slice(0, 2000)}` }] }),
  });
  if (!response.ok) {
    if (response.status === 429) return jsonResponse({ error: "Rate limit" }, 429);
    if (response.status === 402) return jsonResponse({ error: "Créditos agotados" }, 402);
    throw new Error("Error generando DM");
  }
  const aiData = await response.json();
  return jsonResponse({ dms: aiData.choices?.[0]?.message?.content || "" });
}
