import {sanitizeAiJobResult} from '../_shared/aiJobValidation.ts';
import {createClient} from 'jsr:@supabase/supabase-js@2';
const reply=(b:unknown,s=200)=>new Response(JSON.stringify(b),{status:s,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
Deno.serve(async req=>{
  if(req.method!=='POST')return reply({error:'method'},405);
  const token=req.headers.get('Authorization')?.replace(/^Bearer /,'')||'';
  if(!/^[a-f0-9]{64}$/.test(token))return reply({error:'unauthorized'},401);
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))).map(b=>b.toString(16).padStart(2,'0')).join('');
  const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const {data:worker,error}=await db.from('ai_worker_credentials').select('id').eq('id','silviocosta-net').eq('token_sha256',hash).eq('enabled',true).maybeSingle();
  if(error||!worker)return reply({error:'unauthorized'},401);
  const b=await req.json().catch(()=>({}));
  if(b.action==='heartbeat') {
    const {error}=await db.from('ai_worker_credentials').update({last_seen_at:new Date().toISOString()}).eq('id',worker.id);
    return error?reply({error:'heartbeat_unavailable'},503):reply({ok:true});
  }
  if(b.action==='claim') {
    await db.from('ai_worker_credentials').update({last_seen_at:new Date().toISOString()}).eq('id',worker.id);
    await db.from('ai_quote_jobs').update({state:'expired',messages:[],error_code:'deadline'}).in('state',['pending','running']).lt('expires_at',new Date().toISOString());
    const taskType=b.taskType||'quote';
    if(taskType!=='quote'&&taskType!=='admin_text'&&taskType!=='image')return reply({error:'invalid_task'},400);
    const {data,error}=await db.rpc(taskType==='quote'?'claim_ai_quote_job':taskType==='image'?'claim_ai_image_job':'claim_ai_admin_job');
    return error?reply({error:'queue_unavailable'},503):reply({job:data?.[0]||null});
  }
  if(b.action==='image_upload') {
    const {data:job,error}=await db.from('ai_quote_jobs').select('id').eq('id',b.id).eq('lease_id',b.leaseId).eq('task_type','image').eq('state','running').gt('expires_at',new Date().toISOString()).maybeSingle();
    if(error||!job)return reply({error:'job_unavailable'},403);
    const {data,error:uploadError}=await db.storage.from('ai-generated-private').createSignedUploadUrl(`${job.id}.png`,{upsert:false});
    return uploadError?reply({error:'upload_unavailable'},503):reply({uploadUrl:data?.signedUrl});
  }
  if(b.action==='complete') {
    if(!/^[a-f0-9-]{36}$/.test(b.id||'')||!/^[a-f0-9-]{36}$/.test(b.leaseId||''))return reply({error:'invalid'},400);
    const {data:job,error:jobError}=await db.from('ai_quote_jobs').select('task_type').eq('id',b.id).eq('lease_id',b.leaseId).eq('state','running').maybeSingle();
    if(jobError)return reply({error:'result_not_saved'},503);
    if(!job)return reply({accepted:false});
    let clean=sanitizeAiJobResult(job.task_type,b.result);
    if(job.task_type==='image'&&b.result?.imagePath===`${b.id}.png`){
      const {data:file,error:fileError}=await db.storage.from('ai-generated-private').download(b.result.imagePath);
      if(!fileError&&file&&file.size<=12582912){
        const head=new Uint8Array(await file.slice(0,8).arrayBuffer());
        if(head.join(',')==='137,80,78,71,13,10,26,10')clean={imagePath:b.result.imagePath,bytes:file.size,provider:'openclaw-openai-oauth'};
      }
    }
    const valid=!!clean;
    const {data,error}=await db.from('ai_quote_jobs').update({state:valid?'complete':'failed',messages:[],result:clean,error_code:valid?null:'agent_result_failed',completed_at:new Date().toISOString()}).eq('id',b.id).eq('lease_id',b.leaseId).eq('state','running').gt('expires_at',new Date().toISOString()).select('id').maybeSingle();
    return error?reply({error:'result_not_saved'},503):reply({accepted:!!data});
  }
  return reply({error:'invalid'},400);
});
