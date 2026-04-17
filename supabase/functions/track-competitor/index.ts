// Firecrawl-powered competitor tracker: scrapes URL, stores snapshot, detects changes.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha256(input: string) {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY not configured");

    const { competitor_id, mode = "manual" } = await req.json();
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Resolve targets
    let targets: any[] = [];
    if (competitor_id) {
      const { data } = await supabase.from("competitors").select("*").eq("id", competitor_id).single();
      if (data) targets = [data];
    } else {
      const { data } = await supabase.from("competitors").select("*").eq("is_active", true).eq("monitoring_mode", "weekly");
      targets = data || [];
    }

    const results: any[] = [];

    for (const comp of targets) {
      try {
        const fc = await fetch("https://api.firecrawl.dev/v2/scrape", {
          method: "POST",
          headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ url: comp.url, formats: ["markdown"], onlyMainContent: true }),
        });
        const fcData = await fc.json();
        if (!fc.ok) throw new Error(fcData.error || "Firecrawl failed");

        const markdown: string = fcData.data?.markdown || fcData.markdown || "";
        const metadata = fcData.data?.metadata || fcData.metadata || {};
        const hash = await sha256(markdown);

        // Compare with last snapshot
        const { data: lastSnap } = await supabase
          .from("competitor_snapshots")
          .select("content_hash, markdown")
          .eq("competitor_id", comp.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const hasChanges = !!lastSnap && lastSnap.content_hash !== hash;

        // AI summary if changes
        let changesSummary: string | null = null;
        if (hasChanges && LOVABLE_API_KEY && lastSnap?.markdown) {
          try {
            const ai = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                messages: [
                  { role: "system", content: "Eres un analista. Compara dos versiones de una página web y resume los cambios clave en español en 3-5 viñetas cortas y accionables." },
                  { role: "user", content: `ANTERIOR:\n${lastSnap.markdown.slice(0, 8000)}\n\nACTUAL:\n${markdown.slice(0, 8000)}` },
                ],
              }),
            });
            const aiJson = await ai.json();
            changesSummary = aiJson.choices?.[0]?.message?.content || null;
          } catch (e) {
            console.error("AI summary failed", e);
          }
        }

        await supabase.from("competitor_snapshots").insert({
          competitor_id: comp.id,
          content_hash: hash,
          markdown: markdown.slice(0, 100000),
          title: metadata.title || null,
          meta_description: metadata.description || null,
          links_count: (fcData.data?.links || fcData.links || []).length || null,
          has_changes: hasChanges,
          changes_summary: changesSummary,
        });

        await supabase.from("competitors").update({
          last_checked_at: new Date().toISOString(),
          ...(hasChanges ? { last_change_detected_at: new Date().toISOString() } : {}),
        }).eq("id", comp.id);

        results.push({ id: comp.id, name: comp.name, hasChanges, changesSummary });
      } catch (e) {
        console.error("Competitor error", comp.id, e);
        results.push({ id: comp.id, error: (e as Error).message });
      }
    }

    return new Response(JSON.stringify({ results, mode }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
