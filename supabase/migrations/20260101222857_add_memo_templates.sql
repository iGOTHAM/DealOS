-- Create MEMO TEMPLATES table
create table memo_templates (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  description text,
  structure_json jsonb not null, -- Stores the sections and hidden questions
  tone_voice text,
  created_at timestamptz default now()
);

alter table memo_templates enable row level security;

create policy "View/Edit templates in org" on memo_templates
  for all using (
    exists (
      select 1 from org_memberships om
      where om.org_id = memo_templates.org_id
      and om.user_id = auth.uid()
    )
  );
