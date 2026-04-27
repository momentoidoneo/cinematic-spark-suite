import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConversionEventRow {
  event_name: string;
  event_type: "cta" | "whatsapp" | "form" | "quote";
  event_label: string | null;
  page_path: string | null;
  created_at: string;
}

const isValidSince = (value: unknown) => {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });

    if (roleError || !isAdmin) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const since = isValidSince(body.since);
    let query = supabase
      .from("conversion_events")
      .select("event_name,event_type,event_label,page_path,created_at")
      .order("created_at", { ascending: false })
      .limit(5000);

    if (since) query = query.gte("created_at", since);

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data || []) as ConversionEventRow[];
    const byName: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const byPage: Record<string, number> = {};

    rows.forEach((row) => {
      byName[row.event_name] = (byName[row.event_name] || 0) + 1;
      byType[row.event_type] = (byType[row.event_type] || 0) + 1;
      const page = row.page_path || "(desconocida)";
      byPage[page] = (byPage[page] || 0) + 1;
    });

    const topPages = Object.entries(byPage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([page, count]) => ({ page, count }));

    return new Response(JSON.stringify({
      available: true,
      total: rows.length,
      ctaClicks: byName.cta_click || 0,
      whatsappClicks: byType.whatsapp || 0,
      formLeads: byName.generate_lead || 0,
      quoteCompletions: byName.quoter_complete || 0,
      quoteWhatsappClicks: byName.quoter_whatsapp || 0,
      byName,
      topPages,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[conversion-summary] Error:", err);
    return new Response(JSON.stringify({ error: "No se pudieron cargar las conversiones" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

