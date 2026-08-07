create table if not exists public.content_universe_workspaces (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.content_universe_workspaces enable row level security;

-- API của ứng dụng chạy phía server. Khuyên dùng SUPABASE_SERVICE_ROLE_KEY trên Vercel.
-- Không đưa service role key vào biến NEXT_PUBLIC_*.
