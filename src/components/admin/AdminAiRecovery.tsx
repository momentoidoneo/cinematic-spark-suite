import {useEffect,useState} from 'react';
import {supabase} from '@/integrations/supabase/client';
import {Button} from '@/components/ui/button';
export default function AdminAiRecovery(){
 const [id,setId]=useState('');const [status,setStatus]=useState<any>(null);const [busy,setBusy]=useState(false);
 useEffect(()=>{const refresh=()=>{setId(localStorage.getItem('sc-admin-ai-last-operation')||'');setStatus(null);};refresh();window.addEventListener('sc-admin-ai-operation',refresh);return()=>window.removeEventListener('sc-admin-ai-operation',refresh);},[]);
 if(!id)return null;
 const check=async()=>{setBusy(true);try{const {data,error}=await supabase.functions.invoke('admin-ai-operation-status',{body:{id}});setStatus(error?{state:'unavailable'}:data);}finally{setBusy(false);}};
 const label:Record<string,string>={running:'En proceso',complete:'Finalizada: revisa el resultado',failed:'No completada',unknown:'Resultado no confirmado; no repitas sin revisarlo',unavailable:'No se pudo consultar'};
 const result=status?.result;
 const urls=[...(result?.images||[]).map((x:any)=>x.imageURL),...(result?.results||[]).map((x:any)=>x.url),result?.generatedImageUrl].filter((url):url is string=>typeof url==='string'&&/^https:\/\/sffgaplkqmmnikqhhftx\.supabase\.co\/storage\/v1\/object\/public\//.test(url));
 return <details className="mb-4 rounded-md border border-border p-3 text-sm"><summary className="cursor-pointer">Recuperar última generación IA</summary><div className="mt-2 space-y-2"><p className="break-all text-muted-foreground">Operación: {id}</p><p>Consultar no genera otra imagen ni repite la solicitud.</p><Button variant="outline" size="sm" onClick={check} disabled={busy}>{busy?'Consultando…':'Consultar estado'}</Button>{status&&<p role="status">{label[status.state]||status.error||'Estado pendiente'}</p>}{result?.error&&<p>{result.error}</p>}{result?.message&&<p>{result.message}</p>}{urls.map((url,index)=><a className="block underline" key={url} href={url} target="_blank" rel="noreferrer">Ver imagen {index+1}</a>)}{result&&<pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded bg-muted p-2 text-xs">{JSON.stringify(result,null,2)}</pre>}</div></details>;
}
