-- Match documents function
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_deal_id uuid
)
returns table (
  id uuid,
  content text,
  similarity float,
  document_name text,
  page_ref text
)
language plpgsql
as $$
begin
  return query
  select
    dc.id,
    dc.chunk_text as content,
    1 - (dc.embedding <=> query_embedding) as similarity,
    d.name as document_name,
    dc.page_ref
  from document_chunks dc
  join document_versions dv on dc.document_version_id = dv.id
  join documents d on dv.document_id = d.id
  where 1 - (dc.embedding <=> query_embedding) > match_threshold
  and d.deal_id = filter_deal_id
  order by dc.embedding <=> query_embedding
  limit match_count;
end;
$$;
