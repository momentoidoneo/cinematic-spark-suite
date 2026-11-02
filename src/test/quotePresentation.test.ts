import {describe,it,expect} from 'vitest';
import {consistentQuoteCopy} from '../../supabase/functions/generate-quote/presentation';
const fallback={summary:'Dos servicios coordinados en Madrid.',includes:['Fotografía y Matterport'],notes:'Importe orientativo sujeto a revisión.',whatsappMessage:'Quiero confirmar alcance y disponibilidad.'};
describe('quote price presentation',()=>{
  it.each(['150–250 €','150 a 250 euros','EUR 150–250'])('never retains the stale prose range %s after catalog reconciliation',range=>{
    const result=consistentQuoteCopy({...fallback,min:150,max:240,source:'ai',summary:range,notes:`Precio ${range}`,includes:[`Pack ${range}`],whatsappMessage:`Acepto ${range}`},fallback);
    expect(result).toMatchObject({...fallback,min:150,max:240,source:'ai'});
  });
  it('keeps useful non-monetary AI detail, including quantities and area',()=>{
    const quote={...fallback,summary:'Vivienda de 100 m² en Madrid.',includes:['15–25 fotografías y un tour virtual'],notes:'Entrega digital; disponibilidad por confirmar.'};
    expect(consistentQuoteCopy(quote,fallback)).toEqual(quote);
  });
});
