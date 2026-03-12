
-- Secrets table
CREATE TABLE public.secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  value_hint text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used timestamptz,
  used_by integer NOT NULL DEFAULT 0
);
ALTER TABLE public.secrets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to secrets" ON public.secrets FOR ALL TO public USING (true) WITH CHECK (true);

-- Integrations table
CREATE TABLE public.integrations (
  id text PRIMARY KEY,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'disconnected',
  icon text NOT NULL DEFAULT 'key',
  connected_at text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to integrations" ON public.integrations FOR ALL TO public USING (true) WITH CHECK (true);

-- Settings table
CREATE TABLE public.settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to settings" ON public.settings FOR ALL TO public USING (true) WITH CHECK (true);

-- Seed default integrations
INSERT INTO public.integrations (id, name, status, icon) VALUES
  ('github', 'GitHub', 'disconnected', 'github'),
  ('telegram', 'Telegram', 'disconnected', 'message-square'),
  ('discord', 'Discord', 'disconnected', 'message-circle'),
  ('slack', 'Slack', 'disconnected', 'hash'),
  ('openclaw', 'OpenClaw', 'disconnected', 'hexagon');

-- Seed default settings
INSERT INTO public.settings (key, value) VALUES
  ('name', 'clawos-prod'),
  ('endpoint', 'https://api.clawos.io'),
  ('retention', '30 days'),
  ('autorestart', 'true'),
  ('notifications', 'true'),
  ('analytics', 'false');
