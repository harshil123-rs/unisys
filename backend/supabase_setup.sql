-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Reset table if exists (for clean setup)
drop table if exists documents;

-- Create a table to store your documents
create table documents (
  id bigserial primary key,
  content text, -- corresponds to 'raw_text' or chunk content
  metadata jsonb, -- filename, page number, etc.
  embedding vector(1536) -- OpenAI text-embedding-3-small has 1536 dimensions
);

-- Create a function to search for documents
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
