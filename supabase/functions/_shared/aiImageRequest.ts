const TARGET='https://sffgaplkqmmnikqhhftx.supabase.co';
export function parseImageRequest(payload:Record<string,any>){
 const messages=payload.messages;
 if(!Array.isArray(messages)||messages.length!==1||messages[0].role!=='user')throw new Error('Solicitud de imagen inválida');
 const content=messages[0].content;
 let prompt='',referenceUrl:string|null=null;
 if(typeof content==='string')prompt=content;
 else if(Array.isArray(content)){
  if(content.length>2)throw new Error('Solo se admite una imagen de referencia');
  for(const part of content){
   if(part.type==='text'&&typeof part.text==='string')prompt+=part.text;
   else if(part.type==='image_url'&&typeof part.image_url?.url==='string'&&!referenceUrl)referenceUrl=part.image_url.url;
   else throw new Error('Referencia de imagen inválida');
  }
 }else throw new Error('Solicitud de imagen inválida');
 if(!prompt.trim()||prompt.length>12000)throw new Error('Descripción de imagen inválida o demasiado extensa');
 if(referenceUrl){
  const url=new URL(referenceUrl);
  if(url.origin!==TARGET||!url.pathname.startsWith('/storage/v1/object/public/portfolio/')||url.username||url.password||/\.{2}|%2e|%2f|%5c/i.test(url.pathname))throw new Error('La referencia debe pertenecer al portfolio migrado');
 }
 return {prompt:prompt.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[email omitido]'),referenceUrl};
}
