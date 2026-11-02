import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import { escapeEmailHtml as esc, GmailDeliveryError, gmailConfigFromEnv, sendOwnerGmail, type OwnerNotification } from './gmailDirect.ts';

export type LeadKind = 'contact' | 'quote';
type Lead = Record<string, unknown>;
export function buildLeadNotice(kind: LeadKind, row: Lead): OwnerNotification {
  const clean = (v: unknown) => String(v ?? '');
  const title = kind === 'contact' ? 'Nuevo mensaje de contacto' : 'Nueva solicitud del Cotizador';
  const entries = kind === 'contact'
    ? [['Nombre', row.name], ['Email', row.email], ['Teléfono', row.phone], ['Mensaje', row.message]]
    : [['Nombre',row.name],['Email',row.email],['Teléfono',row.phone],['Servicios',row.service],['Alcance',row.scope],['Ubicación',row.location],['Urgencia',row.urgency],['Estimación',`${row.min_amount} – ${row.max_amount} €`],['Resumen',row.summary],['Detalles',row.details],['Origen de estimación',(row.response_payload as Lead)?.source === 'ai' ? 'OpenClaw' : 'Catálogo de tarifas (respaldo, sin IA)']];
  return {
    reference: `${kind}.${row.id}`,
    subject: `${kind === 'contact' ? '📩' : '🤖'} ${title} — ${clean(row.name).replace(/[\r\n]+/g,' ')}`,
    replyTo: clean(row.email),
    html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;padding:24px;background:#0F172A;color:#fff"><h2>${title}</h2><p>Recibido desde silviocosta.net</p><table style="width:100%">${entries.map(([k,v])=>`<tr><th style="padding:10px;text-align:left;vertical-align:top;color:#94A3B8">${esc(clean(k))}</th><td style="padding:10px;white-space:pre-wrap">${esc(clean(v)||'—')}</td></tr>`).join('')}</table><p>ID: ${esc(clean(row.id))}</p><p>Responde a este email o consulta el panel de administración.</p></div>`,
  };
}

export async function deliverLeadNotice(kind: LeadKind, leadId: string, overrides?: {
  db?: SupabaseClient;
  send?: (notice: OwnerNotification) => Promise<{messageId:string}>;
}) {
  const db = overrides?.db ?? createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const {data: current,error: readError} = await db.from('owner_notifications').select('id,state,attempts').eq('lead_type',kind).eq('lead_id',leadId).single();
  if(readError || !current) throw new Error('notification_record_missing');
  if(!['pending','failed'].includes(current.state)) return {state:current.state};
  const {data: claim,error: claimError} = await db.from('owner_notifications').update({state:'sending',attempts:current.attempts+1,last_error:null,updated_at:new Date().toISOString()}).eq('id',current.id).eq('state',current.state).eq('attempts',current.attempts).select('id').maybeSingle();
  if(claimError) throw new Error('notification_claim_failed');
  if(!claim) return {state:'sending'};
  let state='failed', messageId: string | null=null, errorCode: string | null=null;
  try {
    const {data: lead,error} = await db.from(kind==='contact'?'contact_messages':'quote_requests').select('*').eq('id',leadId).single();
    if(error || !lead) throw new Error('notification_lead_missing');
    const notice=buildLeadNotice(kind,lead);
    const delivery = overrides?.send ? await overrides.send(notice) : await sendOwnerGmail(gmailConfigFromEnv(k=>Deno.env.get(k)),notice);
    messageId=delivery.messageId; state='sent';
  } catch(err) {
    state=err instanceof GmailDeliveryError && err.delivery==='unknown' ? 'unknown' : 'failed';
    errorCode=err instanceof GmailDeliveryError ? err.message : 'notification_preparation_failed';
  }
  const {error: savedError}=await db.from('owner_notifications').update({state,provider_message_id:messageId,last_error:errorCode,updated_at:new Date().toISOString()}).eq('id',current.id).eq('state','sending');
  if(savedError) throw new Error('notification_outcome_not_saved_check_inbox_before_retry');
  return {state};
}
