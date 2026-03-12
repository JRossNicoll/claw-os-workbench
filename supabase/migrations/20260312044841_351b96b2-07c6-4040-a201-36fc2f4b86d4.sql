DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'runs') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.runs;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'automations') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.automations;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'agents') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.agents;
  END IF;
END $$;