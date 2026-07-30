create extension if not exists "pgcrypto";

create table if not exists public.stories (
 id uuid primary key default gen_random_uuid(),
 user_id uuid references auth.users(id) on delete cascade default auth.uid(),
 title text not null,
 theme text,
 status text default 'draft' check (status in ('draft','posted')),
 content text not null,
 created_at timestamptz default now()
);

create table if not exists public.hooks (
 id uuid primary key default gen_random_uuid(),
 user_id uuid references auth.users(id) on delete cascade default auth.uid(),
 theme text,
 text text not null,
 created_at timestamptz default now()
);

create table if not exists public.formulas (
 id uuid primary key default gen_random_uuid(),
 user_id uuid references auth.users(id) on delete cascade default auth.uid(),
 name text not null,
 category text,
 template text not null,
 created_at timestamptz default now()
);

alter table public.stories enable row level security;
alter table public.hooks enable row level security;
alter table public.formulas enable row level security;

create policy "stories own rows" on public.stories for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "hooks own rows" on public.hooks for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "formulas own rows" on public.formulas for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
