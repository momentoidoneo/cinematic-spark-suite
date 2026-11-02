import {requireAdmin} from './adminAuth.ts';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type, x-sc-operation-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version'};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});
declare const EdgeRuntime:{waitUntil(promise:Promise<unknown>):void};
export function asyncAdminOperation(name:string,handler:(req:Request)=>Promise<Response>){
 return async(req:Request)=>{
  if(req.method==='OPTIONS')return json({ok:true});
  if(req.method!=='POST')return json({error:'Método no admitido'},405);
  const auth=await requireAdmin(req,cors);if('response'in auth)return auth.response;
  const id=req.headers.get('x-sc-operation-id')||'';
  if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id))return json({error:'Identificador de operación requerido'},400);
  const raw=await req.clone().text();if(raw.length>64000)return json({error:'Solicitud demasiado extensa'},400);
  let body;try{body=JSON.parse(raw);}catch{return json({error:'Solicitud inválida'},400);}
  // A long batch is split by the client into independently recoverable operations.
  if((name==='generate-covers'&&(!Array.isArray(body.ids)||body.ids.length!==1))||(name==='generate-gallery'&&body.count!==1)||(name==='generate-thumbnail'&&body.numberResults!==1)||(name==='generate-social-from-portfolio'&&(!Array.isArray(body.image_ids)||body.image_ids.length!==1)))return json({error:'Envía una imagen por operación; el panel procesa los lotes de forma secuencial.'},400);
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(name+'\n'+raw)))).map(x=>x.toString(16).padStart(2,'0')).join('');
  const db=auth.supabase;
  const {data:existing,error:readError}=await db.from('admin_ai_operations').select('user_id,request_hash,state,result').eq('id',id).maybeSingle();
  if(readError)return json({error:'No se pudo comprobar la operación'},503);
  if(existing){
   if(existing.user_id!==auth.user.id||existing.request_hash!==hash)return json({error:'Conflicto de operación'},409);
   return json({operationId:id,state:existing.state},202);
  }
  const {data:allowed,error:limitError}=await db.rpc('allow_web_request',{p_bucket:'admin-image:'+auth.user.id,p_limit:30});
  if(limitError||!allowed)return json({error:'Límite temporal de imágenes alcanzado'},429);
  const {error}=await db.from('admin_ai_operations').insert({id,user_id:auth.user.id,function_name:name,request_hash:hash});
  if(error)return json({error:'No se pudo crear la operación. Consulta su estado antes de repetir.'},409);
  EdgeRuntime.waitUntil((async()=>{
   try{
    const response=await handler(req);
    const result=await response.json();
    const failed=!response.ok||!!result.error;
    await db.from('admin_ai_operations').update({state:failed?'failed':'complete',result,completed_at:new Date().toISOString()}).eq('id',id).eq('state','running');
   }catch{
    await db.from('admin_ai_operations').update({state:'failed',result:{error:'La operación no pudo completarse. Revisa el panel antes de repetir.'},completed_at:new Date().toISOString()}).eq('id',id).eq('state','running');
   }
  })());
  return json({operationId:id,state:'running'},202);
 };
}
