// Generates social-ready images from portfolio pieces using Lovable AI (Nano Banana).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FORMAT_PROMPTS: Record<string, string> = {
  "instagram-square": "1:1 square composition, centered subject, room for caption below.",
  "instagram-story": "9:16 vertical story composition, subject upper-third, space for text bottom.",
  "instagram-reel": "9:16 vertical, eye-catching, cinematic.",
  "facebook-post": "1.91:1 horizontal post composition.",
  "linkedin": "1.91:1 professional horizontal composition.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { image_ids, format = "instagram-square", overlay_text, save_to_bank = true } = await req.json();
    if (!Array.isArray(image_ids) || image_ids.length === 0) throw new Error("image_ids required");

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: images } = await supabase
      .from("portfolio_images")
      .select("id,image_url,title,description,alt_text,subcategory_id")
      .in("id", image_ids);

    if (!images || images.length === 0) throw new Error("No portfolio images found");

    const results: any[] = [];
    const formatHint = FORMAT_PROMPTS[format] || FORMAT_PROMPTS["instagram-square"];

    for (const img of images) {
      try {
        const prompt = `Reimagine this photography portfolio image as a polished social media post. ${formatHint}${overlay_text ? ` Include elegant typography with text: "${overlay_text}".` : ""} Keep brand aesthetic: dark, cinematic, teal and gold accents. High quality, professional.`;

        const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [{
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: img.image_url } },
              ],
            }],
            modalities: ["image", "text"],
          }),
        });
        if (resp.status === 429) throw new Error("Rate limit (429)");
        if (resp.status === 402) throw new Error("Insufficient credits (402)");
        const data = await resp.json();
        const b64Url: string | undefined = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (!b64Url) { results.push({ id: img.id, error: "No image returned" }); continue; }

        // Upload to storage
        const base64 = b64Url.split(",")[1];
        const bin = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        const path = `social-from-portfolio/${format}/${img.id}-${Date.now()}.png`;
        const { error: upErr } = await supabase.storage.from("social-media-assets")
          .upload(path, bin, { contentType: "image/png", upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("social-media-assets").getPublicUrl(path);
        const publicUrl = pub.publicUrl;

        // Save to bank
        if (save_to_bank) {
          await supabase.from("social_content_bank").insert({
            name: `${img.title || "Portfolio"} · ${format}`,
            type: "image",
            image_url: publicUrl,
            category: "portfolio-generated",
            tags: [format, "ai-generated"],
            content: overlay_text || null,
          });
        }

        results.push({ id: img.id, url: publicUrl });
      } catch (e) {
        console.error("Generation failed", img.id, e);
        results.push({ id: img.id, error: (e as Error).message });
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
