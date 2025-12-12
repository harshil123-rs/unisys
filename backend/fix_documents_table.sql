-- Enable pgvector extension
create extension if not exists vector;

-- Create documents table if not exists
create table if not exists documents (
  id bigserial primary key,
  content text,
  metadata jsonb,
  embedding vector(1536) -- OpenAI embedding size
);

-- Create a function to search documents
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
