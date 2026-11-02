import {asyncAdminOperation} from '../_shared/asyncAdminOperation.ts';
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { requireAdmin } from "../_shared/adminAuth.ts";
import {
  callIndependentChat,
  getAssistantText,
  extractImageUrl,
  imageUrlToBytes,
  isIndependentStatus,
  parseJsonFromText,
} from "../_shared/independentAi.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(asyncAdminOperation("generate-social-content", async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const adminAuth = await requireAdmin(req, corsHeaders);
    if ("response" in adminAuth) return adminAuth.response;

    const {
      platform,
      contentType,
      topic,
      tone,
      includeHashtags,
      includeEmojis,
      campaignContext,
    } = await req.json();


    const systemPrompt =
      `Eres un experto en marketing de redes sociales especializado en fotografía profesional, videografía, drones y tours virtuales 360°.
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

    const userPrompt =
      `Genera contenido para ${platform} (tipo: ${contentType}).
Tema: ${topic}
Tono: ${tone}
${
        includeHashtags
          ? "Incluye 10-15 hashtags relevantes."
          : "No incluyas hashtags."
      }
${
        includeEmojis
          ? "Usa emojis para hacer el texto más atractivo."
          : "No uses emojis."
      }
${campaignContext ? `Contexto de campaña: ${campaignContext}` : ""}`;

    let aiData: any;
    try {
      aiData = await callIndependentChat({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, {
          role: "user",
          content: userPrompt,
        }],
        temperature: 0.8,
      });
    } catch (error) {
      if (isIndependentStatus(error, 429)) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (isIndependentStatus(error, 503)) {
        return new Response(JSON.stringify({ error: "OpenClaw temporalmente no disponible" }), {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw error;
    }

    const content = getAssistantText(aiData);
    const result = parseJsonFromText<any>(content, "object");

    if(result.imagePrompt){
      try{
        const imageData=await callIndependentChat({messages:[{role:'user',content:`${result.imagePrompt}. Professional photography brand with base in Madrid. ${platform} ${contentType}. No watermarks.`}],modalities:['image','text']});
        const url=extractImageUrl(imageData);if(!url)throw new Error('No image');
        const image=await imageUrlToBytes(url);
        const path=`generated/${crypto.randomUUID()}.${image.extension}`;
        const {error:uploadError}=await adminAuth.supabase.storage.from('social-media-assets').upload(path,image.bytes,{contentType:image.contentType,upsert:false});
        if(uploadError)throw uploadError;
        result.generatedImageUrl=adminAuth.supabase.storage.from('social-media-assets').getPublicUrl(path).data.publicUrl;
        result.imageGenerationStatus='complete';
      }catch{
        result.imageGenerationStatus='failed';
        result.imageGenerationNotice='Texto generado con OpenClaw. La imagen no se ha podido completar; revisa el estado antes de volver a generarla.';
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}));
