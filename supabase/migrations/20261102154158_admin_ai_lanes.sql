-- Target only. Keep the existing public quote schema and isolate admin jobs.
alter table public.ai_quote_jobs add column task_type text not null default 'quote' check(task_type in ('quote','admin_text'));
create or replace function public.claim_ai_quote_job() returns setof public.ai_quote_jobs language sql security invoker set search_path='' as $$
 update public.ai_quote_jobs set state='running',lease_id=gen_random_uuid()
 where id=(select id from public.ai_quote_jobs where state='pending' and task_type='quote' and expires_at>now()
 order by created_at for update skip locked limit 1) returning *;
$$;
create function public.claim_ai_admin_job() returns setof public.ai_quote_jobs language sql security invoker set search_path='' as $$
 update public.ai_quote_jobs set state='running',lease_id=gen_random_uuid()
 where id=(select id from public.ai_quote_jobs where state='pending' and task_type='admin_text' and expires_at>now()
 order by created_at for update skip locked limit 1) returning *;
$$;
revoke all on function public.claim_ai_admin_job() from public,anon,authenticated;
grant execute on function public.claim_ai_admin_job() to service_role;
