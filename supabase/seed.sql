
-- Create a default organization
INSERT INTO organizations (name, slug)
VALUES ('Acme Capital', 'acme-capital');

-- Get the organization ID (assuming it's the first one, or use a specific UUID if known)
-- For seeding, we often use fixed UUIDs to reference them.
-- Let's use a fixed UUID for org: 00000000-0000-0000-0000-000000000001 (if valid uuid)
-- Or just rely on serial or dynamic fetch if writing a script.
-- Supabase seed.sql runs SQL.

-- Let's just insert with specific IDs for relation integrity.
-- Organization
INSERT INTO organizations (id, name, slug)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Acme Capital', 'acme-capital')
ON CONFLICT DO NOTHING;

-- Profile (You normally create this via Auth, but we can seed one linked to a fake user ID)
-- We'll skip profile seeding as it requires linking to auth.users which is protected.
-- The user will create their own account.

-- Kanban Columns for the Org
INSERT INTO kanban_columns (id, org_id, title, "order")
VALUES 
('c101', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Sourced', 0),
('c102', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Evaluation', 1),
('c103', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Due Diligence', 2),
('c104', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'IC Review', 3),
('c105', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Closed', 4)
ON CONFLICT DO NOTHING;

-- Deals
INSERT INTO deals (id, org_id, name, sector, geography, source, probability, stage, description)
VALUES
('d101', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'TechFlow SaaS', 'Software', 'North America', 'Proprietary', 60, 'Evaluation', 'High growth B2B SaaS platform for workflow automation.'),
('d102', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'GreenEnergy Co', 'Energy', 'Europe', 'Broker', 20, 'Sourced', 'Renewable energy infrastructure project.'),
('d103', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'MediCare Plus', 'Healthcare', 'Asia', 'Inbound', 80, 'Due Diligence', 'Chain of specialized clinics expanding rapidly.')
ON CONFLICT DO NOTHING;

-- Tasks
INSERT INTO tasks (org_id, deal_id, title, status)
VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd101', 'Review CIM', 'pending'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd101', 'Schedule Mgmt Call', 'pending')
ON CONFLICT DO NOTHING;
