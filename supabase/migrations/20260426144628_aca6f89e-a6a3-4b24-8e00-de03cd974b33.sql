
ALTER TABLE public.automation_steps
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'log',
  ADD COLUMN IF NOT EXISTS config jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS public.step_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL,
  step_id uuid,
  step_order integer NOT NULL DEFAULT 0,
  name text NOT NULL DEFAULT '',
  kind text NOT NULL DEFAULT 'log',
  status text NOT NULL DEFAULT 'pending',
  output jsonb,
  error text,
  duration_ms integer,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS step_runs_run_id_idx ON public.step_runs(run_id);

ALTER TABLE public.step_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to step_runs" ON public.step_runs;
CREATE POLICY "Allow all access to step_runs" ON public.step_runs FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL,
  role text NOT NULL,
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chat_messages_agent_idx ON public.chat_messages(agent_id, created_at);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to chat_messages" ON public.chat_messages;
CREATE POLICY "Allow all access to chat_messages" ON public.chat_messages FOR ALL USING (true) WITH CHECK (true);

DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.step_runs; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
