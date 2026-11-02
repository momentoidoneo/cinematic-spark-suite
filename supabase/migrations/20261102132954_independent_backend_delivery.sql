-- Target-only migration. Do not run against the Lovable source.
create table public.owner_notifications (
  id uuid primary key default gen_random_uuid(),
  lead_type text not null check (lead_type in ('contact','quote')),
  lead_id uuid not null,
  state text not null default 'pending' check (state in ('pending','sending','sent','failed','unknown')),
  attempts integer not null default 0,
  provider_message_id text,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(lead_type,lead_id)
);
alter table public.owner_notifications enable row level security;
revoke all on public.owner_notifications from anon, authenticated;
grant all on public.owner_notifications to service_role;
grant select on public.owner_notifications to authenticated;
create policy "Admins read delivery status" on public.owner_notifications for select to authenticated
  using (public.has_role(auth.uid(),'admin'));
create function public.enqueue_owner_notification() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.owner_notifications(lead_type,lead_id)
    values (case when TG_TABLE_NAME='contact_messages' then 'contact' else 'quote' end,NEW.id);
  return NEW;
end $$;
revoke all on function public.enqueue_owner_notification() from public,anon,authenticated;
create trigger enqueue_contact_notice after insert on public.contact_messages
  for each row execute function public.enqueue_owner_notification();
create trigger enqueue_quote_notice after insert on public.quote_requests
  for each row execute function public.enqueue_owner_notification();
-- All public writes go through the validated/rate-limited functions.
revoke insert on public.contact_messages, public.quote_requests from anon;
revoke execute on function public.handle_new_user() from public,anon,authenticated;

create table public.ai_quote_jobs (
  id uuid primary key default gen_random_uuid(),
  state text not null default 'pending' check(state in ('pending','running','complete','failed','expired')),
  messages jsonb not null,
  result jsonb,
  error_code text,
  lease_id uuid,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now()+interval '70 seconds',
  completed_at timestamptz
);
create index ai_quote_jobs_pending on public.ai_quote_jobs(created_at) where state='pending';
alter table public.ai_quote_jobs enable row level security;
revoke all on public.ai_quote_jobs from anon,authenticated;
grant all on public.ai_quote_jobs to service_role;
create table public.ai_worker_credentials (
  id text primary key check(id='silviocosta-net'),
  token_sha256 text not null check(length(token_sha256)=64),
  enabled boolean not null default true,
  last_seen_at timestamptz
);
alter table public.ai_worker_credentials enable row level security;
revoke all on public.ai_worker_credentials from anon,authenticated;
grant all on public.ai_worker_credentials to service_role;
create function public.claim_ai_quote_job() returns setof public.ai_quote_jobs language sql security invoker set search_path='' as $$
  update public.ai_quote_jobs set state='running',lease_id=gen_random_uuid()
  where id=(select id from public.ai_quote_jobs where state='pending' and expires_at>now()
    order by created_at for update skip locked limit 1) returning *;
$$;
revoke all on function public.claim_ai_quote_job() from public,anon,authenticated;
grant execute on function public.claim_ai_quote_job() to service_role;

create table public.web_request_limits (
  bucket text primary key,
  window_start timestamptz not null,
  hits integer not null
);
alter table public.web_request_limits enable row level security;
revoke all on public.web_request_limits from anon,authenticated;
grant all on public.web_request_limits to service_role;
create function public.allow_web_request(p_bucket text,p_limit integer) returns boolean
language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
  insert into public.web_request_limits(bucket,window_start,hits) values(p_bucket,date_trunc('hour',now()),1)
  on conflict(bucket) do update set
    hits=case when public.web_request_limits.window_start=date_trunc('hour',now()) then public.web_request_limits.hits+1 else 1 end,
    window_start=date_trunc('hour',now()) returning hits into n;
  return n<=p_limit;
end $$;
revoke all on function public.allow_web_request(text,integer) from public,anon,authenticated;
grant execute on function public.allow_web_request(text,integer) to service_role;
