import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const prompts: Record<string, string> = {
  // Fotografía
  "Real Estate": "Professional real estate photography of a modern luxury villa interior, bright natural light, wide angle, HDR style, warm tones, magazine quality",
  "Eventos": "Professional event photography, elegant gala dinner with ambient lighting, candid moments, warm golden tones, bokeh background",
  "Deportiva": "Dynamic sports photography, athlete in action, frozen motion, dramatic lighting, high contrast, professional stadium",
  "Producto": "Clean product photography, premium item on minimal background, studio lighting, sharp details, commercial quality",
  "Publicidad": "Creative advertising photography, bold composition, vibrant colors, high-end commercial production, dramatic lighting",
  "Retrato": "Professional portrait photography, studio lighting, shallow depth of field, warm skin tones, elegant and natural expression",
  "Moda": "High fashion editorial photography, model in designer clothing, dramatic pose, studio lighting, magazine cover quality",
  "Life Style": "Lifestyle photography, authentic candid moment, natural light, warm colors, people enjoying everyday luxury",
  "Fotografía Social": "Social event photography, people celebrating at an elegant party, warm ambient lighting, candid joyful moments",
  "Fotografía 360": "360 degree panoramic photography equipment setup, immersive virtual reality photography, modern tech, futuristic feel",
  // Dron
  "Fotografía aérea": "Stunning aerial drone photography of Mediterranean coastline with luxury properties, golden hour, breathtaking bird eye view",
  // Dron > Video
  "Dron_Video": "Cinematic aerial drone video shot over a modern city at sunset, smooth motion, 4K quality, warm golden light",
  "Fotogrametría": "Photogrammetry 3D mapping from drone, digital elevation model of terrain, technical yet visually striking, topographic colors",
  "Inspecciones": "Drone inspection of a tall building facade, close-up industrial inspection, professional technical photography, safety theme",
  // Tours Virtuales
  "Matterport": "Matterport 3D virtual tour of a luxury modern apartment, dollhouse view, immersive technology, clean architectural lines",
  "Renders": "Photorealistic 3D architectural render of a modern building, exterior visualization, dramatic sky, professional CGI quality",
  // Video
  "Video_Real Estate": "Professional real estate videography, gimbal shot through luxury home, cinematic warm lighting, smooth camera movement",
  "Video_Publicidad": "Professional advertising video production set, cinema camera, dramatic lighting, creative commercial production",
  "Podcast": "Professional podcast studio setup, microphones, acoustic panels, warm ambient lighting, modern minimalist design",
  "Timelapse de larga duración": "Long duration timelapse of a construction project, day to night transition, dramatic clouds, progress documentation",
  "Video_Eventos": "Professional event videography, multicamera setup at corporate conference, cinematic quality, warm stage lighting",
  "Video_Producto": "Product video production, smooth turntable rotation, studio lighting, premium commercial quality, macro details",
  "Deporte": "Dynamic sports videography, action camera following athlete, motion blur, cinematic slow motion, dramatic lighting",
  "Streaming": "Professional live streaming setup, multiple cameras, mixing console, broadcast monitors, modern production studio",
  // Eventos
  "Eventos_Streaming": "Live event streaming production, professional broadcast cameras, stage with LED screens, corporate event atmosphere",
  "Eventos_Fotografía": "Event photography coverage, photographer capturing keynote speaker on stage, professional equipment, dynamic angle",
  "Eventos_Video": "Event video production, cinema camera on dolly tracking speakers at conference, professional broadcast quality",
  "Sonido": "Professional sound engineering at live event, mixing console, speakers, audio equipment, concert atmosphere, warm lighting",
  // Renders
  "Renders 3D": "Stunning photorealistic 3D render of a modern architectural project, interior visualization, dramatic lighting, CGI masterpiece",
};

// Map subcategory id+name+category to the right prompt key
function getPromptKey(name: string, categoryName: string): string {
  // Handle duplicates across categories
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

const categoryPrompts: Record<string, string> = {
  "Fotografía": "Professional photography studio with multiple cameras, lenses, and lighting equipment, warm ambient light, elegant workspace, magazine quality",
  "Dron": "Professional drone flying over stunning Mediterranean coastline at golden hour, aerial perspective, cinematic wide shot, breathtaking landscape",
  "Tours Virtuales": "Immersive 3D virtual tour technology, Matterport camera scanning a luxury interior, futuristic visualization, clean modern aesthetic",
  "Video": "Professional cinema camera on gimbal rig, film production set with dramatic lighting, cinematic atmosphere, high-end equipment",
  "Eventos": "Grand corporate event with professional stage setup, LED screens, dramatic lighting, audience silhouettes, broadcast quality production",
  "Renders": "Stunning photorealistic 3D architectural visualization, modern building exterior at sunset, CGI masterpiece, dramatic sky and reflections",
};

async function generateCoversForItems(
  supabase: any,
  LOVABLE_API_KEY: string,
  items: any[],
  type: "subcategory" | "category"
) {
  const results: { id: string; name: string; status: string }[] = [];

  for (const item of items) {
    let prompt: string;
    if (type === "category") {
      prompt = categoryPrompts[item.name] || `Professional ${item.name} service, high quality, cinematic lighting, wide 16:9, magazine quality`;
    } else {
      const catName = (item as any).portfolio_categories?.name || "";
      const promptKey = getPromptKey(item.name, catName);
      prompt = prompts[promptKey] || `Professional photography of ${item.name}, high quality, cinematic lighting, magazine quality`;
    }

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
        console.error(`No image returned for ${item.name}`);
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
      const table = type === "category" ? "portfolio_categories" : "portfolio_subcategories";
      await supabase.from(table).update({ cover_image: urlData.publicUrl }).eq("id", item.id);

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

    let items: any[];
    if (type === "category") {
      const { data, error } = await supabase
        .from("portfolio_categories")
        .select("id, name, cover_image")
        .is("cover_image", null);
      if (error) throw error;
      items = data || [];
    } else {
      const { data, error } = await supabase
        .from("portfolio_subcategories")
        .select("id, name, cover_image, portfolio_categories(name)")
        .is("cover_image", null);
      if (error) throw error;
      items = data || [];
    }

    if (items.length === 0) {
      return new Response(JSON.stringify({ message: `All ${type === "category" ? "categories" : "subcategories"} already have covers`, generated: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = await generateCoversForItems(supabase, LOVABLE_API_KEY, items, type);
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
