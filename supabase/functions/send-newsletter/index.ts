// Multi-provider newsletter sender: resend | brevo | mailchimp
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const { campaign_id, test_email } = await req.json();
    if (!campaign_id) throw new Error("campaign_id required");

    const { data: campaign, error: cErr } = await supabase
      .from("newsletter_campaigns").select("*").eq("id", campaign_id).single();
    if (cErr || !campaign) throw new Error("Campaign not found");

    // Fetch recipients
    let recipients: { email: string; name: string | null }[] = [];
    if (test_email) {
      recipients = [{ email: test_email, name: null }];
    } else {
      let q = supabase.from("newsletter_subscribers")
        .select("email,name")
        .eq("status", "subscribed");
      if (campaign.tags_filter && campaign.tags_filter.length > 0) {
        q = q.overlaps("tags", campaign.tags_filter);
      }
      const { data: subs } = await q;
      recipients = subs || [];
    }

    if (recipients.length === 0) {
      return new Response(JSON.stringify({ error: "No recipients" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!test_email) {
      await supabase.from("newsletter_campaigns").update({
        status: "sending", recipients_count: recipients.length,
      }).eq("id", campaign_id);
    }

    const provider = campaign.provider || "resend";
    let sent = 0, failed = 0;
    const errors: string[] = [];

    if (provider === "resend") {
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");
      // Send in batches of 100 via Resend batch endpoint
      for (let i = 0; i < recipients.length; i += 100) {
        const batch = recipients.slice(i, i + 100).map((r) => ({
          from: "Silvio Costa <onboarding@resend.dev>",
          to: [r.email],
          subject: campaign.subject,
          html: campaign.html_content,
        }));
        const resp = await fetch("https://api.resend.com/emails/batch", {
          method: "POST",
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify(batch),
        });
        if (resp.ok) sent += batch.length;
        else { failed += batch.length; errors.push(await resp.text()); }
      }
    } else if (provider === "brevo") {
      const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
      if (!BREVO_API_KEY) throw new Error("BREVO_API_KEY not configured");
      for (const r of recipients) {
        const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: { name: "Silvio Costa", email: "hola@silviocosta.net" },
            to: [{ email: r.email, name: r.name || undefined }],
            subject: campaign.subject,
            htmlContent: campaign.html_content,
          }),
        });
        if (resp.ok) sent++; else { failed++; errors.push(await resp.text()); }
      }
    } else if (provider === "mailchimp") {
      const MAILCHIMP_API_KEY = Deno.env.get("MAILCHIMP_API_KEY");
      const MAILCHIMP_LIST_ID = Deno.env.get("MAILCHIMP_LIST_ID");
      if (!MAILCHIMP_API_KEY) throw new Error("MAILCHIMP_API_KEY not configured");
      if (!MAILCHIMP_LIST_ID) throw new Error("MAILCHIMP_LIST_ID not configured");
      const dc = MAILCHIMP_API_KEY.split("-")[1];
      // Create campaign
      const createResp = await fetch(`https://${dc}.api.mailchimp.com/3.0/campaigns`, {
        method: "POST",
        headers: { Authorization: `Bearer ${MAILCHIMP_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "regular",
          recipients: { list_id: MAILCHIMP_LIST_ID },
          settings: { subject_line: campaign.subject, from_name: "Silvio Costa", reply_to: "hola@silviocosta.net", title: campaign.name },
        }),
      });
      const created = await createResp.json();
      if (!createResp.ok) throw new Error(JSON.stringify(created));
      // Set content
      await fetch(`https://${dc}.api.mailchimp.com/3.0/campaigns/${created.id}/content`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${MAILCHIMP_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ html: campaign.html_content }),
      });
      // Send
      const sendResp = await fetch(`https://${dc}.api.mailchimp.com/3.0/campaigns/${created.id}/actions/send`, {
        method: "POST",
        headers: { Authorization: `Bearer ${MAILCHIMP_API_KEY}` },
      });
      if (sendResp.ok) sent = recipients.length;
      else { failed = recipients.length; errors.push(await sendResp.text()); }
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    if (!test_email) {
      await supabase.from("newsletter_campaigns").update({
        status: failed === 0 ? "sent" : (sent > 0 ? "sent" : "failed"),
        sent_at: new Date().toISOString(),
      }).eq("id", campaign_id);
    }

    return new Response(JSON.stringify({ sent, failed, total: recipients.length, errors: errors.slice(0, 3) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
