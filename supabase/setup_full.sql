-- Enable vector extension
create extension if not exists vector;

-- Create tables
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

create table organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  firm_pov text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table org_memberships (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references organizations(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text check (role in ('owner', 'admin', 'editor', 'viewer')) default 'viewer',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(org_id, user_id)
);

create table deals (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  description text,
  sector text,
  geography text,
  source text,
  stage text default 'Sourced',
  probability integer default 0,
  deal_size numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table kanban_columns (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references organizations(id) on delete cascade not null,
  title text not null,
  "order" integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table tasks (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references organizations(id) on delete cascade not null,
  deal_id uuid references deals(id) on delete cascade,
  title text not null,
  status text default 'pending', -- pending, in-progress, done
  assignee_id uuid references profiles(id),
  due_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table documents (
  id uuid default gen_random_uuid() primary key,
  deal_id uuid references deals(id) on delete cascade not null,
  name text not null,
  type text, -- 'financials', 'legal', 'cim', etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table document_versions (
  id uuid default gen_random_uuid() primary key,
  document_id uuid references documents(id) on delete cascade not null,
  version_number integer not null,
  file_path text not null, -- Supabase Storage path
  status text default 'processing', -- processing, ready, error
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table document_chunks (
  id uuid default gen_random_uuid() primary key,
  document_version_id uuid references document_versions(id) on delete cascade not null,
  content text,
  embedding vector(1536), -- OpenAI embedding size
  page_number integer,
  chunk_index integer,
  metadata jsonb
);

create table ic_memos (
  id uuid default gen_random_uuid() primary key,
  deal_id uuid references deals(id) on delete cascade not null,
  content text, -- Markdown/HTML content
  version integer default 1,
  firm_pov text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table ai_runs (
  id uuid default gen_random_uuid() primary key,
    task_type text, -- 'chat', 'memo', 'analysis'
    model text,
    tokens_used integer,
    prompt_fragment text,
    output_fragment text,
    created_at timestamptz default now()
);

create table alerts (
    id uuid default gen_random_uuid() primary key,
    deal_id uuid references deals(id) on delete cascade,
    message text,
    is_read boolean default false,
    created_at timestamptz default now()
);

-- RLS Setup
alter table profiles enable row level security;
alter table organizations enable row level security;
alter table org_memberships enable row level security;
alter table deals enable row level security;
alter table kanban_columns enable row level security;
alter table tasks enable row level security;
alter table documents enable row level security;
alter table document_versions enable row level security;
alter table document_chunks enable row level security;
alter table ic_memos enable row level security;
alter table ai_runs enable row level security;
alter table alerts enable row level security;

-- Policies (Simplified for MVP: "If you are a member of the org, you can see everything")

-- Helper function to check org membership
create or replace function is_org_member(_org_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from org_memberships
    where org_id = _org_id
    and user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- Profiles: Users can read all profiles (for simple collaboration) but only edit their own
create policy "Public profiles are viewable by everyone" on profiles
  for select using ( true );

create policy "Users can insert their own profile" on profiles
  for insert with check ( auth.uid() = id );

create policy "Users can update own profile" on profiles
  for update using ( auth.uid() = id );

-- Organizations: Visible if member
create policy "Members can view organizations" on organizations
  for select using (
    exists (
      select 1 from org_memberships
      where org_id = organizations.id
      and user_id = auth.uid()
    )
  );

-- Org Memberships: Visible if member of the org OR if it's your own membership
create policy "Members can view memberships" on org_memberships
  for select using (
    auth.uid() = user_id OR
    exists (
      select 1 from org_memberships om
      where om.org_id = org_memberships.org_id
      and om.user_id = auth.uid()
    )
  );

-- Deals
create policy "Members can view deals" on deals
  for select using ( is_org_member(org_id) );
create policy "Members can insert deals" on deals
  for insert with check ( is_org_member(org_id) );
create policy "Members can update deals" on deals
  for update using ( is_org_member(org_id) );

-- Kanban Columns
create policy "Members can view columns" on kanban_columns
  for select using ( is_org_member(org_id) );

-- Tasks
create policy "Members can view tasks" on tasks
  for select using ( is_org_member(org_id) );

-- Documents & Versions
create policy "Members can view documents" on documents
  for select using (
      exists ( select 1 from deals where id = documents.deal_id and is_org_member(deals.org_id) )
  );
create policy "Members can insert documents" on documents
    for insert with check (
        exists ( select 1 from deals where id = deal_id and is_org_member(deals.org_id) )
    );

create policy "Members can view document versions" on document_versions
  for select using (
      exists ( select 1 from documents d join deals dl on d.deal_id = dl.id where d.id = document_versions.document_id and is_org_member(dl.org_id) )
  );
create policy "Members can insert document versions" on document_versions
    for insert with check (
        exists ( select 1 from documents d join deals dl on d.deal_id = dl.id where d.id = document_id and is_org_member(dl.org_id) )
    );
    
-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Bucket for storage
insert into storage.buckets (id, name, public) values ('deal-docs', 'deal-docs', false) on conflict do nothing;

create policy "Org members can read deal docs"
on storage.objects for select
using ( bucket_id = 'deal-docs' AND auth.role() = 'authenticated' ); -- Simplified for MVP

create policy "Org members can upload deal docs"
on storage.objects for insert
with check ( bucket_id = 'deal-docs' AND auth.role() = 'authenticated' );

-- Create a default organization
INSERT INTO organizations (name, slug, firm_pov)
VALUES ('Acme Capital', 'acme-capital', 'We prefer B2B SaaS with high retention and clear path to profitability.');

-- Get theorganization ID for seeding
INSERT INTO organizations (id, name, slug)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Acme Capital', 'acme-capital')
ON CONFLICT DO NOTHING;

-- Kanban Columns for the Org
-- Corrected UUIDs
INSERT INTO kanban_columns (id, org_id, title, "order")
VALUES 
('00000000-0000-0000-0000-00000000c101', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Sourced', 0),
('00000000-0000-0000-0000-00000000c102', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Evaluation', 1),
('00000000-0000-0000-0000-00000000c103', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Due Diligence', 2),
('00000000-0000-0000-0000-00000000c104', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'IC Review', 3),
('00000000-0000-0000-0000-00000000c105', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Closed', 4)
ON CONFLICT DO NOTHING;

-- Deals
-- Corrected UUIDs
INSERT INTO deals (id, org_id, name, sector, geography, source, probability, stage, description)
VALUES
('00000000-0000-0000-0000-00000000d101', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'TechFlow SaaS', 'Software', 'North America', 'Proprietary', 60, 'Evaluation', 'High growth B2B SaaS platform for workflow automation.'),
('00000000-0000-0000-0000-00000000d102', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'GreenEnergy Co', 'Energy', 'Europe', 'Broker', 20, 'Sourced', 'Renewable energy infrastructure project.'),
('00000000-0000-0000-0000-00000000d103', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'MediCare Plus', 'Healthcare', 'Asia', 'Inbound', 80, 'Due Diligence', 'Chain of specialized clinics expanding rapidly.')
ON CONFLICT DO NOTHING;

-- Tasks
-- Corrected referencing Deal UUID
INSERT INTO tasks (org_id, deal_id, title, status)
VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '00000000-0000-0000-0000-00000000d101', 'Review CIM', 'pending'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '00000000-0000-0000-0000-00000000d101', 'Schedule Mgmt Call', 'pending')
ON CONFLICT DO NOTHING;
