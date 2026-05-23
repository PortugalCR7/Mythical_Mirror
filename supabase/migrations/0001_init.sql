-- The Mythical Mirror — initial Supabase schema
-- Apply via Supabase Dashboard → SQL Editor → paste & run.

-- =========================================
-- readings table
-- =========================================
create table if not exists public.readings (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  created_at      timestamptz not null default now(),
  birth_data      jsonb not null,        -- name, date, time, location, gender (no photo)
  fingerprint     jsonb not null,
  archetype       text not null,
  profile         text,
  gift            text,
  kin             text,
  totem           text,
  cosmic_readings jsonb,
  mythopoetic_brief jsonb,
  culture         text,
  portrait_path   text                   -- path in 'portraits' bucket, e.g. "{uid}/{reading_id}.jpg"
);

create index if not exists readings_user_id_created_at_idx
  on public.readings (user_id, created_at desc);

alter table public.readings enable row level security;

drop policy if exists "Users select own readings"  on public.readings;
drop policy if exists "Users insert own readings"  on public.readings;
drop policy if exists "Users delete own readings"  on public.readings;

create policy "Users select own readings"
  on public.readings for select
  using (auth.uid() = user_id);

create policy "Users insert own readings"
  on public.readings for insert
  with check (auth.uid() = user_id);

create policy "Users delete own readings"
  on public.readings for delete
  using (auth.uid() = user_id);

-- =========================================
-- portraits storage bucket (private)
-- =========================================
insert into storage.buckets (id, name, public)
values ('portraits', 'portraits', false)
on conflict (id) do nothing;

drop policy if exists "Users read own portraits"   on storage.objects;
drop policy if exists "Users upload own portraits" on storage.objects;
drop policy if exists "Users delete own portraits" on storage.objects;

create policy "Users read own portraits"
  on storage.objects for select
  using (
    bucket_id = 'portraits'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users upload own portraits"
  on storage.objects for insert
  with check (
    bucket_id = 'portraits'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete own portraits"
  on storage.objects for delete
  using (
    bucket_id = 'portraits'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
