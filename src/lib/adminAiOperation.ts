import {supabase} from '@/integrations/supabase/client';
// Keep only a job id locally, never prompts, auth or model output.
export async function invokeAdminAi(name:string,options:{body:Record<string,unknown>}){
 const id=crypto.randomUUID();
 try{
  localStorage.setItem('sc-admin-ai-last-operation',id);
  window.dispatchEvent(new Event('sc-admin-ai-operation'));
  const {data,error}=await supabase.functions.invoke(name,{...options,headers:{'x-sc-operation-id':id}});
  if(error)throw new Error(`No se confirmó el inicio. Operación ${id}: comprueba su estado antes de repetir.`);
  if(data?.error)throw new Error(data.error);
  if(data?.operationId!==id)throw new Error('El servidor no confirmó la operación solicitada.');
  for(let i=0;i<170;i++){
   await new Promise(r=>setTimeout(r,3000));
   const {data:status,error:statusError}=await supabase.functions.invoke('admin-ai-operation-status',{body:{id}});
   if(statusError)continue; // Poll only; never resubmit inference.
   if(status.state==='complete')return {data:status.result,error:null};
   if(status.state==='failed')throw new Error(status.result?.error||'No se pudo completar la generación.');
   if(status.state==='unknown')throw new Error(`Resultado no confirmado. Operación ${id}. No repitas sin comprobar las imágenes guardadas.`);
  }
  throw new Error(`Operación ${id} pendiente. Puedes consultar su estado desde el panel.`);
 }catch(error){return {data:null,error:error instanceof Error?error:new Error('Error de generación')};}
}
