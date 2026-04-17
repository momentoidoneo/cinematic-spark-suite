import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const nowIso = new Date().toISOString();
    const { data: due, error } = await supabase
      .from("blog_posts")
      .select("id, slug, scheduled_at")
      .eq("status", "scheduled")
      .lte("scheduled_at", nowIso);

    if (error) throw error;

    let published = 0;
    for (const post of due ?? []) {
      const { error: upErr } = await supabase
        .from("blog_posts")
        .update({ status: "published", published_at: nowIso })
        .eq("id", post.id);
      if (!upErr) published += 1;
    }

    return new Response(
      JSON.stringify({ checked: due?.length ?? 0, published }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("publish-scheduled-posts error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
