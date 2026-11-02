import {asyncAdminOperation} from '../_shared/asyncAdminOperation.ts';
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(asyncAdminOperation("generate-thumbnail", async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const adminAuth = await requireAdmin(req, corsHeaders);
    if ("response" in adminAuth) return adminAuth.response;


    const { prompt, width, height, numberResults } = await req.json();
    if (!prompt) throw new Error("Missing prompt");

    const count = Math.min(numberResults || 1, 4);
    const enhancedPrompt = `Create a professional video thumbnail image (${
      width || 1280
    }x${
      height || 720
    } pixels). ${prompt}. The image should be eye-catching, high contrast, with bold composition suitable for a video thumbnail on social media.`;

    const images = [];

    for (let i = 0; i < count; i++) {
      let data: any;
      try {
        data = await callIndependentChat({
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: enhancedPrompt }],
          modalities: ["image", "text"],
        });
      } catch (error) {
        if (isIndependentStatus(error, 429)) {
          return new Response(
            JSON.stringify({
              error: "Rate limit exceeded, please try again later.",
            }),
            {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }
        if (isIndependentStatus(error, 503)) {
          return new Response(
            JSON.stringify({ error: "OpenClaw temporalmente no disponible." }),
            {
              status: 503,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }
        throw error;
      }

      const imageData = extractImageUrl(data);

      if(imageData){
        const image=await imageUrlToBytes(imageData);
        const path=`thumbnails/${crypto.randomUUID()}.${image.extension}`;
        const {error:uploadError}=await adminAuth.supabase.storage.from('social-media-assets').upload(path,image.bytes,{contentType:image.contentType,upsert:false});
        if(uploadError)throw uploadError;
        images.push({imageURL:adminAuth.supabase.storage.from('social-media-assets').getPublicUrl(path).data.publicUrl,positivePrompt:prompt});
      }
    }

    return new Response(JSON.stringify({ images }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("generate-thumbnail error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}));
