import {beforeEach,afterEach,describe,it,expect,vi} from 'vitest';
const {invoke}=vi.hoisted(()=>({invoke:vi.fn()}));
vi.mock('@/integrations/supabase/client',()=>({supabase:{functions:{invoke}}}));
import {invokeAdminAi} from '@/lib/adminAiOperation';
beforeEach(()=>{vi.useFakeTimers();invoke.mockReset();const values=new Map<string,string>();vi.stubGlobal('localStorage',{getItem:(k:string)=>values.get(k)||null,setItem:(k:string,v:string)=>values.set(k,v),removeItem:(k:string)=>values.delete(k)});});
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();});
describe('durable admin client',()=>{
 it('submits once then polls the same id',async()=>{
  invoke.mockImplementation(async(name,options)=>name==='generate-thumbnail'?{data:{operationId:options.headers['x-sc-operation-id']},error:null}:{data:{state:'complete',result:{images:[{imageURL:'result'}]}},error:null});
  const result=invokeAdminAi('generate-thumbnail',{body:{numberResults:1}});await vi.advanceTimersByTimeAsync(3000);
  expect((await result).data.images).toHaveLength(1);expect(invoke).toHaveBeenCalledTimes(2);expect(invoke.mock.calls[1][1].body.id).toBe(localStorage.getItem('sc-admin-ai-last-operation'));
 });
 it('does not retry ambiguous initial submission',async()=>{
  invoke.mockResolvedValue({error:new Error('network')});const result=await invokeAdminAi('generate-thumbnail',{body:{numberResults:1}});
  expect(result.error?.message).toContain('comprueba');expect(invoke).toHaveBeenCalledTimes(1);expect(localStorage.getItem('sc-admin-ai-last-operation')).toBeTruthy();
 });
 it('does not regenerate on an unknown provider outcome',async()=>{
  invoke.mockImplementation(async(name,options)=>name==='generate-thumbnail'?{data:{operationId:options.headers['x-sc-operation-id']},error:null}:{data:{state:'unknown'},error:null});
  const result=invokeAdminAi('generate-thumbnail',{body:{numberResults:1}});await vi.advanceTimersByTimeAsync(3000);expect((await result).error?.message).toContain('No repitas');expect(invoke.mock.calls.filter(([name])=>name==='generate-thumbnail')).toHaveLength(1);
 });
});
