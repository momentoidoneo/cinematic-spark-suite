import {describe,it,expect} from 'vitest';
import {parseImageRequest} from '../../supabase/functions/_shared/aiImageRequest';
const req=(content:unknown)=>({messages:[{role:'user',content}]});
const edit=(url:string)=>req([{type:'text',text:'Preserva esta foto'}, {type:'image_url',image_url:{url}}]);
describe('independent image input boundary',()=>{
 it('accepts plain text and redacts email',()=>expect(parseImageRequest(req('Foto para test@example.com')).prompt).not.toContain('@'));
 it('accepts only the project portfolio as a reference',()=>expect(parseImageRequest(edit('https://sffgaplkqmmnikqhhftx.supabase.co/storage/v1/object/public/portfolio/photo.png')).referenceUrl).toBeTruthy());
 it.each(['http://127.0.0.1/a','https://example.com/a','https://sffgaplkqmmnikqhhftx.supabase.co.evil.test/storage/v1/object/public/portfolio/a','https://sffgaplkqmmnikqhhftx.supabase.co/storage/v1/object/public/social-media-assets/a','https://edpqywwtgoiktotxrqrz.supabase.co/storage/v1/object/public/portfolio/a','https://user:pass@sffgaplkqmmnikqhhftx.supabase.co/storage/v1/object/public/portfolio/a','https://sffgaplkqmmnikqhhftx.supabase.co/storage/v1/object/public/portfolio/%2fsecret'])('rejects untrusted reference %s',url=>expect(()=>parseImageRequest(edit(url))).toThrow());
 it('rejects empty input',()=>expect(()=>parseImageRequest(req(''))).toThrow());
 it('rejects oversized input',()=>expect(()=>parseImageRequest(req('x'.repeat(12001)))).toThrow());
 it('rejects more than one reference',()=>expect(()=>parseImageRequest(req([{type:'text',text:'x'},{type:'image_url',image_url:{url:'https://example.com/a'}},{type:'image_url',image_url:{url:'https://example.com/b'}}]))).toThrow());
});
