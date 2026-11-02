import { createClient } from 'jsr:@supabase/supabase-js@2';

export const redactQuoteText=(s:string)=>s.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[email omitido]').replace(/(?:\+\d{1,3}[ .-]?)?(?:\d[ .-]?){9,15}\b/g,'[identificador omitido]');

export async function callOpenClawQuote(messages:{role:'system'|'user';content:string}[]) {
  return await callOpenClawJob(messages, 'quote');
}

export async function callOpenClawJob(messages:{role:'system'|'user';content:string}[], taskType:'quote'|'admin_text') {
  if(messages.length!==2||messages[0].role!=='system'||messages[1].role!=='user'||messages.some(m=>typeof m.content!=='string'||m.content.length>20000)) throw new Error('openclaw_invalid_input');
  const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const {data:worker}=await db.from('ai_worker_credentials').select('last_seen_at').eq('id','silviocosta-net').eq('enabled',true).maybeSingle();
  if(!worker?.last_seen_at || Date.now()-Date.parse(worker.last_seen_at)>30_000) throw new Error('openclaw_worker_unavailable');
  const {data:job,error}=await db.from('ai_quote_jobs').insert({task_type:taskType,messages:messages.map(m=>({...m,content:redactQuoteText(m.content)}))}).select('id').single();
  if(error||!job)throw new Error('openclaw_enqueue_failed');
  const deadline=Date.now()+60_000;
  while(Date.now()<deadline) {
    await new Promise(resolve=>setTimeout(resolve,800));
    const {data,error}=await db.from('ai_quote_jobs').select('state,result').eq('id',job.id).single();
    if(error)throw new Error('openclaw_result_unavailable');
    if(data.state==='complete')return data.result;
    if(data.state==='failed'||data.state==='expired')throw new Error('openclaw_generation_failed');
  }
  await db.from('ai_quote_jobs').update({state:'expired',messages:[],error_code:'deadline'}).eq('id',job.id).in('state',['pending','running']);
  throw new Error('openclaw_deadline');
}
