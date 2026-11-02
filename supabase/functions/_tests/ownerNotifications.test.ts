import {assertEquals,assertRejects,assertStringIncludes} from 'jsr:@std/assert@1';
import {buildLeadNotice,deliverLeadNotice} from '../_shared/ownerNotifications.ts';
import {GmailDeliveryError} from '../_shared/gmailDirect.ts';
function fixture(state='pending',saveFails=false) {
 const row={id:'notification',state,attempts:0,provider_message_id:null,last_error:null};
 const db={from(table:string){let patch:Record<string,unknown>|undefined;const filters:Record<string,unknown>={};
  const result=()=>{
   if(table==='contact_messages')return {data:{id:'lead',name:'Test',email:'silvio@silviocosta.net',message:'hello'},error:null};
   if(!patch)return {data:{...row},error:null};
   if(filters.state!==row.state || (filters.attempts!==undefined&&filters.attempts!==row.attempts))return {data:null,error:null};
   if(saveFails && patch.state==='sent')return {data:null,error:{message:'db_unavailable'}};
   Object.assign(row,patch);return {data:{id:row.id},error:null};
  };
  const q={select(){return q},eq(k:string,v:unknown){filters[k]=v;return q},update(p:Record<string,unknown>){patch=p;return q},single:async()=>result(),maybeSingle:async()=>result(),then(resolve:(v:unknown)=>unknown){return Promise.resolve(result()).then(resolve)}};
  return q;
 }};
 return {row,db:db as unknown as NonNullable<Parameters<typeof deliverLeadNotice>[2]>['db']};
}
Deno.test('stores Gmail receipt and prevents repeat send',async()=>{
 const f=fixture();let calls=0;const send=async()=>{calls++;return {messageId:'gmail-receipt'}};
 assertEquals(await deliverLeadNotice('contact','lead',{db:f.db,send}),{state:'sent'});
 await deliverLeadNotice('contact','lead',{db:f.db,send});
 assertEquals(calls,1);assertEquals(f.row.attempts,1);assertEquals(f.row.provider_message_id,'gmail-receipt');
});
Deno.test('only one concurrent caller wins the send claim',async()=>{
 const f=fixture();let calls=0;const send=async()=>{calls++;return {messageId:'receipt'}};
 await Promise.all([deliverLeadNotice('contact','lead',{db:f.db,send}),deliverLeadNotice('contact','lead',{db:f.db,send})]);
 assertEquals(calls,1);assertEquals(f.row.state,'sent');
});
Deno.test('uncertain Gmail timeout is never blindly retried',async()=>{
 const f=fixture();let calls=0;const send=async()=>{calls++;throw new GmailDeliveryError('send','unknown')};
 await deliverLeadNotice('contact','lead',{db:f.db,send});await deliverLeadNotice('contact','lead',{db:f.db,send});
 assertEquals(calls,1);assertEquals(f.row.state,'unknown');
});
Deno.test('OAuth failure can be safely retried after repair',async()=>{
 const f=fixture();await deliverLeadNotice('contact','lead',{db:f.db,send:async()=>{throw new GmailDeliveryError('oauth','not_attempted',401)}});
 assertEquals(f.row.state,'failed');await deliverLeadNotice('contact','lead',{db:f.db,send:async()=>({messageId:'receipt'})});
 assertEquals(f.row.state,'sent');assertEquals(f.row.attempts,2);
});
Deno.test('lost outcome persistence leaves sending state for manual reconciliation',async()=>{
 const f=fixture('pending',true);await assertRejects(()=>deliverLeadNotice('contact','lead',{db:f.db,send:async()=>({messageId:'receipt'})}));
 assertEquals(f.row.state,'sending');
});
Deno.test('HTML content escaped; catalog fallback labelled honestly',()=>{
 const m=buildLeadNotice('quote',{id:'id',name:'<script>x</script>',email:'silvio@silviocosta.net',response_payload:{source:'fallback'}});
 assertStringIncludes(m.html,'&lt;script&gt;');assertStringIncludes(m.html,'sin IA');assertEquals(m.html.includes('<script>'),false);
});
