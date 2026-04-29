import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { requireAdmin } from "../_shared/adminAuth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const adminAuth = await requireAdmin(req, corsHeaders);
    if ("response" in adminAuth) return adminAuth.response;

    const { platform, contentType, topic, tone, includeHashtags, includeEmojis, campaignContext } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const systemPrompt = `Eres un experto en marketing de redes sociales especializado en fotografía profesional, videografía, drones y tours virtuales 360°. 
Genera contenido optimizado para ${platform} en español.
El negocio es "Silvio Costa Photography" - fotografía y vídeo profesional premium en España y Portugal.
Responde SIEMPRE en formato JSON válido con esta estructura:
{
  "title": "título del post",
  "hook": "gancho inicial para captar atención",
  "caption": "texto completo del caption",
  "hashtags": ["hashtag1", "hashtag2", ...],
  "callToAction": "llamada a la acción",
  "bestTimeToPost": "mejor hora para publicar",
  "contentTips": ["tip1", "tip2", ...],
  "imagePrompt": "detailed English description for generating a professional image for this post. Include style, mood, composition, colors. Photography/videography/drone/architecture aesthetic."
}`;

    const userPrompt = `Genera contenido para ${platform} (tipo: ${contentType}).
Tema: ${topic}
Tono: ${tone}
${includeHashtags ? "Incluye 10-15 hashtags relevantes." : "No incluyas hashtags."}
${includeEmojis ? "Usa emojis para hacer el texto más atractivo." : "No uses emojis."}
${campaignContext ? `Contexto de campaña: ${campaignContext}` : ""}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No valid JSON in AI response");
    const result = JSON.parse(jsonMatch[0]);

    // Generate image if we have imagePrompt and Supabase storage
    if (result.imagePrompt && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const platformSpecs: Record<string, string> = {
          "instagram-post": "1:1", "instagram-story": "9:16", "instagram-reel": "9:16",
          "tiktok-post": "9:16", "tiktok-reel": "9:16",
          "youtube-video": "16:9", "youtube-short": "9:16",
        };
        const spec = platformSpecs[`${platform}-${contentType}`] || "1:1";
        const imagePrompt = `${result.imagePrompt}. Professional social media content for a photography and videography brand. Aspect ratio: ${spec}. Ultra high resolution, modern aesthetic. Platform: ${platform} ${contentType}. DO NOT include any text or watermarks.`;

        const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "google/gemini-3-pro-image-preview", messages: [{ role: "user", content: imagePrompt }], modalities: ["image", "text"] }),
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          if (imageUrl) {
            const base64Match = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
            if (base64Match) {
              const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
              const binaryData = Uint8Array.from(atob(base64Match[2]), (c) => c.charCodeAt(0));
              const fileName = `generated/${Date.now()}-${platform}-${contentType}.${base64Match[1]}`;
              const { error: uploadError } = await supabase.storage.from("social-media-assets").upload(fileName, binaryData, { contentType: `image/${base64Match[1]}`, upsert: true });
              if (!uploadError) {
                const { data: { publicUrl } } = supabase.storage.from("social-media-assets").getPublicUrl(fileName);
                result.generatedImageUrl = `${publicUrl}?t=${Date.now()}`;
              }
            }
          }
        }
      } catch (imgError) {
        console.error("Image generation error:", imgError);
      }
    }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
