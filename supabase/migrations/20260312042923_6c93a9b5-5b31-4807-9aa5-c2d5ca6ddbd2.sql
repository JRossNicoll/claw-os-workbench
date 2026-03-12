
-- Runs table for automation execution history
CREATE TABLE public.runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id uuid REFERENCES public.automations(id) ON DELETE CASCADE NOT NULL,
  automation_name text NOT NULL DEFAULT '',
  agent_name text,
  status text NOT NULL DEFAULT 'queued',
  trigger text NOT NULL DEFAULT 'Manual',
  steps integer NOT NULL DEFAULT 0,
  steps_completed integer NOT NULL DEFAULT 0,
  duration text,
  logs jsonb NOT NULL DEFAULT '[]'::jsonb,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone
);

ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to runs" ON public.runs FOR ALL TO public USING (true) WITH CHECK (true);

-- Activity events table for live audit log
CREATE TABLE public.activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'info',
  message text NOT NULL,
  detail text,
  category text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to activity_events" ON public.activity_events FOR ALL TO public USING (true) WITH CHECK (true);

-- Enable realtime for both
ALTER PUBLICATION supabase_realtime ADD TABLE public.runs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_events;
