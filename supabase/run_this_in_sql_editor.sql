create table if not exists memo_templates (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  description text,
  structure_json jsonb not null,
  tone_voice text,
  created_at timestamptz default now()
);

alter table memo_templates enable row level security;

create policy view_edit_templates_in_org on memo_templates
  for all using (
    exists (
      select 1 from org_memberships om
      where om.org_id = memo_templates.org_id
      and om.user_id = auth.uid()
    )
  );

INSERT INTO organizations (id, name, slug, firm_pov)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Acme Capital', 'acme-capital', 'We prefer B2B SaaS')
ON CONFLICT (id) DO NOTHING;

NOTIFY pgrst, 'reload config';
