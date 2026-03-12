
-- Create engines table
CREATE TABLE public.engines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  version text NOT NULL DEFAULT '',
  verified boolean NOT NULL DEFAULT false,
  installed boolean NOT NULL DEFAULT false,
  stars text,
  language text,
  url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.engines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to engines" ON public.engines FOR ALL USING (true) WITH CHECK (true);

-- Seed engines
INSERT INTO public.engines (slug, name, description, category, version, verified, installed, stars, language, url) VALUES
  ('ollama', 'Ollama', 'Run large language models locally. Get up and running with Llama 3, Mistral, Gemma, and other models.', 'AI', '0.3.14', true, false, '98.2k', 'Go', 'https://github.com/ollama/ollama'),
  ('langchain', 'LangChain', 'Build context-aware reasoning applications with composable LLM chains and agents.', 'AI', '0.3.7', true, false, '95.1k', 'Python', 'https://github.com/langchain-ai/langchain'),
  ('crewai', 'CrewAI', 'Framework for orchestrating role-playing autonomous AI agents. Build collaborative AI teams.', 'AI', '0.80.0', true, false, '22.8k', 'Python', 'https://github.com/crewAIInc/crewAI'),
  ('autogen', 'AutoGen', 'Multi-agent conversation framework by Microsoft. Enable complex LLM workflows with multiple agents.', 'AI', '0.4.1', true, false, '35.2k', 'Python', 'https://github.com/microsoft/autogen'),
  ('n8n', 'n8n Workflow', 'Fair-code workflow automation tool. Connect anything to everything with 400+ integrations.', 'Automation', '1.68.0', true, false, '50.3k', 'TypeScript', 'https://github.com/n8n-io/n8n'),
  ('grafana', 'Grafana Monitor', 'Observability platform for metrics, logs, and traces. Build real-time dashboards.', 'Monitoring', '11.3.0', true, false, '65.4k', 'Go', 'https://github.com/grafana/grafana'),
  ('uptime-kuma', 'Uptime Kuma', 'Self-hosted monitoring tool. Track HTTP, TCP, DNS, Docker, and more with beautiful status pages.', 'Monitoring', '2.0.0', true, false, '60.1k', 'JavaScript', 'https://github.com/louislam/uptime-kuma'),
  ('appwrite', 'Appwrite', 'Open-source backend server for web, mobile, and Flutter. Auth, database, storage, functions.', 'Data', '1.6.0', true, false, '45.8k', 'TypeScript', 'https://github.com/appwrite/appwrite'),
  ('dify', 'Dify', 'Open-source LLM app development platform. Orchestrate AI workflows with visual builder.', 'AI', '0.11.0', true, false, '52.7k', 'Python', 'https://github.com/langgenius/dify'),
  ('playwright', 'Playwright Scraper', 'Browser automation library for reliable end-to-end testing and web scraping across browsers.', 'Automation', '1.49.0', true, false, '67.8k', 'TypeScript', 'https://github.com/microsoft/playwright'),
  ('minio', 'MinIO Storage', 'High-performance S3-compatible object storage. Kubernetes-native, built for AI/ML workloads.', 'Data', '2024.11.7', true, false, '48.9k', 'Go', 'https://github.com/minio/minio'),
  ('ntfy', 'ntfy Notifications', 'Simple HTTP-based pub-sub notification service. Send push notifications to phone or desktop.', 'Notifications', '2.11.0', true, false, '18.9k', 'Go', 'https://github.com/binwiederhier/ntfy'),
  ('redis-stack', 'Redis Stack', 'In-memory data structure store with search, JSON, graph, and time-series capabilities.', 'Data', '7.4.1', true, false, '67.2k', 'C', 'https://github.com/redis/redis'),
  ('temporal', 'Temporal', 'Durable execution system for building reliable distributed applications and workflows.', 'Automation', '1.25.0', true, false, '12.4k', 'Go', 'https://github.com/temporalio/temporal'),
  ('caddy', 'Caddy Proxy', 'Fast, multi-platform web server with automatic HTTPS. Zero-config reverse proxy.', 'DevOps', '2.8.4', true, false, '59.3k', 'Go', 'https://github.com/caddyserver/caddy'),
  ('traefik', 'Traefik', 'Cloud-native application proxy. Auto-discovers services and configures routing dynamically.', 'DevOps', '3.2.1', true, false, '51.7k', 'Go', 'https://github.com/traefik/traefik'),
  ('qdrant', 'Qdrant Vector DB', 'High-performance vector similarity search engine for AI applications and semantic search.', 'AI', '1.12.1', true, false, '21.4k', 'Rust', 'https://github.com/qdrant/qdrant'),
  ('gotify', 'Gotify', 'Simple server for sending and receiving messages. Self-hosted push notification service.', 'Notifications', '2.5.0', true, false, '11.8k', 'Go', 'https://github.com/gotify/server');
