import { createClient } from "jsr:@supabase/supabase-js@2";

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

    // Enviar emails vía Resend (notificación admin + autorrespuesta cliente)
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      const adminEmail = "silvio@silviocosta.net";
      const fromAddress = "Silvio Costa <onboarding@resend.dev>";

      // Notificación al admin
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [adminEmail],
          reply_to: email,
          subject: `📩 Nuevo mensaje de ${name}`,
          html: `
            <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0F172A;color:#fff;">
              <h2 style="color:#fff;margin:0 0 12px;">Nuevo mensaje de contacto</h2>
              <p style="color:#94A3B8;margin:0 0 24px;">Recibido desde silviocosta.net</p>
              <table style="width:100%;border-collapse:collapse;background:#1E293B;border-radius:8px;overflow:hidden;">
                <tr><td style="padding:12px;border-bottom:1px solid #334155;color:#94A3B8;width:120px;">Nombre</td><td style="padding:12px;border-bottom:1px solid #334155;">${name}</td></tr>
                <tr><td style="padding:12px;border-bottom:1px solid #334155;color:#94A3B8;">Email</td><td style="padding:12px;border-bottom:1px solid #334155;"><a style="color:#5EEAD4;" href="mailto:${email}">${email}</a></td></tr>
                ${phone ? `<tr><td style="padding:12px;border-bottom:1px solid #334155;color:#94A3B8;">Teléfono</td><td style="padding:12px;border-bottom:1px solid #334155;"><a style="color:#5EEAD4;" href="tel:${phone}">${phone}</a></td></tr>` : ""}
                <tr><td style="padding:12px;color:#94A3B8;vertical-align:top;">Mensaje</td><td style="padding:12px;white-space:pre-wrap;">${message.replace(/</g, "&lt;")}</td></tr>
              </table>
              <p style="margin-top:24px;color:#94A3B8;font-size:13px;">Responde directamente a este email o entra al panel de administración.</p>
            </div>
          `,
        }),
      }).catch((err) => console.error("[submit-contact] Admin email error:", err));

      // Autorrespuesta al cliente
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [email],
          reply_to: adminEmail,
          subject: "Hemos recibido tu mensaje — Silvio Costa Photography",
          html: `
            <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0F172A;color:#fff;">
              <h2 style="color:#5EEAD4;margin:0 0 12px;">¡Gracias por contactarnos, ${name}!</h2>
              <p style="color:#CBD5E1;line-height:1.6;">Hemos recibido tu mensaje y te responderemos en menos de 24 horas con una propuesta personalizada.</p>
              <div style="background:#1E293B;border-radius:8px;padding:16px;margin:24px 0;border-left:3px solid #5EEAD4;">
                <p style="margin:0;color:#94A3B8;font-size:13px;">Tu mensaje:</p>
                <p style="margin:8px 0 0;color:#fff;white-space:pre-wrap;">${message.replace(/</g, "&lt;")}</p>
              </div>
              <p style="color:#CBD5E1;line-height:1.6;">Si prefieres una respuesta inmediata, escríbenos por WhatsApp.</p>
              <p style="margin-top:32px;color:#94A3B8;font-size:13px;">— Silvio Costa Photography<br/>silviocosta.net</p>
            </div>
          `,
        }),
      }).catch((err) => console.error("[submit-contact] Client email error:", err));
    } else {
      console.log("[submit-contact] RESEND_API_KEY not set, skipping emails");
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
