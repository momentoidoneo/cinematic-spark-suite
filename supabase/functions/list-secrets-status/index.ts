import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Secrets we want to surface in the admin panel. We never leak values,
// only whether each one is currently configured.
const TRACKED_SECRETS = [
  "LOVABLE_API_KEY",
  "RESEND_API_KEY",
  "RUNWAY_API_KEY",
  "RUNWARE_API_KEY",
  "FIRECRAWL_API_KEY",
  "WHATSAPP_API_KEY",
  "MAPS_API_KEY",
  "OPENAI_API_KEY",
] as const;

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Verify the caller is an authenticated admin before disclosing
    // which secrets are present (still only booleans, but no need to
    // expose to anonymous visitors).
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") || "";
    const accessToken = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!accessToken) {
      return jsonResponse({ error: "Auth requerida" }, 401);
    }

    const userClient = createClient(supabaseUrl, serviceKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser(accessToken);
    if (userError || !userData?.user) {
      return jsonResponse({ error: "Auth inválida" }, 401);
    }

    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: roleRow, error: roleError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleRow) {
      return jsonResponse({ error: "Acceso restringido a administradores" }, 403);
    }

    const result = TRACKED_SECRETS.map((name) => {
      const value = Deno.env.get(name);
      return {
        name,
        configured: typeof value === "string" && value.length > 0,
      };
    });

    return jsonResponse({ secrets: result });
  } catch (err) {
    console.error("[list-secrets-status] Error:", err);
    return jsonResponse({ error: "No se pudo leer el estado de los secretos" }, 500);
  }
});
