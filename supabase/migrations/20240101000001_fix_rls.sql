-- Fix RLS recursion on org_memberships

-- 1. Create a helper function to check membership safely (Security Definer bypassing RLS)
drop function if exists public.is_org_member(uuid);

create or replace function public.is_org_member(org_uuid uuid)
returns boolean
language plpgsql
security definer
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

-- 2. Drop the recursive policy
drop policy if exists "Users can view memberships of their orgs" on org_memberships;

-- 3. Create non-recursive policies
-- Core policy: Users can always see their own membership
create policy "Users can view own memberships"
  on org_memberships
  for select
  using (auth.uid() = user_id);

-- Secondary policy: Users can see OTHER memberships in orgs they belong to
-- This uses the security definer function to avoid the infinite loop
create policy "Users can view team memberships"
  on org_memberships
  for select
  using (is_org_member(org_id));

-- 4. Enable INSERT for authenticated users on organizations (so they can create them via RLS if we wanted, though we use Admin client now)
-- Added for completeness in case we switch back or for client-side checks
create policy "Users can create organizations"
  on organizations
  for insert
  with check (auth.uid() = auth.uid()); -- any auth user

-- 5. Fix Organizations view policy just in case (though it was likely fine)
-- The original policy was:
-- exists (select 1 from org_memberships om where om.org_id = organizations.id and om.user_id = auth.uid())
-- This is fine because it queries org_memberships which now has a safe "view own" policy.
