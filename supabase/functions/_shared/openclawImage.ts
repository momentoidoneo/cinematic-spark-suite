import {createClient} from 'jsr:@supabase/supabase-js@2';
import {parseImageRequest} from './aiImageRequest.ts';
export async function callOpenClawImage(payload:Record<string,any>){
 const request=parseImageRequest(payload);
 const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
 const {data:worker}=await db.from('ai_worker_credentials').select('last_seen_at').eq('id','silviocosta-net').eq('enabled',true).maybeSingle();
 if(!worker?.last_seen_at||Date.now()-Date.parse(worker.last_seen_at)>30000)throw new Error('OpenClaw no está disponible');
 const {data:job,error}=await db.from('ai_quote_jobs').insert({task_type:'image',messages:[{role:'user',content:JSON.stringify(request)}],expires_at:new Date(Date.now()+280000).toISOString()}).select('id').single();
 if(error||!job)throw new Error('No se pudo crear el trabajo de imagen');
 const deadline=Date.now()+270000;
 while(Date.now()<deadline){
  await new Promise(r=>setTimeout(r,1500));
  const {data,error}=await db.from('ai_quote_jobs').select('state,result').eq('id',job.id).single();
  if(error)throw new Error('No se pudo consultar la imagen');
  if(data.state==='complete'){
   if(data.result?.imagePath!==`${job.id}.png`)throw new Error('Resultado de imagen inválido');
   const {data:signed,error:signError}=await db.storage.from('ai-generated-private').createSignedUrl(data.result.imagePath,600);
   if(signError||!signed)throw new Error('No se pudo recuperar la imagen');
   return {choices:[{message:{images:[{image_url:{url:signed.signedUrl}}]}}],provider:'openclaw-openai-oauth'};
  }
  if(data.state==='failed'||data.state==='expired')throw new Error('OpenClaw no pudo completar la imagen; no se ha repetido automáticamente');
 }
 throw new Error('La imagen sigue pendiente; comprueba el estado antes de repetir');
}
