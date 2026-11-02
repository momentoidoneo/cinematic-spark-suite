import {asyncAdminOperation} from '../_shared/asyncAdminOperation.ts';
// Generates social-ready images from portfolio pieces using OpenClaw and owner OpenAI OAuth.
import { requireAdmin } from "../_shared/adminAuth.ts";
import {
  callIndependentChat,
  extractImageUrl,
  imageUrlToBytes,
  isIndependentStatus,
} from "../_shared/independentAi.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const FORMAT_PROMPTS: Record<string, string> = {
  "instagram-square":
    "1:1 square composition, centered subject, room for caption below.",
  "instagram-story":
    "9:16 vertical story composition, subject upper-third, space for text bottom.",
  "instagram-reel": "9:16 vertical, eye-catching, cinematic.",
  "facebook-post": "1.91:1 horizontal post composition.",
  "linkedin": "1.91:1 professional horizontal composition.",
};

Deno.serve(asyncAdminOperation("generate-social-from-portfolio", async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const adminAuth = await requireAdmin(req, corsHeaders);
    if ("response" in adminAuth) return adminAuth.response;


    const {
      image_ids,
      format = "instagram-square",
      overlay_text,
      save_to_bank = true,
    } = await req.json();
    if (!Array.isArray(image_ids) || image_ids.length === 0) {
      throw new Error("image_ids required");
    }

    const { supabase } = adminAuth;
    const { data: images } = await supabase
      .from("portfolio_images")
      .select("id,image_url,title,description,alt_text,subcategory_id")
      .in("id", image_ids);

    if (!images || images.length === 0) {
      throw new Error("No portfolio images found");
    }

    const results: any[] = [];
    const formatHint = FORMAT_PROMPTS[format] ||
      FORMAT_PROMPTS["instagram-square"];

    for (const img of images) {
      try {
        const prompt =
          `Reimagine this photography portfolio image as a polished social media post. ${formatHint}${
            overlay_text
              ? ` Include elegant typography with text: "${overlay_text}".`
              : ""
          } Keep brand aesthetic: dark, cinematic, teal and gold accents. High quality, professional.`;

        const data = await callIndependentChat({
          model: "google/gemini-2.5-flash-image",
          messages: [{
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: img.image_url } },
            ],
          }],
          modalities: ["image", "text"],
        });
        const imageUrl = extractImageUrl(data);
        if (!imageUrl) {
          results.push({ id: img.id, error: "No image returned" });
          continue;
        }

        // Upload to storage
        const image = await imageUrlToBytes(imageUrl);
        const path =
          `social-from-portfolio/${format}/${img.id}-${Date.now()}.${image.extension}`;
        const { error: upErr } = await supabase.storage.from(
          "social-media-assets",
        )
          .upload(path, image.bytes, {
            contentType: image.contentType,
            upsert: false,
          });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("social-media-assets")
          .getPublicUrl(path);
        const publicUrl = pub.publicUrl;

        // Save to bank
        if (save_to_bank) {
          const {error:saveError}=await supabase.from("social_content_bank").insert({
            name: `${img.title || "Portfolio"} · ${format}`,
            type: "image",
            image_url: publicUrl,
            category: "portfolio-generated",
            tags: [format, "ai-generated"],
            content: overlay_text || null,
          });
          if(saveError)throw new Error("No se pudo guardar la imagen en el banco");
        }

        results.push({ id: img.id, url: publicUrl });
      } catch (e) {
        console.error("Generation failed", img.id, e);
        const message = isIndependentStatus(e, 429)
          ? "Rate limit (429)"
          : isIndependentStatus(e, 503)
          ? "OpenClaw temporalmente no disponible"
          : (e as Error).message;
        results.push({ id: img.id, error: message });
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}));
