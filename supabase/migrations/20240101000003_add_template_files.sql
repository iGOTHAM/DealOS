-- Add file_path and type columns to memo_templates
alter table memo_templates 
add column if not exists file_path text,
add column if not exists type text default 'json', -- 'json', 'word', 'excel'
alter column structure_json drop not null;

-- Create bucket for templates if not exists
insert into storage.buckets (id, name, public)
values ('templates', 'templates', true)
on conflict (id) do nothing;

-- Values for type check
alter table memo_templates 
add constraint memo_templates_type_check 
check (type in ('json', 'word', 'excel', 'pdf'));

-- Policy for storage
create policy "Authenticated users can upload templates"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'templates' );

create policy "Authenticated users can read templates"
on storage.objects for select
to authenticated
using ( bucket_id = 'templates' );
