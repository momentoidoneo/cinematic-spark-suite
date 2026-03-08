import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { platform, contentType, topic, tone, includeHashtags, includeEmojis, campaignContext } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Eres un experto en marketing de redes sociales especializado en fotografía profesional, videografía, drones y tours virtuales 360°. 
Genera contenido optimizado para ${platform} en español.
El negocio es "Silvio Costa Photography" - fotografía y vídeo profesional premium.
Responde SIEMPRE en formato JSON válido con esta estructura:
{
  "title": "título del post",
  "hook": "gancho inicial para captar atención",
  "caption": "texto completo del caption",
  "hashtags": ["hashtag1", "hashtag2", ...],
  "callToAction": "llamada a la acción",
  "bestTimeToPost": "mejor hora para publicar",
  "contentTips": ["tip1", "tip2", ...]
}`;

    const userPrompt = `Genera contenido para ${platform} (tipo: ${contentType}).
Tema: ${topic}
Tono: ${tone}
${includeHashtags ? "Incluye 10-15 hashtags relevantes." : "No incluyas hashtags."}
${includeEmojis ? "Usa emojis para hacer el texto más atractivo." : "No uses emojis."}
${campaignContext ? `Contexto de campaña: ${campaignContext}` : ""}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
      }),
    });

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No valid JSON in AI response");
    
    const result = JSON.parse(jsonMatch[0]);
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
