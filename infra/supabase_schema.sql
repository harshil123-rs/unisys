-- Supabase SQL: create tables for LogiAssist (run in Supabase SQL editor)
create table users (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique,
  role text,
  created_at timestamptz default now()
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references users(id),
  filename text,
  source_type text,
  raw_text text,
  uploaded_at timestamptz default now()
);

-- Requires pgvector extension or Supabase vector support
-- For demo we store embeddings as json
create table chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id),
  text text,
  embedding jsonb,
  chunk_index int,
  meta jsonb
);

create table shipments (
  id uuid primary key default gen_random_uuid(),
  tracking_id text,
  carrier text,
  status text,
  last_update timestamptz,
  metadata jsonb
);

create table queries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  query_text text,
  language text,
  response_text text,
  source_chunks jsonb,
  created_at timestamptz default now()
);
