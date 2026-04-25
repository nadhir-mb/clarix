-- Run this in the Supabase SQL editor to set up Clarix

-- Profiles (synced with auth.users via trigger)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  organization text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, organization)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'organization'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Connectors (webhook endpoints per user)
create table if not exists public.connectors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null default 'webhook',
  webhook_secret text not null,
  created_at timestamptz default now()
);

alter table public.connectors enable row level security;

create policy "Users manage own connectors"
  on public.connectors for all
  using (auth.uid() = user_id);

-- Decisions
create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  connector_id uuid references public.connectors(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'pending'
    check (status in ('approved', 'rejected', 'pending', 'flagged')),
  category text not null default 'other'
    check (category in ('loan', 'compliance', 'transaction', 'risk', 'kyc', 'other')),
  amount numeric,
  currency text default 'USD',
  ai_summary text,
  raw_payload jsonb not null default '{}',
  created_at timestamptz default now()
);

alter table public.decisions enable row level security;

create policy "Users view own decisions"
  on public.decisions for select
  using (auth.uid() = user_id);

create policy "Service role can insert decisions"
  on public.decisions for insert
  with check (true);

-- Index for fast feed queries
create index if not exists decisions_user_created_at
  on public.decisions(user_id, created_at desc);
