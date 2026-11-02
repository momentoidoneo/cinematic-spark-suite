import { requireAdmin } from '../_shared/adminAuth.ts';
import { deliverLeadNotice } from '../_shared/ownerNotifications.ts';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS'};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}});
Deno.serve(async req=>{
  if(req.method==='OPTIONS') return new Response(null,{headers:cors});
  if(req.method!=='POST') return reply({error:'Método no permitido'},405);
  const auth=await requireAdmin(req,cors); if('response' in auth)return auth.response;
  const b=await req.json().catch(()=>({}));
  if(!['contact','quote'].includes(b.kind)||!/^\w{8}-(?:\w{4}-){3}\w{12}$/.test(b.leadId||''))return reply({error:'Datos inválidos'},400);
  // A crashed send is ambiguous, never automatically safe to resend.
  await auth.supabase.from('owner_notifications').update({state:'unknown',last_error:'send_interrupted_check_inbox',updated_at:new Date().toISOString()}).eq('lead_type',b.kind).eq('lead_id',b.leadId).eq('state','sending').lt('updated_at',new Date(Date.now()-120_000).toISOString());
  if(b.action==='retry') {
    try{await deliverLeadNotice(b.kind,b.leadId);}catch{return reply({error:'No se pudo completar el envío; revisa su estado antes de repetir.'},503);}
  }
  const {data,error}=await auth.supabase.from('owner_notifications').select('state,attempts,provider_message_id,last_error,updated_at').eq('lead_type',b.kind).eq('lead_id',b.leadId).maybeSingle();
  return error?reply({error:'No se pudo consultar el aviso'},503):reply({notification:data});
});
