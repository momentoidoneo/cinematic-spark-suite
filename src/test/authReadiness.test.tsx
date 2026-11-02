import {act,cleanup,render,screen} from '@testing-library/react';
import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
const mocks=vi.hoisted(()=>({callback:null as any,getSession:vi.fn(),role:vi.fn(),unsubscribe:vi.fn()}));
vi.mock('@/integrations/supabase/client',()=>({supabase:{
 auth:{onAuthStateChange:(callback:any)=>{mocks.callback=callback;return {data:{subscription:{unsubscribe:mocks.unsubscribe}}};},getSession:mocks.getSession},
 from:()=>({select:()=>({eq:()=>({eq:()=>({maybeSingle:mocks.role})})})}),
}}));
import {AuthProvider,useAuth} from '@/contexts/AuthContext';
function Status(){const {user,isAdmin,loading}=useAuth();return <output>{JSON.stringify({user:user?.id??null,isAdmin,loading})}</output>;}
const session={user:{id:'owner'}};
const state=()=>JSON.parse(screen.getByRole('status').textContent!);
beforeEach(()=>{vi.useFakeTimers();mocks.getSession.mockReset();mocks.role.mockReset();mocks.getSession.mockImplementation(()=>new Promise(()=>{}));});
afterEach(()=>{cleanup();vi.useRealTimers();});
describe('admin session readiness',()=>{
 it('keeps protected routes loading until the role is verified',async()=>{
  let resolve:any;mocks.role.mockImplementation(()=>new Promise(r=>resolve=r));
  render(<AuthProvider><Status/></AuthProvider>);
  act(()=>mocks.callback('INITIAL_SESSION',session));
  await act(async()=>{await vi.advanceTimersByTimeAsync(0);});
  expect(state()).toEqual({user:'owner',isAdmin:false,loading:true});
  await act(async()=>resolve({data:{role:'admin'},error:null}));
  expect(state()).toEqual({user:'owner',isAdmin:true,loading:false});
 });
 it('ignores a role result arriving after sign-out',async()=>{
  let resolve:any;mocks.role.mockImplementation(()=>new Promise(r=>resolve=r));
  render(<AuthProvider><Status/></AuthProvider>);
  act(()=>mocks.callback('SIGNED_IN',session));
  await act(async()=>{await vi.advanceTimersByTimeAsync(0);});
  act(()=>mocks.callback('SIGNED_OUT',null));
  await act(async()=>resolve({data:{role:'admin'},error:null}));
  expect(state()).toEqual({user:null,isAdmin:false,loading:false});
 });
 it('fails closed when a restored session has no verified role',async()=>{
  mocks.getSession.mockResolvedValue({data:{session}});mocks.role.mockResolvedValue({data:null,error:new Error('role unavailable')});
  render(<AuthProvider><Status/></AuthProvider>);
  await act(async()=>{await Promise.resolve();await vi.advanceTimersByTimeAsync(0);});
  expect(state()).toEqual({user:'owner',isAdmin:false,loading:false});
 });
});
