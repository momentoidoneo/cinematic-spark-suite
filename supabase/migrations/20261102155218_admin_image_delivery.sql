-- Target-only durable admin operations and a separate image worker lane.
alter table public.ai_quote_jobs drop constraint ai_quote_jobs_task_type_check;
alter table public.ai_quote_jobs add constraint ai_quote_jobs_task_type_check check(task_type in ('quote','admin_text','image'));
create function public.claim_ai_image_job() returns setof public.ai_quote_jobs language sql security invoker set search_path='' as $$
 update public.ai_quote_jobs set state='running',lease_id=gen_random_uuid()
 where id=(select id from public.ai_quote_jobs where state='pending' and task_type='image' and expires_at>now()
 order by created_at for update skip locked limit 1) returning *;
$$;
revoke all on function public.claim_ai_image_job() from public,anon,authenticated;
grant execute on function public.claim_ai_image_job() to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('ai-generated-private','ai-generated-private',false,12582912,array['image/png']);
create table public.admin_ai_operations (
 id uuid primary key,
 user_id uuid not null references auth.users(id),
 function_name text not null check(function_name in ('generate-covers','generate-gallery','generate-thumbnail','generate-social-from-portfolio','generate-social-content')),
 request_hash text not null,
 state text not null default 'running' check(state in ('running','complete','failed','unknown')),
 result jsonb,
 created_at timestamptz not null default now(),
 completed_at timestamptz
);
alter table public.admin_ai_operations enable row level security;
revoke all on public.admin_ai_operations from anon,authenticated;
grant all on public.admin_ai_operations to service_role;
grant select on public.admin_ai_operations to authenticated;
create policy "Owner admin reads own AI operations" on public.admin_ai_operations for select to authenticated using(user_id=auth.uid() and public.has_role(auth.uid(),'admin'));
