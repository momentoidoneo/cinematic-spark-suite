export function sanitizeAiJobResult(taskType:unknown,r:any):Record<string,unknown>|null {
  if(taskType==='admin_text')return r&&typeof r.text==='string'&&r.text.trim().length>0&&r.text.length<=40000?{text:r.text}:null;
  if(taskType!=='quote')return null;
  const valid=r&&Number.isFinite(r.min)&&Number.isFinite(r.max)&&r.min>=0&&r.max>=r.min&&r.max<1_000_000&&typeof r.summary==='string'&&r.summary.length<=1000&&Array.isArray(r.includes)&&r.includes.length<=12&&r.includes.every((x:unknown)=>typeof x==='string'&&x.length<=500)&&typeof r.notes==='string'&&r.notes.length<=1200&&typeof r.whatsappMessage==='string'&&r.whatsappMessage.length<=1500;
  return valid?{min:r.min,max:r.max,summary:r.summary,includes:r.includes,notes:r.notes,whatsappMessage:r.whatsappMessage}:null;
}
