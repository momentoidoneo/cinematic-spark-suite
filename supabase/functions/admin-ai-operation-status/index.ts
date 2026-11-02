import {requireAdmin} from '../_shared/adminAuth.ts';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return json({ok:true});
 if(req.method!=='POST')return json({error:'Método no admitido'},405);
 const auth=await requireAdmin(req,cors);if('response'in auth)return auth.response;
 const body=await req.json().catch(()=>({}));
 const {data,error}=await auth.supabase.from('admin_ai_operations').select('id,state,result,created_at').eq('id',body.id).eq('user_id',auth.user.id).maybeSingle();
 if(error||!data)return json({error:'Operación no disponible'},404);
 if(data.state==='running'&&Date.now()-Date.parse(data.created_at)>8*60_000){
  await auth.supabase.from('admin_ai_operations').update({state:'unknown'}).eq('id',data.id).eq('state','running');
  data.state='unknown';
 }
 return json(data);
});
