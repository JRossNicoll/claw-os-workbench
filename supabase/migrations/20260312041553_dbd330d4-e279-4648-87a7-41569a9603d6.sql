
-- Create agents table
CREATE TABLE public.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  type text NOT NULL CHECK (type IN ('autonomous', 'reactive', 'scheduled')),
  status text NOT NULL DEFAULT 'idle' CHECK (status IN ('active', 'idle', 'error', 'stopped')),
  engine text NOT NULL DEFAULT '',
  last_run text,
  total_runs integer NOT NULL DEFAULT 0,
  success_rate numeric NOT NULL DEFAULT 0,
  memory text,
  model text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create automations table
CREATE TABLE public.automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
  trigger text NOT NULL DEFAULT 'Manual',
  created_at timestamptz NOT NULL DEFAULT now(),
  last_run text,
  total_runs integer NOT NULL DEFAULT 0
);

-- Create automation steps table
CREATE TABLE public.automation_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id uuid NOT NULL REFERENCES public.automations(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('success', 'running', 'failed', 'pending', 'skipped')),
  duration text,
  condition text,
  retry_config jsonb,
  step_order integer NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_steps ENABLE ROW LEVEL SECURITY;

-- Permissive policies (no auth in this app)
CREATE POLICY "Allow all access to agents" ON public.agents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to automations" ON public.automations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to automation_steps" ON public.automation_steps FOR ALL USING (true) WITH CHECK (true);

-- Seed agents
INSERT INTO public.agents (name, description, type, status, engine, last_run, total_runs, success_rate, model) VALUES
  ('Market Sentinel', 'Monitors cryptocurrency markets and sends alerts on significant price movements', 'autonomous', 'active', 'langchain', '2 min ago', 1247, 99.2, 'gpt-4o-mini'),
  ('Code Reviewer', 'Automatically reviews pull requests and suggests improvements', 'reactive', 'active', 'crewai', '15 min ago', 384, 96.8, 'claude-3.5-sonnet'),
  ('Infra Guardian', 'Watches infrastructure health and auto-remediates common failures', 'autonomous', 'idle', 'autogen', '1h ago', 892, 98.1, 'gpt-4o'),
  ('Report Generator', 'Generates daily analytics reports from multiple data sources', 'scheduled', 'active', 'dify', '6h ago', 156, 100, 'gpt-4o-mini'),
  ('Security Scanner', 'Scans repositories and infrastructure for vulnerabilities', 'scheduled', 'error', 'playwright', '3h ago', 78, 92.3, 'gpt-4o');

-- Seed automations
INSERT INTO public.automations (id, name, description, status, trigger, created_at, last_run, total_runs) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Website Health Check', 'Monitor critical endpoints every 5 minutes and alert on failures', 'active', 'Every 5 min', now() - interval '14 days', '3 min ago', 4032),
  ('a1000000-0000-0000-0000-000000000002', 'Daily Data Pipeline', 'Aggregate metrics from all sources and generate reports', 'active', 'Daily 6:00 AM', now() - interval '30 days', '6h ago', 31),
  ('a1000000-0000-0000-0000-000000000003', 'GitHub PR Watcher', 'Monitor repositories for new PRs and run automated review', 'active', 'Webhook', now() - interval '7 days', '22 min ago', 67),
  ('a1000000-0000-0000-0000-000000000004', 'Backup & Snapshot', 'Nightly database backup with verification', 'inactive', 'Daily 2:00 AM', now() - interval '21 days', '2 days ago', 14);

-- Seed automation steps
INSERT INTO public.automation_steps (automation_id, name, status, duration, condition, step_order) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Ping endpoints', 'success', '1.2s', NULL, 0),
  ('a1000000-0000-0000-0000-000000000001', 'Check response codes', 'success', '0.3s', NULL, 1),
  ('a1000000-0000-0000-0000-000000000001', 'Validate SSL certificates', 'success', '0.8s', NULL, 2),
  ('a1000000-0000-0000-0000-000000000001', 'Send alert if degraded', 'skipped', NULL, 'status != 200', 3),
  ('a1000000-0000-0000-0000-000000000002', 'Fetch API metrics', 'success', '4.2s', NULL, 0),
  ('a1000000-0000-0000-0000-000000000002', 'Query database stats', 'success', '2.1s', NULL, 1),
  ('a1000000-0000-0000-0000-000000000002', 'Aggregate & transform', 'success', '1.8s', NULL, 2),
  ('a1000000-0000-0000-0000-000000000002', 'Generate PDF report', 'success', '3.5s', NULL, 3),
  ('a1000000-0000-0000-0000-000000000002', 'Send via email', 'success', '0.9s', NULL, 4),
  ('a1000000-0000-0000-0000-000000000003', 'Receive webhook event', 'success', '0.1s', NULL, 0),
  ('a1000000-0000-0000-0000-000000000003', 'Fetch PR diff', 'success', '1.4s', NULL, 1),
  ('a1000000-0000-0000-0000-000000000003', 'Run AI code review', 'success', '8.2s', NULL, 2),
  ('a1000000-0000-0000-0000-000000000003', 'Post review comments', 'success', '0.6s', NULL, 3),
  ('a1000000-0000-0000-0000-000000000004', 'Create database dump', 'pending', NULL, NULL, 0),
  ('a1000000-0000-0000-0000-000000000004', 'Compress archive', 'pending', NULL, NULL, 1),
  ('a1000000-0000-0000-0000-000000000004', 'Upload to MinIO', 'pending', NULL, NULL, 2),
  ('a1000000-0000-0000-0000-000000000004', 'Verify integrity', 'pending', NULL, NULL, 3);

-- Add retry_config for specific steps
UPDATE public.automation_steps SET retry_config = '{"maxRetries": 2, "delay": "5s"}'::jsonb WHERE automation_id = 'a1000000-0000-0000-0000-000000000003' AND name = 'Run AI code review';
