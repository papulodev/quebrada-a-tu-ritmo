-- Schema for the notes feature. Idempotent so it can be applied repeatedly.
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  content text not null check (char_length(btrim(content)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists notes_user_created_at_idx
  on public.notes (user_id, created_at desc);
