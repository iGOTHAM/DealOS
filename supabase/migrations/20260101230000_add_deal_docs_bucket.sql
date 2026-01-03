-- Create bucket for deal documents if not exists
insert into storage.buckets (id, name, public)
values ('deal_documents', 'deal_documents', false) -- Private by default
on conflict (id) do nothing;

-- Policy for uploading deal documents
create policy "Authenticated users can upload deal docs" on storage.objects 
for insert to authenticated
with check ( bucket_id = 'deal_documents' );

-- Policy for reading deal documents
create policy "Authenticated users can read deal docs" on storage.objects 
for select to authenticated
using ( bucket_id = 'deal_documents' );

-- Note: In a real prod app, we'd add RLS to check deal access, but for now auth-only is accepted
