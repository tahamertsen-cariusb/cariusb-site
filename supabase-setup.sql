-- Supabase SQL Editor'a çalıştırılacak SQL

-- profiles tablosu oluştur
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  plan text not null default 'free',
  created_at timestamptz not null default now()
);

-- RLS etkinleştir
alter table public.profiles enable row level security;

-- RLS policy'leri oluştur
create policy "read own" on public.profiles for select using (auth.uid() = user_id);
create policy "insert self" on public.profiles for insert with check (true);
create policy "update own" on public.profiles for update using (auth.uid() = user_id);





