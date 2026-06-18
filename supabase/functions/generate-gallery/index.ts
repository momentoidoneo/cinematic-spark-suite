import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  callLovableChat,
  extractImageUrl,
  imageUrlToBytes,
  isLovableStatus,
} from "../_shared/lovableAi.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { subcategory_id, style, context, count } = body as {
      subcategory_id: string;
      style?: string;
      context?: string;
      count?: number;
    };

    if (!subcategory_id) throw new Error("subcategory_id is required");
    const numImages = Math.min(Math.max(count || 4, 1), 20);

    // Get subcategory + category info for better prompts
    const { data: sub } = await supabase
      .from("portfolio_subcategories")
      .select("id, name, portfolio_categories(name)")
      .eq("id", subcategory_id)
      .single();

    if (!sub) throw new Error("Subcategory not found");

    const catName = (sub as any).portfolio_categories?.name || "";
    const subName = sub.name;

    // Get current max order
    const { data: existing } = await supabase
      .from("portfolio_images")
      .select("order")
      .eq("subcategory_id", subcategory_id)
      .order("order", { ascending: false })
      .limit(1);

    let nextOrder = (existing?.[0]?.order ?? -1) + 1;

    const results: { index: number; status: string }[] = [];

    for (let i = 0; i < numImages; i++) {
      try {
        // Build a varied prompt for each image
        const variation = i + 1;
        let prompt =
          `Generate a professional high-quality photograph for a ${catName} / ${subName} portfolio gallery. Variation ${variation} of ${numImages} — each image should be distinct.`;
        if (context?.trim()) prompt += ` Context: ${context.trim()}.`;
        if (style?.trim()) prompt += ` Style: ${style.trim()}.`;
        prompt += ` Wide 16:9 aspect ratio, photorealistic.`;

        console.log(
          `Generating gallery image ${variation}/${numImages} for ${subName}`,
        );

        const aiData = await callLovableChat(LOVABLE_API_KEY, {
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: prompt }],
          modalities: ["image", "text"],
        });
        const imageUrl = extractImageUrl(aiData);

        if (!imageUrl) {
          results.push({ index: i, status: "no image returned" });
          continue;
        }

        // Decode and upload
        const image = await imageUrlToBytes(imageUrl);

        const filePath =
          `${subcategory_id}/ai-${Date.now()}-${variation}.${image.extension}`;
        const { error: uploadErr } = await supabase.storage
          .from("portfolio")
          .upload(filePath, image.bytes, {
            contentType: image.contentType,
            upsert: true,
          });

        if (uploadErr) {
          results.push({
            index: i,
            status: `upload error: ${uploadErr.message}`,
          });
          continue;
        }

        const { data: urlData } = supabase.storage.from("portfolio")
          .getPublicUrl(filePath);
        const publicUrl = urlData.publicUrl + `?t=${Date.now()}`;

        // Insert into portfolio_images
        await supabase.from("portfolio_images").insert({
          subcategory_id,
          image_url: publicUrl,
          title: `${subName} - AI ${variation}`,
          alt_text: `${catName} ${subName} portfolio image ${variation}`,
          order: nextOrder++,
          media_type: "image",
          is_featured: false,
        });

        results.push({ index: i, status: "ok" });
        console.log(`✓ Gallery image ${variation}/${numImages}`);

        // Rate limit pause between generations
        if (i < numImages - 1) await new Promise((r) => setTimeout(r, 2000));
      } catch (e) {
        if (isLovableStatus(e, 429)) {
          await new Promise((r) => setTimeout(r, 5000));
        }
        results.push({ index: i, status: `error: ${(e as Error).message}` });
      }
    }

    const generated = results.filter((r) => r.status === "ok").length;
    return new Response(
      JSON.stringify({
        message: `Generadas ${generated}/${numImages} imágenes`,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("generate-gallery error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
