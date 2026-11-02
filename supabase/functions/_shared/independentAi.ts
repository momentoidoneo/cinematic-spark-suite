import {callOpenClawImage} from './openclawImage.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { callOpenClawJob } from './openclawQuote.ts';
export { getAssistantText, getFirstToolArguments, parseJsonFromText, extractImageUrl, imageUrlToBytes } from './aiResponse.ts';

export class IndependentAiError extends Error {
  constructor(public status:number, message:string) { super(message); }
}
export const isIndependentStatus=(error:unknown,status:number)=>error instanceof IndependentAiError&&error.status===status;

// Called only after requireAdmin. No provider key, model routing or executable tools
// are accepted from the caller. Tool schemas are output-format descriptions only.
export async function callIndependentChat(payload:Record<string,unknown>) {
  if(payload.modalities) return await callOpenClawImage(payload);
  const raw=payload.messages as {role:'system'|'user';content:string}[];
  if(!Array.isArray(raw)||raw.length!==2||raw[0].role!=='system'||raw[1].role!=='user'||raw.some(m=>typeof m.content!=='string'||m.content.length>18000)) throw new IndependentAiError(400,'Solicitud de IA no válida o demasiado extensa.');
  const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const {data:allowed,error}=await db.rpc('allow_web_request',{p_bucket:'admin-ai:global',p_limit:60});
  if(error||!allowed)throw new IndependentAiError(429,'Límite temporal de solicitudes de IA alcanzado.');
  const messages=raw.map(m=>({...m}));
  if(payload.tools)messages[0].content+='\nDevuelve solo JSON conforme al siguiente esquema de salida; NO ejecutes herramientas:\n'+JSON.stringify(payload.tools);
  try {
    const result=await callOpenClawJob(messages,'admin_text');
    if(!result||typeof result.text!=='string'||!result.text.trim())throw new Error('empty_result');
    return {choices:[{message:{content:result.text}}],provider:'openclaw-silvio-server'};
  } catch { throw new IndependentAiError(503,'OpenClaw no está disponible temporalmente. No se ha generado contenido.'); }
}
