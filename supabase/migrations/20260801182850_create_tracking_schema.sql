create extension if not exists pgcrypto;

create table public.sites (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    
    domain text not null,
    created_at timestamptz not null default now(),

    unique (user_id, domain)
);

create table public.crawler_events(
    id uuid primary key default gen_random_uuid(),
    site_id uuid not null references public.sites(id) on delete cascade,
    received_at timestamptz not null default now(),
    user_agent text not null,
    bot_name varchar(100),
    platform varchar(50),
    bot_type varchar(20) not null default 'unknown',
    page_url text not null,
    page_path text,
    ip_hash varchar(64),

    constraint valid_bot_type check (
        bot_type in ('training', 'search', 'assistant', 'dataset', 'unknown')
    )
);

create index idx_events_site_time on public.crawler_events(site_id, received_at desc);

create index idx_events_site_platform on public.crawler_events(site_id, platform);

alter table public.sites enable row level security;
alter table public.crawler_events enable row level security;

create policy "Users can view own sites"
on public.sites
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create own sites"
on public.sites
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can view own events"
on public.crawler_events
for select 
to authenticated
using (
    exists (
        select 1
        from public.sites
        where sites.id = crawler_events.site_id
        and sites.user_id = auth.uid()
    )
);

-- Grants for service_role (used by edge functions)
grant all on public.crawler_events to service_role;
grant all on public.sites to service_role;

-- Grants for authenticated users (used by dashboard)
grant select, insert on public.sites to authenticated;
grant select on public.crawler_events to authenticated;