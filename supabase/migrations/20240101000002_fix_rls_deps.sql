-- Fix RLS Dependencies and Recursion

-- 1. DROP DEPENDENT POLICIES
-- We must drop these first because they use `is_org_member()`

-- Deals
drop policy if exists "Members can view deals" on deals;
drop policy if exists "Members can insert deals" on deals;
drop policy if exists "Members can update deals" on deals;
drop policy if exists "Users can view deals in their orgs" on deals;
drop policy if exists "Users can insert deals in their orgs" on deals;
drop policy if exists "Users can update deals in their orgs" on deals;

-- Kanban Columns
drop policy if exists "Members can view columns" on kanban_columns;
drop policy if exists "View columns in org" on kanban_columns;

-- Tasks
drop policy if exists "Members can view tasks" on tasks;
drop policy if exists "View tasks for accessible deals" on tasks;

-- Documents (Direct dependency via helper call in some versions, or indirect)
-- Dropping to be safe if they use is_org_member
drop policy if exists "Members can view documents" on documents;
drop policy if exists "Members can insert documents" on documents;
drop policy if exists "View documents for accessible deals" on documents;

drop policy if exists "Members can view document versions" on document_versions;
drop policy if exists "Members can insert document versions" on document_versions;
drop policy if exists "View document versions" on document_versions;

-- Org Memberships (The source of recursion)
drop policy if exists "Members can view memberships" on org_memberships;
drop policy if exists "Users can view memberships of their orgs" on org_memberships;


-- 2. FIX THE FUNCTION
-- Now we can safely drop and recreate the function
drop function if exists public.is_org_member(uuid);

create or replace function public.is_org_member(org_uuid uuid)
returns boolean
language plpgsql
security definer -- CRITICAL: This bypasses RLS to avoid infinite recursion
as $$
begin
  return exists (
    select 1
    from org_memberships
    where org_id = org_uuid
    and user_id = auth.uid()
  );
end;
$$;


-- 3. RECREATE POLICIES

-- Org Memberships (Safe non-recursive policies)
create policy "Users can view own memberships"
  on org_memberships for select
  using (auth.uid() = user_id);

create policy "Users can view team memberships"
  on org_memberships for select
  using (is_org_member(org_id));

-- Deals
create policy "Members can view deals"
  on deals for select
  using (is_org_member(org_id));

create policy "Members can insert deals"
  on deals for insert
  with check (is_org_member(org_id));

create policy "Members can update deals"
  on deals for update
  using (is_org_member(org_id));

-- Kanban Columns
create policy "Members can view columns"
  on kanban_columns for select
  using (is_org_member(org_id));

-- Tasks
create policy "Members can view tasks"
  on tasks for select
  using (is_org_member(org_id));

-- Documents
create policy "Members can view documents"
  on documents for select
  using (
      exists ( select 1 from deals where id = documents.deal_id and is_org_member(deals.org_id) )
  );

create policy "Members can insert documents"
  on documents for insert
  with check (
      exists ( select 1 from deals where id = deal_id and is_org_member(deals.org_id) )
  );

-- Document Versions
create policy "Members can view document versions"
  on document_versions for select
  using (
      exists ( select 1 from documents d join deals dl on d.deal_id = dl.id where d.id = document_versions.document_id and is_org_member(dl.org_id) )
  );

create policy "Members can insert document versions"
  on document_versions for insert
  with check (
      exists ( select 1 from documents d join deals dl on d.deal_id = dl.id where d.id = document_id and is_org_member(dl.org_id) )
  );
