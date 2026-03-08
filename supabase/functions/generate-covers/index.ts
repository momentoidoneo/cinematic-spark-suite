import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const defaultPrompts: Record<string, string> = {
  "Real Estate": "Professional real estate photography of a modern luxury villa interior, bright natural light, wide angle, HDR style, warm tones",
  "Eventos": "Professional event photography, elegant gala dinner with ambient lighting, candid moments, warm golden tones",
  "Deportiva": "Dynamic sports photography, athlete in action, frozen motion, dramatic lighting, high contrast",
  "Producto": "Clean product photography, premium item on minimal background, studio lighting, sharp details",
  "Publicidad": "Creative advertising photography, bold composition, vibrant colors, high-end commercial production",
  "Retrato": "Professional portrait photography, studio lighting, shallow depth of field, warm skin tones",
  "Moda": "High fashion editorial photography, model in designer clothing, dramatic pose, studio lighting",
  "Life Style": "Lifestyle photography, authentic candid moment, natural light, warm colors",
  "Fotografía Social": "Social event photography, people celebrating at an elegant party, warm ambient lighting",
  "Fotografía 360": "360 degree panoramic photography equipment, immersive virtual reality photography, futuristic feel",
  "Fotografía aérea": "Stunning aerial drone photography of Mediterranean coastline, golden hour, bird eye view",
  "Dron_Video": "Cinematic aerial drone video over a modern city at sunset, smooth motion, warm golden light",
  "Fotogrametría": "Photogrammetry 3D mapping from drone, digital elevation model, topographic colors",
  "Inspecciones": "Drone inspection of a tall building facade, industrial inspection, technical photography",
  "Matterport": "Matterport 3D virtual tour of a luxury apartment, dollhouse view, immersive technology",
  "Renders": "Photorealistic 3D architectural render, exterior visualization, dramatic sky",
  "Video_Real Estate": "Professional real estate videography, gimbal shot through luxury home, cinematic lighting",
  "Video_Publicidad": "Professional advertising video production set, cinema camera, dramatic lighting",
  "Podcast": "Professional podcast studio setup, microphones, acoustic panels, warm ambient lighting",
  "Timelapse de larga duración": "Long duration timelapse of construction project, day to night transition",
  "Video_Eventos": "Professional event videography, multicamera setup at corporate conference",
  "Video_Producto": "Product video production, smooth turntable rotation, studio lighting, macro details",
  "Deporte": "Dynamic sports videography, action camera following athlete, cinematic slow motion",
  "Streaming": "Professional live streaming setup, multiple cameras, mixing console, broadcast monitors",
  "Eventos_Streaming": "Live event streaming production, professional broadcast cameras, LED screens",
  "Eventos_Fotografía": "Event photography coverage, photographer capturing keynote speaker, professional equipment",
  "Eventos_Video": "Event video production, cinema camera on dolly tracking speakers",
  "Sonido": "Professional sound engineering at live event, mixing console, speakers, concert atmosphere",
  "Renders 3D": "Stunning photorealistic 3D render of a modern architectural project, interior visualization",
};

const categoryPrompts: Record<string, string> = {
  "Fotografía": "Professional photography studio with cameras, lenses, and lighting equipment, warm ambient light",
  "Dron": "Professional drone flying over stunning Mediterranean coastline at golden hour, aerial perspective",
  "Tours Virtuales": "Immersive 3D virtual tour technology, Matterport camera scanning a luxury interior",
  "Video": "Professional cinema camera on gimbal rig, film production set with dramatic lighting",
  "Eventos": "Grand corporate event with professional stage setup, LED screens, dramatic lighting",
  "Renders": "Stunning photorealistic 3D architectural visualization, modern building exterior at sunset",
};

function getPromptKey(name: string, categoryName: string): string {
  if (categoryName === "Dron" && name === "Video") return "Dron_Video";
  if (categoryName === "Video" && name === "Real Estate") return "Video_Real Estate";
  if (categoryName === "Video" && name === "Publicidad") return "Video_Publicidad";
  if (categoryName === "Video" && name === "Eventos") return "Video_Eventos";
  if (categoryName === "Video" && name === "Producto") return "Video_Producto";
  if (categoryName === "Eventos" && name === "Streaming") return "Eventos_Streaming";
  if (categoryName === "Eventos" && name === "Fotografía") return "Eventos_Fotografía";
  if (categoryName === "Eventos" && name === "Video") return "Eventos_Video";
  return name;
}

function buildPrompt(item: any, type: "category" | "subcategory", styleHint?: string): string {
  let base: string;
  if (type === "category") {
    base = categoryPrompts[item.name] || `Professional ${item.name} service, cinematic lighting`;
  } else {
    const catName = item.portfolio_categories?.name || "";
    const key = getPromptKey(item.name, catName);
    base = defaultPrompts[key] || `Professional photography of ${item.name}, cinematic lighting`;
  }

  if (styleHint) {
    return `${base}. Style: ${styleHint}`;
  }
  return base;
}

async function generateCoversForItems(
  supabase: any,
  LOVABLE_API_KEY: string,
  items: any[],
  type: "subcategory" | "category",
  styleHint?: string,
) {
  const results: { id: string; name: string; status: string }[] = [];

  for (const item of items) {
    const prompt = buildPrompt(item, type, styleHint);

    try {
      console.log(`Generating ${type} cover for: ${item.name}`);

      const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: `Generate a wide 16:9 cover image: ${prompt}` }],
          modalities: ["image", "text"],
        }),
      });

      if (!aiResp.ok) {
        const errText = await aiResp.text();
        console.error(`AI error for ${item.name}: ${aiResp.status} ${errText}`);
        results.push({ id: item.id, name: item.name, status: `error: ${aiResp.status}` });
        if (aiResp.status === 429) await new Promise(r => setTimeout(r, 5000));
        continue;
      }

      const aiData = await aiResp.json();
      const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!imageUrl || !imageUrl.startsWith("data:image")) {
        results.push({ id: item.id, name: item.name, status: "no image returned" });
        continue;
      }

      const base64Data = imageUrl.split(",")[1];
      const binaryStr = atob(base64Data);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

      const folder = type === "category" ? "categories" : "subcategories";
      const filePath = `covers/${folder}/ai-${item.id}.png`;

      const { error: uploadErr } = await supabase.storage
        .from("portfolio")
        .upload(filePath, bytes, { contentType: "image/png", upsert: true });

      if (uploadErr) {
        results.push({ id: item.id, name: item.name, status: `upload error: ${uploadErr.message}` });
        continue;
      }

      const { data: urlData } = supabase.storage.from("portfolio").getPublicUrl(filePath);
      // Add cache buster to force refresh
      const publicUrl = urlData.publicUrl + `?t=${Date.now()}`;
      const table = type === "category" ? "portfolio_categories" : "portfolio_subcategories";
      await supabase.from(table).update({ cover_image: publicUrl }).eq("id", item.id);

      results.push({ id: item.id, name: item.name, status: "ok" });
      console.log(`✓ ${item.name}`);
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      results.push({ id: item.id, name: item.name, status: `error: ${e.message}` });
    }
  }

  return results;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const type: "subcategory" | "category" = body.type === "category" ? "category" : "subcategory";
    const regenerateAll: boolean = body.regenerate === true;
    const specificIds: string[] | undefined = body.ids;
    const styleHint: string | undefined = body.style;

    let items: any[];
    const table = type === "category" ? "portfolio_categories" : "portfolio_subcategories";
    const selectCols = type === "category"
      ? "id, name, cover_image"
      : "id, name, cover_image, portfolio_categories(name)";

    if (specificIds && specificIds.length > 0) {
      const { data, error } = await supabase.from(table).select(selectCols).in("id", specificIds);
      if (error) throw error;
      items = data || [];
    } else if (regenerateAll) {
      const { data, error } = await supabase.from(table).select(selectCols);
      if (error) throw error;
      items = data || [];
    } else {
      const { data, error } = await supabase.from(table).select(selectCols).is("cover_image", null);
      if (error) throw error;
      items = data || [];
    }

    if (items.length === 0) {
      return new Response(JSON.stringify({ message: "No items to generate covers for", generated: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = await generateCoversForItems(supabase, LOVABLE_API_KEY, items, type, styleHint);
    const generated = results.filter(r => r.status === "ok").length;

    return new Response(JSON.stringify({ message: `Generated ${generated}/${items.length} covers`, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-covers error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
