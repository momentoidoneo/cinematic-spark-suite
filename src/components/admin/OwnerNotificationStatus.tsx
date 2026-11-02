import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { AlertCircle, Mail } from 'lucide-react';
type Notice = {state:'pending'|'sending'|'sent'|'failed'|'unknown';attempts:number;provider_message_id:string|null;last_error:string|null;updated_at:string};
const labels={pending:'Aviso pendiente',sending:'Envío en curso',sent:'Aviso aceptado por Gmail',failed:'Aviso no enviado',unknown:'Entrega sin confirmar: revisa Gmail antes de reenviar'};
export function OwnerNotificationStatus({kind,leadId}:{kind:'contact'|'quote';leadId:string|null}) {
  const query=useQuery({queryKey:['owner-notification',kind,leadId],enabled:!!leadId,queryFn:async()=>{
    const {data,error}=await supabase.functions.invoke('owner-notification-status',{body:{kind,leadId,action:'status'}});
    if(error)throw error;return data.notification as Notice|null;
  },refetchInterval:15000});
  const retry=useMutation({mutationFn:async()=>{
    const {data,error}=await supabase.functions.invoke('owner-notification-status',{body:{kind,leadId,action:'retry'}});
    if(error||data?.error)throw new Error('No se pudo enviar; revisa Gmail antes de volver a intentarlo.');
  },onSettled:()=>query.refetch()});
  if(!leadId)return null;
  const n=query.data;
  return <div className="rounded-lg border p-3 text-sm flex flex-wrap items-center gap-3" role="status">
    {query.isError||n?.state==='failed'||n?.state==='unknown'?<AlertCircle className="h-4 w-4 text-amber-500"/>:<Mail className="h-4 w-4"/>}
    <span>{query.isError?'No se pudo consultar el estado del aviso':query.isPending?'Consultando aviso…':n?labels[n.state]:'Solicitud anterior: sin registro de entrega'}</span>
    {n&&['pending','failed'].includes(n.state)&&<Button size="sm" variant="outline" disabled={retry.isPending} onClick={()=>retry.mutate()}>{retry.isPending?'Enviando…':'Enviar aviso pendiente'}</Button>}
    {retry.isError&&<span className="text-amber-500">{retry.error.message}</span>}
  </div>;
}
