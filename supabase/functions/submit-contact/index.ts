import { createClient } from "jsr:@supabase/supabase-js@2";
import { deliverLeadNotice } from "../_shared/ownerNotifications.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
  website?: string; // honeypot
}

const RATE_LIMIT_PER_HOUR = 3;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if(req.method !== 'POST') return new Response(null,{status:405,headers:corsHeaders});
  try {
    const body: ContactPayload = await req.json();

    // Honeypot — campo oculto que sólo bots rellenan
    if (body.website && body.website.length > 0) {
      console.log("[submit-contact] Honeypot triggered, silently ignoring");
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validación básica
    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const message = (body.message || "").trim();
    const phone = (body.phone || "").trim() || null;

    if (!name || name.length > 100 || !email || !email.includes("@") || email.length > 255 || !message || message.length > 2000) {
      return new Response(JSON.stringify({ error: "Datos inválidos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Rate limit por email (3 por hora) — alternativa simple sin tabla extra
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentCount } = await supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", oneHourAgo);

    if ((recentCount ?? 0) >= RATE_LIMIT_PER_HOUR) {
      return new Response(
        JSON.stringify({ error: "Has enviado varios mensajes recientemente. Inténtalo más tarde." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Insertar mensaje
    const { data: inserted, error: insertError } = await supabase
      .from("contact_messages")
      .insert({ name, email, phone, message })
      .select()
      .single();

    if (insertError) throw insertError;

    // The DB trigger creates the durable pending notice atomically with the lead.
    const emailPromise = deliverLeadNotice('contact', inserted.id)
      .catch(() => console.error('[submit-contact] notification_pending_check_admin'));

    // @ts-ignore — EdgeRuntime es global en Supabase Edge Functions
    if (typeof EdgeRuntime !== "undefined" && EdgeRuntime.waitUntil) {
      // @ts-ignore
      EdgeRuntime.waitUntil(emailPromise);
    } else {
      await emailPromise;
    }

    return new Response(JSON.stringify({ success: true, id: inserted.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[submit-contact] Error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
