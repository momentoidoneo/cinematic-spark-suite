import { createClient, type SupabaseClient, type User } from "https://esm.sh/@supabase/supabase-js@2.49.1";

type AdminAuthResult =
  | { supabase: SupabaseClient; user: User }
  | { response: Response };

const jsonResponse = (body: unknown, status: number, corsHeaders: Record<string, string>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

export async function requireAdmin(req: Request, corsHeaders: Record<string, string>): Promise<AdminAuthResult> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { response: jsonResponse({ error: "Authentication required" }, 401, corsHeaders) };
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return { response: jsonResponse({ error: "Authentication required" }, 401, corsHeaders) };
  }

  const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });
  if (roleError || !isAdmin) {
    return { response: jsonResponse({ error: "Admin access required" }, 403, corsHeaders) };
  }

  return { supabase, user };
}
