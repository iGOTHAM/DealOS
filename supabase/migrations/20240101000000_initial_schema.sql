-- Enable pgvector extension
create extension if not exists vector;

-- PROFILES (Users)
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- ORGANIZATIONS
create table organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  domain text,
  firm_pov_json jsonb default '{}'::jsonb, -- For "Firm POV"
  created_at timestamptz default now()
);

alter table organizations enable row level security;

-- ORG MEMBERSHIPS
create type org_role as enum ('owner', 'admin', 'editor', 'viewer');

create table org_memberships (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references organizations(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role org_role default 'viewer',
  created_at timestamptz default now(),
  unique(org_id, user_id)
);

alter table org_memberships enable row level security;

-- Policies for Organizations
create policy "Users can view organizations they belong to" on organizations
  for select using (
    exists (
      select 1 from org_memberships om
      where om.org_id = organizations.id
      and om.user_id = auth.uid()
    )
  );

-- Policies for Memberships
create policy "Users can view memberships of their orgs" on org_memberships
  for select using (
    exists (
      select 1 from org_memberships om
      where om.org_id = org_memberships.org_id
      and om.user_id = auth.uid()
    )
  );

-- DEALS
create table deals (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  sector text,
  geography text,
  source text,
  stage text default 'Sourced',
  probability integer default 0,
  owner_id uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table deals enable row level security;

create policy "Users can view deals in their orgs" on deals
  for select using (
    exists (
      select 1 from org_memberships om
      where om.org_id = deals.org_id
      and om.user_id = auth.uid()
    )
  );

create policy "Users can insert deals in their orgs" on deals
  for insert with check (
    exists (
      select 1 from org_memberships om
      where om.org_id = deals.org_id
      and om.user_id = auth.uid()
      and om.role in ('owner', 'admin', 'editor')
    )
  );

create policy "Users can update deals in their orgs" on deals
  for update using (
    exists (
      select 1 from org_memberships om
      where om.org_id = deals.org_id
      and om.user_id = auth.uid()
      and om.role in ('owner', 'admin', 'editor')
    )
  );

-- KANBAN COLUMNS (Optional: If customization is needed per org, otherwise hardcoded in UI)
create table kanban_columns (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references organizations(id) on delete cascade not null,
  title text not null,
  position integer not null default 0,
  created_at timestamptz default now()
);

alter table kanban_columns enable row level security;

create policy "View columns in org" on kanban_columns
  for select using (
    exists (select 1 from org_memberships where org_id = kanban_columns.org_id and user_id = auth.uid())
  );

-- TASKS
create table tasks (
  id uuid default gen_random_uuid() primary key,
  deal_id uuid references deals(id) on delete cascade not null,
  title text not null,
  status text default 'todo', -- todo, in_progress, done
  assigned_to uuid references profiles(id),
  due_date timestamptz,
  created_at timestamptz default now()
);

alter table tasks enable row level security;

create policy "View tasks for accessible deals" on tasks
  for select using (
    exists (
      select 1 from deals d
      join org_memberships om on om.org_id = d.org_id
      where d.id = tasks.deal_id and om.user_id = auth.uid()
    )
  );

-- DOCUMENTS
create table documents (
  id uuid default gen_random_uuid() primary key,
  deal_id uuid references deals(id) on delete cascade not null,
  name text not null,
  type text not null, -- CIM, Financials, etc.
  created_at timestamptz default now()
);

alter table documents enable row level security;

create policy "View documents for accessible deals" on documents
  for select using (
    exists (
      select 1 from deals d
      join org_memberships om on om.org_id = d.org_id
      where d.id = documents.deal_id and om.user_id = auth.uid()
    )
  );

-- DOCUMENT VERSIONS
create table document_versions (
  id uuid default gen_random_uuid() primary key,
  document_id uuid references documents(id) on delete cascade not null,
  version_number integer not null default 1,
  file_path text not null, -- Supabase Storage path
  status text default 'uploaded', -- uploaded, parsing, chunked, embedded, ready, failed
  created_at timestamptz default now()
);

alter table document_versions enable row level security;

create policy "View document versions" on document_versions
  for select using (
    exists (
      select 1 from documents d
      join deals dl on dl.id = d.deal_id
      join org_memberships om on om.org_id = dl.org_id
      where d.id = document_versions.document_id and om.user_id = auth.uid()
    )
  );

-- DOCUMENT CHUNKS (Vector Store)
create table document_chunks (
  id uuid default gen_random_uuid() primary key,
  document_version_id uuid references document_versions(id) on delete cascade not null,
  chunk_index integer not null,
  chunk_text text not null,
  page_ref text, -- Page number, slide, sheet
  embedding vector(1536), -- OpenAI embedding size
  created_at timestamptz default now()
);

alter table document_chunks enable row level security;

create policy "View chunks" on document_chunks
  for select using (
    exists (
      select 1 from document_versions dv
      join documents d on d.id = dv.document_id
      join deals dl on dl.id = d.deal_id
      join org_memberships om on om.org_id = dl.org_id
      where dv.id = document_chunks.document_version_id and om.user_id = auth.uid()
    )
  );

-- DATASETS (Dashboards)
create table datasets (
  id uuid default gen_random_uuid() primary key,
  deal_id uuid references deals(id) on delete cascade not null,
  name text not null,
  config_json jsonb, -- Mappings: { date_col: 'A', rev_col: 'B', ... }
  created_at timestamptz default now()
);

alter table datasets enable row level security;

create policy "View datasets" on datasets
  for select using (
    exists (
      select 1 from deals d
      join org_memberships om on om.org_id = d.org_id
      where d.id = datasets.deal_id and om.user_id = auth.uid()
    )
  );

create table dataset_versions (
  id uuid default gen_random_uuid() primary key,
  dataset_id uuid references datasets(id) on delete cascade not null,
  raw_data_json jsonb, -- Storing parsed CSV/XLSX rows here for MVP. For large data, use Storage + URL.
  created_at timestamptz default now()
);

alter table dataset_versions enable row level security;

create policy "View dataset versions" on dataset_versions
  for select using (
    exists (
      select 1 from datasets ds
      join deals d on d.id = ds.deal_id
      join org_memberships om on om.org_id = d.org_id
      where ds.id = dataset_versions.dataset_id and om.user_id = auth.uid()
    )
  );

-- IC MEMOS
create table ic_memos (
  id uuid default gen_random_uuid() primary key,
  deal_id uuid references deals(id) on delete cascade not null,
  content text, -- Markdown/HTML content
  version integer default 1,
  firm_pov text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table ic_memos enable row level security;

create policy "View/Edit memos" on ic_memos
  for all using (
    exists (
      select 1 from deals d
      join org_memberships om on om.org_id = d.org_id
      where d.id = ic_memos.deal_id and om.user_id = auth.uid()
    )
  );

-- AI RUNS (Logs)
create table ai_runs (
  id uuid default gen_random_uuid() primary key,
  deal_id uuid references deals(id) on delete set null, -- Optional link
  user_id uuid references profiles(id),
  task_type text,
  model_used text,
  tokens_used integer,
  latency_ms integer,
  prompt_fragment text,
  output_fragment text,
  created_at timestamptz default now()
);

alter table ai_runs enable row level security;

create policy "View own AI runs" on ai_runs
  for select using (auth.uid() = user_id);

-- ALERTS (Monitoring)
create table alerts (
  id uuid default gen_random_uuid() primary key,
  deal_id uuid references deals(id) on delete cascade not null,
  type text default 'info', -- info, warning, critical
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table alerts enable row level security;

create policy "View alerts" on alerts
  for select using (
    exists (
      select 1 from deals d
      join org_memberships om on om.org_id = d.org_id
      where d.id = alerts.deal_id and om.user_id = auth.uid()
    )
  );

-- Handle user creation trigger to create profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

