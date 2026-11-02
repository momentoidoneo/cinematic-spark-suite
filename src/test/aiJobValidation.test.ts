import {describe,it,expect} from 'vitest';
import {sanitizeAiJobResult} from '../../supabase/functions/_shared/aiJobValidation';
const quote={min:100,max:200,summary:'Resumen',includes:['Foto'],notes:'Nota',whatsappMessage:'Hola'};
describe('independent AI task boundaries',()=>{
 it('accepts a complete quote and strips extras',()=>expect(sanitizeAiJobResult('quote',{...quote,text:'not allowed'})).toEqual(quote));
 it('rejects admin text as quote',()=>expect(sanitizeAiJobResult('quote',{text:'hello'})).toBeNull());
 it('rejects a quote as admin text',()=>expect(sanitizeAiJobResult('admin_text',quote)).toBeNull());
 it('allows bounded plain text and strips extras',()=>expect(sanitizeAiJobResult('admin_text',{text:'hello',min:0})).toEqual({text:'hello'}));
 it.each(['','   ','x'.repeat(40001)])('rejects empty or oversized admin output',text=>expect(sanitizeAiJobResult('admin_text',{text})).toBeNull());
 it.each([undefined,'image','shell'])('rejects unknown task type',type=>expect(sanitizeAiJobResult(type,quote)).toBeNull());
 it.each([{...quote,min:-1},{...quote,max:99},{...quote,max:Infinity},{...quote,includes:[{}]},{...quote,notes:null}])('preserves quote validation',invalid=>expect(sanitizeAiJobResult('quote',invalid)).toBeNull());
});
