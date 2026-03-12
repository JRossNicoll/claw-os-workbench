// ─── ClawOS Local Data Store ────────────────────────
// Self-contained state management with localStorage persistence

import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────

export interface Engine {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  verified: boolean;
  installed: boolean;
  stars?: string;
  language?: string;
  url?: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  type: "autonomous" | "reactive" | "scheduled";
  status: "active" | "idle" | "error" | "stopped";
  engine: string;
  lastRun?: string;
  totalRuns: number;
  successRate: number;
  memory?: string;
  model?: string;
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "error";
  trigger: string;
  steps: AutomationStep[];
  createdAt: string;
  lastRun?: string;
  totalRuns: number;
}

export interface AutomationStep {
  id: string;
  name: string;
  status: "success" | "running" | "failed" | "pending" | "skipped";
  duration?: string;
  condition?: string;
  retry?: { maxRetries: number; delay: string };
}

export interface Run {
  id: string;
  automationId: string;
  automationName: string;
  agentName?: string;
  status: "success" | "failed" | "running" | "queued" | "cancelled";
  startedAt: string;
  duration: string;
  steps: number;
  stepsCompleted: number;
  trigger: string;
  logs: RunLog[];
}

export interface RunLog {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
}

export interface Integration {
  id: string;
  name: string;
  status: "connected" | "disconnected" | "error";
  icon: string;
  connectedAt?: string;
}

export interface Secret {
  id: string;
  name: string;
  createdAt: string;
  lastUsed: string;
  usedBy: number;
}

export interface ActivityEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  detail?: string;
  category?: string;
}

// ─── Default Engines (Real GitHub Trending) ─────────

const DEFAULT_ENGINES: Engine[] = [
  { id: "ollama", name: "Ollama", description: "Run large language models locally. Get up and running with Llama 3, Mistral, Gemma, and other models.", category: "AI", version: "0.3.14", verified: true, installed: false, stars: "98.2k", language: "Go", url: "https://github.com/ollama/ollama" },
  { id: "langchain", name: "LangChain", description: "Build context-aware reasoning applications with composable LLM chains and agents.", category: "AI", version: "0.3.7", verified: true, installed: false, stars: "95.1k", language: "Python", url: "https://github.com/langchain-ai/langchain" },
  { id: "crewai", name: "CrewAI", description: "Framework for orchestrating role-playing autonomous AI agents. Build collaborative AI teams.", category: "AI", version: "0.80.0", verified: true, installed: false, stars: "22.8k", language: "Python", url: "https://github.com/crewAIInc/crewAI" },
  { id: "autogen", name: "AutoGen", description: "Multi-agent conversation framework by Microsoft. Enable complex LLM workflows with multiple agents.", category: "AI", version: "0.4.1", verified: true, installed: false, stars: "35.2k", language: "Python", url: "https://github.com/microsoft/autogen" },
  { id: "n8n", name: "n8n Workflow", description: "Fair-code workflow automation tool. Connect anything to everything with 400+ integrations.", category: "Automation", version: "1.68.0", verified: true, installed: false, stars: "50.3k", language: "TypeScript", url: "https://github.com/n8n-io/n8n" },
  { id: "grafana", name: "Grafana Monitor", description: "Observability platform for metrics, logs, and traces. Build real-time dashboards.", category: "Monitoring", version: "11.3.0", verified: true, installed: false, stars: "65.4k", language: "Go", url: "https://github.com/grafana/grafana" },
  { id: "uptime-kuma", name: "Uptime Kuma", description: "Self-hosted monitoring tool. Track HTTP, TCP, DNS, Docker, and more with beautiful status pages.", category: "Monitoring", version: "2.0.0", verified: true, installed: false, stars: "60.1k", language: "JavaScript", url: "https://github.com/louislam/uptime-kuma" },
  { id: "appwrite", name: "Appwrite", description: "Open-source backend server for web, mobile, and Flutter. Auth, database, storage, functions.", category: "Data", version: "1.6.0", verified: true, installed: false, stars: "45.8k", language: "TypeScript", url: "https://github.com/appwrite/appwrite" },
  { id: "dify", name: "Dify", description: "Open-source LLM app development platform. Orchestrate AI workflows with visual builder.", category: "AI", version: "0.11.0", verified: true, installed: false, stars: "52.7k", language: "Python", url: "https://github.com/langgenius/dify" },
  { id: "playwright", name: "Playwright Scraper", description: "Browser automation library for reliable end-to-end testing and web scraping across browsers.", category: "Automation", version: "1.49.0", verified: true, installed: false, stars: "67.8k", language: "TypeScript", url: "https://github.com/microsoft/playwright" },
  { id: "minio", name: "MinIO Storage", description: "High-performance S3-compatible object storage. Kubernetes-native, built for AI/ML workloads.", category: "Data", version: "2024.11.7", verified: true, installed: false, stars: "48.9k", language: "Go", url: "https://github.com/minio/minio" },
  { id: "ntfy", name: "ntfy Notifications", description: "Simple HTTP-based pub-sub notification service. Send push notifications to phone or desktop.", category: "Notifications", version: "2.11.0", verified: true, installed: false, stars: "18.9k", language: "Go", url: "https://github.com/binwiederhier/ntfy" },
  { id: "redis-stack", name: "Redis Stack", description: "In-memory data structure store with search, JSON, graph, and time-series capabilities.", category: "Data", version: "7.4.1", verified: true, installed: false, stars: "67.2k", language: "C", url: "https://github.com/redis/redis" },
  { id: "temporal", name: "Temporal", description: "Durable execution system for building reliable distributed applications and workflows.", category: "Automation", version: "1.25.0", verified: true, installed: false, stars: "12.4k", language: "Go", url: "https://github.com/temporalio/temporal" },
  { id: "caddy", name: "Caddy Proxy", description: "Fast, multi-platform web server with automatic HTTPS. Zero-config reverse proxy.", category: "DevOps", version: "2.8.4", verified: true, installed: false, stars: "59.3k", language: "Go", url: "https://github.com/caddyserver/caddy" },
  { id: "traefik", name: "Traefik", description: "Cloud-native application proxy. Auto-discovers services and configures routing dynamically.", category: "DevOps", version: "3.2.1", verified: true, installed: false, stars: "51.7k", language: "Go", url: "https://github.com/traefik/traefik" },
  { id: "qdrant", name: "Qdrant Vector DB", description: "High-performance vector similarity search engine for AI applications and semantic search.", category: "AI", version: "1.12.1", verified: true, installed: false, stars: "21.4k", language: "Rust", url: "https://github.com/qdrant/qdrant" },
  { id: "gotify", name: "Gotify", description: "Simple server for sending and receiving messages. Self-hosted push notification service.", category: "Notifications", version: "2.5.0", verified: true, installed: false, stars: "11.8k", language: "Go", url: "https://github.com/gotify/server" },
];

const DEFAULT_AGENTS: Agent[] = [
  { id: "agent-1", name: "Market Sentinel", description: "Monitors cryptocurrency markets and sends alerts on significant price movements", type: "autonomous", status: "active", engine: "langchain", lastRun: "2 min ago", totalRuns: 1247, successRate: 99.2, model: "gpt-4o-mini" },
  { id: "agent-2", name: "Code Reviewer", description: "Automatically reviews pull requests and suggests improvements", type: "reactive", status: "active", engine: "crewai", lastRun: "15 min ago", totalRuns: 384, successRate: 96.8, model: "claude-3.5-sonnet" },
  { id: "agent-3", name: "Infra Guardian", description: "Watches infrastructure health and auto-remediates common failures", type: "autonomous", status: "idle", engine: "autogen", lastRun: "1h ago", totalRuns: 892, successRate: 98.1, model: "gpt-4o" },
  { id: "agent-4", name: "Report Generator", description: "Generates daily analytics reports from multiple data sources", type: "scheduled", status: "active", engine: "dify", lastRun: "6h ago", totalRuns: 156, successRate: 100, model: "gpt-4o-mini" },
  { id: "agent-5", name: "Security Scanner", description: "Scans repositories and infrastructure for vulnerabilities", type: "scheduled", status: "error", engine: "playwright", lastRun: "3h ago", totalRuns: 78, successRate: 92.3, model: "gpt-4o" },
];

const DEFAULT_AUTOMATIONS: Automation[] = [
  {
    id: "auto-1", name: "Website Health Check", description: "Monitor critical endpoints every 5 minutes and alert on failures",
    status: "active", trigger: "Every 5 min", createdAt: "2 weeks ago", lastRun: "3 min ago", totalRuns: 4032,
    steps: [
      { id: "s1", name: "Ping endpoints", status: "success", duration: "1.2s" },
      { id: "s2", name: "Check response codes", status: "success", duration: "0.3s" },
      { id: "s3", name: "Validate SSL certificates", status: "success", duration: "0.8s" },
      { id: "s4", name: "Send alert if degraded", status: "skipped", condition: "status != 200" },
    ],
  },
  {
    id: "auto-2", name: "Daily Data Pipeline", description: "Aggregate metrics from all sources and generate reports",
    status: "active", trigger: "Daily 6:00 AM", createdAt: "1 month ago", lastRun: "6h ago", totalRuns: 31,
    steps: [
      { id: "s1", name: "Fetch API metrics", status: "success", duration: "4.2s" },
      { id: "s2", name: "Query database stats", status: "success", duration: "2.1s" },
      { id: "s3", name: "Aggregate & transform", status: "success", duration: "1.8s" },
      { id: "s4", name: "Generate PDF report", status: "success", duration: "3.5s" },
      { id: "s5", name: "Send via email", status: "success", duration: "0.9s" },
    ],
  },
  {
    id: "auto-3", name: "GitHub PR Watcher", description: "Monitor repositories for new PRs and run automated review",
    status: "active", trigger: "Webhook", createdAt: "1 week ago", lastRun: "22 min ago", totalRuns: 67,
    steps: [
      { id: "s1", name: "Receive webhook event", status: "success", duration: "0.1s" },
      { id: "s2", name: "Fetch PR diff", status: "success", duration: "1.4s" },
      { id: "s3", name: "Run AI code review", status: "success", duration: "8.2s", retry: { maxRetries: 2, delay: "5s" } },
      { id: "s4", name: "Post review comments", status: "success", duration: "0.6s" },
    ],
  },
  {
    id: "auto-4", name: "Backup & Snapshot", description: "Nightly database backup with verification",
    status: "inactive", trigger: "Daily 2:00 AM", createdAt: "3 weeks ago", lastRun: "2 days ago", totalRuns: 14,
    steps: [
      { id: "s1", name: "Create database dump", status: "pending" },
      { id: "s2", name: "Compress archive", status: "pending" },
      { id: "s3", name: "Upload to MinIO", status: "pending" },
      { id: "s4", name: "Verify integrity", status: "pending" },
    ],
  },
];

const DEFAULT_RUNS: Run[] = [
  { id: "run-1", automationId: "auto-1", automationName: "Website Health Check", status: "success", startedAt: "3 min ago", duration: "2.3s", steps: 4, stepsCompleted: 4, trigger: "Schedule", logs: [
    { timestamp: "14:32:01", level: "info", message: "Starting health check cycle #4032" },
    { timestamp: "14:32:01", level: "info", message: "Pinging 6 endpoints..." },
    { timestamp: "14:32:02", level: "info", message: "All endpoints responding (avg 142ms)" },
    { timestamp: "14:32:02", level: "info", message: "SSL certificates valid (expires in 47 days)" },
    { timestamp: "14:32:03", level: "info", message: "Health check completed successfully" },
  ]},
  { id: "run-2", automationId: "auto-3", automationName: "GitHub PR Watcher", agentName: "Code Reviewer", status: "success", startedAt: "22 min ago", duration: "10.3s", steps: 4, stepsCompleted: 4, trigger: "Webhook", logs: [
    { timestamp: "14:10:15", level: "info", message: "Webhook received: pull_request.opened" },
    { timestamp: "14:10:15", level: "info", message: "Fetching diff for PR #247 in clawos/core..." },
    { timestamp: "14:10:17", level: "info", message: "Diff fetched: +142 -38 lines across 5 files" },
    { timestamp: "14:10:17", level: "info", message: "Running AI code review with claude-3.5-sonnet..." },
    { timestamp: "14:10:25", level: "info", message: "Review generated: 3 suggestions, 1 approval" },
    { timestamp: "14:10:25", level: "info", message: "Posted review comments on PR #247" },
  ]},
  { id: "run-3", automationId: "auto-2", automationName: "Daily Data Pipeline", status: "success", startedAt: "6h ago", duration: "12.5s", steps: 5, stepsCompleted: 5, trigger: "Schedule", logs: [
    { timestamp: "06:00:00", level: "info", message: "Starting daily pipeline" },
    { timestamp: "06:00:04", level: "info", message: "API metrics fetched: 24 endpoints" },
    { timestamp: "06:00:06", level: "info", message: "Database stats collected" },
    { timestamp: "06:00:08", level: "info", message: "Data aggregated and transformed" },
    { timestamp: "06:00:12", level: "info", message: "PDF report generated (2.4MB)" },
    { timestamp: "06:00:12", level: "info", message: "Report emailed to 3 recipients" },
  ]},
  { id: "run-4", automationId: "auto-1", automationName: "Website Health Check", status: "failed", startedAt: "1h ago", duration: "5.1s", steps: 4, stepsCompleted: 2, trigger: "Schedule", logs: [
    { timestamp: "13:30:01", level: "info", message: "Starting health check cycle #4028" },
    { timestamp: "13:30:01", level: "info", message: "Pinging 6 endpoints..." },
    { timestamp: "13:30:03", level: "warn", message: "Endpoint api.staging.clawos.io timeout (5000ms)" },
    { timestamp: "13:30:05", level: "error", message: "SSL check failed: certificate expired for staging.clawos.io" },
    { timestamp: "13:30:06", level: "info", message: "Alert sent to #ops-alerts channel" },
  ]},
  { id: "run-5", automationId: "auto-1", automationName: "Website Health Check", status: "running", startedAt: "just now", duration: "—", steps: 4, stepsCompleted: 1, trigger: "Schedule", logs: [
    { timestamp: "14:35:01", level: "info", message: "Starting health check cycle #4033" },
    { timestamp: "14:35:01", level: "info", message: "Pinging 6 endpoints..." },
  ]},
  { id: "run-6", automationId: "auto-3", automationName: "GitHub PR Watcher", status: "queued", startedAt: "just now", duration: "—", steps: 4, stepsCompleted: 0, trigger: "Webhook", logs: [] },
];

const DEFAULT_TEMPLATES = [
  {
    id: "tpl-1", name: "Website Uptime Monitor", description: "Monitor any URL for uptime, response time, and SSL validity. Get alerts on failures.",
    category: "Monitoring", steps: [
      { name: "Configure target URLs", hasCondition: false },
      { name: "Set check interval", hasCondition: false },
      { name: "Define alert thresholds", hasCondition: true },
      { name: "Choose notification channel", hasCondition: false },
    ], failureMode: "continue_on_failure",
  },
  {
    id: "tpl-2", name: "AI Code Review Pipeline", description: "Automatically review PRs using AI models. Post suggestions and approve safe changes.",
    category: "AI", steps: [
      { name: "Connect GitHub repository", hasCondition: false },
      { name: "Fetch PR diff on webhook", hasCondition: false },
      { name: "Run AI analysis", hasCondition: false, retry: { maxRetries: 3, delay: "5s" } },
      { name: "Post review comments", hasCondition: true },
      { name: "Auto-approve if safe", hasCondition: true },
    ], failureMode: "stop_on_failure",
  },
  {
    id: "tpl-3", name: "Data Aggregation Report", description: "Collect metrics from APIs and databases, transform data, and generate daily reports.",
    category: "Data", steps: [
      { name: "Connect data sources", hasCondition: false },
      { name: "Fetch and normalize data", hasCondition: false },
      { name: "Run transformations", hasCondition: false },
      { name: "Generate report", hasCondition: false },
      { name: "Distribute via email/Slack", hasCondition: false },
    ], failureMode: "stop_on_failure",
  },
  {
    id: "tpl-4", name: "Security Scan & Alert", description: "Scan infrastructure and code for vulnerabilities. Alert on critical findings.",
    category: "Security", steps: [
      { name: "Scan repositories", hasCondition: false },
      { name: "Check container images", hasCondition: false },
      { name: "Audit dependencies", hasCondition: false, retry: { maxRetries: 2, delay: "10s" } },
      { name: "Generate security report", hasCondition: false },
      { name: "Alert on critical CVEs", hasCondition: true },
    ], failureMode: "continue_on_failure",
  },
  {
    id: "tpl-5", name: "Multi-Agent Research", description: "Deploy multiple AI agents to research a topic, synthesize findings, and produce a brief.",
    category: "AI", steps: [
      { name: "Define research scope", hasCondition: false },
      { name: "Deploy researcher agents", hasCondition: false },
      { name: "Collect agent outputs", hasCondition: false },
      { name: "Synthesize findings", hasCondition: false },
      { name: "Generate final brief", hasCondition: false },
    ], failureMode: "stop_on_failure",
  },
  {
    id: "tpl-6", name: "Incident Response Runbook", description: "Automated incident response: detect, diagnose, remediate, and notify stakeholders.",
    category: "DevOps", steps: [
      { name: "Detect anomaly", hasCondition: false },
      { name: "Gather diagnostics", hasCondition: false },
      { name: "Attempt auto-remediation", hasCondition: true, retry: { maxRetries: 3, delay: "30s" } },
      { name: "Escalate if unresolved", hasCondition: true },
      { name: "Post incident report", hasCondition: false },
    ], failureMode: "continue_on_failure",
  },
];

// ─── Store Class ────────────────────────────────────

function load<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(`clawos-${key}`);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T) {
  localStorage.setItem(`clawos-${key}`, JSON.stringify(data));
}

// ─── Public API ─────────────────────────────────────

export function getEngines(): Engine[] {
  return load("engines", DEFAULT_ENGINES);
}

export function installEngine(engineId: string): Engine[] {
  const engines = getEngines().map((e) =>
    e.id === engineId ? { ...e, installed: true } : e
  );
  save("engines", engines);
  addEvent({
    type: "installed",
    message: `${engines.find((e) => e.id === engineId)?.name || "Engine"} installed`,
    category: "Engine",
  });
  return engines;
}

export function getAgents(): Agent[] {
  return load("agents", DEFAULT_AGENTS);
}

export function toggleAgent(agentId: string): Agent[] {
  const agents = getAgents().map((a) => {
    if (a.id !== agentId) return a;
    const newStatus = a.status === "active" ? "stopped" : "active";
    return { ...a, status: newStatus as Agent["status"] };
  });
  save("agents", agents);
  return agents;
}

export function getAutomations(): Automation[] {
  return load("automations", DEFAULT_AUTOMATIONS);
}

export function addAutomation(auto: Automation): Automation[] {
  const list = [...getAutomations(), auto];
  save("automations", list);
  addEvent({
    type: "started",
    message: `Automation "${auto.name}" created`,
    category: "Automation",
  });
  return list;
}

export function runAutomation(autoId: string): Run {
  const auto = getAutomations().find((a) => a.id === autoId);
  const run: Run = {
    id: `run-${Date.now()}`,
    automationId: autoId,
    automationName: auto?.name || "Unknown",
    status: "running",
    startedAt: "just now",
    duration: "—",
    steps: auto?.steps.length || 0,
    stepsCompleted: 0,
    trigger: "Manual",
    logs: [
      { timestamp: new Date().toLocaleTimeString(), level: "info", message: `Starting ${auto?.name || "automation"}...` },
    ],
  };
  const runs = [run, ...getRuns()];
  save("runs", runs);
  addEvent({
    type: "started",
    message: `${auto?.name || "Automation"} started manually`,
    category: "Automation",
  });

  // Simulate completion after 2s
  setTimeout(() => {
    const updated = getRuns().map((r) =>
      r.id === run.id
        ? {
            ...r,
            status: "success" as const,
            duration: "2.1s",
            stepsCompleted: r.steps,
            logs: [
              ...r.logs,
              { timestamp: new Date().toLocaleTimeString(), level: "info" as const, message: "All steps completed successfully" },
            ],
          }
        : r
    );
    save("runs", updated);
    addEvent({
      type: "completed",
      message: `${auto?.name || "Automation"} completed successfully`,
      category: "Automation",
    });
  }, 2000);

  return run;
}

export function getRuns(): Run[] {
  return load("runs", DEFAULT_RUNS);
}

export function getTemplates() {
  return DEFAULT_TEMPLATES;
}

export function installTemplate(templateId: string): Automation | null {
  const tpl = DEFAULT_TEMPLATES.find((t) => t.id === templateId);
  if (!tpl) return null;
  const auto: Automation = {
    id: `auto-${Date.now()}`,
    name: tpl.name,
    description: tpl.description,
    status: "inactive",
    trigger: "Not configured",
    createdAt: "just now",
    totalRuns: 0,
    steps: tpl.steps.map((s, i) => ({
      id: `s${i}`,
      name: s.name,
      status: "pending" as const,
      retry: s.retry,
      condition: s.hasCondition ? "conditional" : undefined,
    })),
  };
  addAutomation(auto);
  return auto;
}

export function getSecrets(): Secret[] {
  return load("secrets", []);
}

export function addSecret(name: string): Secret[] {
  const secrets = [
    ...getSecrets(),
    {
      id: `secret-${Date.now()}`,
      name,
      createdAt: "just now",
      lastUsed: "never",
      usedBy: 0,
    },
  ];
  save("secrets", secrets);
  return secrets;
}

export function deleteSecret(id: string): Secret[] {
  const secrets = getSecrets().filter((s) => s.id !== id);
  save("secrets", secrets);
  return secrets;
}

export function getIntegrations(): Integration[] {
  return load("integrations", [
    { id: "github", name: "GitHub", status: "disconnected", icon: "github" },
    { id: "telegram", name: "Telegram", status: "disconnected", icon: "message-square" },
    { id: "discord", name: "Discord", status: "disconnected", icon: "message-circle" },
    { id: "slack", name: "Slack", status: "disconnected", icon: "hash" },
    { id: "openclaw", name: "OpenClaw", status: "disconnected", icon: "hexagon" },
  ]);
}

export function toggleIntegration(id: string): Integration[] {
  const integrations = getIntegrations().map((i) =>
    i.id === id
      ? {
          ...i,
          status: (i.status === "connected" ? "disconnected" : "connected") as Integration["status"],
          connectedAt: i.status === "connected" ? undefined : "just now",
        }
      : i
  );
  save("integrations", integrations);
  const integration = integrations.find((i) => i.id === id);
  if (integration?.status === "connected") {
    addEvent({
      type: "online",
      message: `${integration.name} integration connected`,
      category: "Integration",
    });
  }
  return integrations;
}

// ─── Activity Events ────────────────────────────────

export function getEvents(): ActivityEvent[] {
  return load("events", [
    { id: "e1", type: "started", message: "Market Sentinel agent started monitoring", timestamp: "2 min ago", category: "Agent" },
    { id: "e2", type: "installed", message: "Ollama engine installed", timestamp: "8 min ago", detail: "v0.3.14 · Verified", category: "Engine" },
    { id: "e3", type: "completed", message: "Website Health Check completed run #4032", timestamp: "15 min ago", detail: "All checks passed · 2.3s", category: "Automation" },
    { id: "e4", type: "online", message: "Worker node-03 came online", timestamp: "22 min ago", category: "System" },
    { id: "e5", type: "paused", message: "Data Pipeline paused for approval", timestamp: "35 min ago", detail: "Awaiting manual confirmation", category: "Automation" },
    { id: "e6", type: "warning", message: "Rate limit approaching for ntfy notifications", timestamp: "1h ago", detail: "42/50 messages sent this window", category: "Integration" },
    { id: "e7", type: "completed", message: "Code Reviewer agent finished PR #247 review", timestamp: "1h ago", detail: "3 suggestions, 1 approval", category: "Agent" },
    { id: "e8", type: "installed", message: "CrewAI engine installed", timestamp: "2h ago", detail: "v0.80.0", category: "Engine" },
    { id: "e9", type: "started", message: "Daily Data Pipeline triggered", timestamp: "6h ago", category: "Automation" },
    { id: "e10", type: "security", message: "Security Scanner found 2 low-severity CVEs", timestamp: "3h ago", detail: "In dependency chain", category: "Agent" },
  ]);
}

export function addEvent(event: Omit<ActivityEvent, "id" | "timestamp">) {
  const events = [
    { ...event, id: `e-${Date.now()}`, timestamp: "just now" },
    ...getEvents(),
  ].slice(0, 50);
  save("events", events);
}

// ─── System Health (Simulated) ──────────────────────

export function getRuntimeHealth() {
  return {
    api: true,
    redis: true,
    postgres: true,
    worker: true,
    running_containers: 4,
  };
}

export function getStackStatus() {
  return {
    containers: [
      { name: "clawos_api", status: "running", uptime: "3d 14h 22m" },
      { name: "clawos_worker", status: "running", uptime: "3d 14h 22m" },
      { name: "postgres", status: "running", uptime: "12d 8h 15m" },
      { name: "redis", status: "running", uptime: "12d 8h 15m" },
      { name: "qdrant", status: "running", uptime: "2d 6h 41m" },
      { name: "minio", status: "running", uptime: "5d 19h 33m" },
    ],
  };
}

export function getMetrics() {
  const automations = getAutomations();
  const runs = getRuns();
  return {
    active_workflows: automations.filter((a) => a.status === "active").length,
    running_jobs: runs.filter((r) => r.status === "running").length,
    queued_jobs: runs.filter((r) => r.status === "queued").length,
    runtime_containers: 6,
    total_agents: getAgents().length,
    active_agents: getAgents().filter((a) => a.status === "active").length,
  };
}

export function getStackLogs(service: string): string[] {
  const now = new Date();
  const base = [
    `[${service}] Service started successfully`,
    `[${service}] Listening on port ${service === "api" ? 3000 : service === "worker" ? 3001 : service === "postgres" ? 5432 : 6379}`,
    `[${service}] Health check: OK`,
    `[${service}] Connected to message broker`,
  ];
  if (service === "api") {
    return [
      ...base,
      `[api] POST /auth/token 200 12ms`,
      `[api] GET /workflows 200 8ms`,
      `[api] GET /engine-library 200 5ms`,
      `[api] POST /workflows/auto-1/run 200 142ms`,
      `[api] GET /system/runtime-health 200 3ms`,
      `[api] WebSocket connection established (events/stream)`,
      `[api] GET /metrics 200 2ms`,
      `[api] GET /agents 200 6ms`,
    ];
  }
  if (service === "worker") {
    return [
      ...base,
      `[worker] Processing job queue: 0 pending`,
      `[worker] Agent "Market Sentinel" heartbeat OK`,
      `[worker] Agent "Code Reviewer" heartbeat OK`,
      `[worker] Executed automation "Website Health Check" in 2.3s`,
      `[worker] Agent "Report Generator" scheduled for 06:00`,
      `[worker] Memory usage: 312MB / 1024MB`,
    ];
  }
  return [
    ...base,
    `[${service}] Connections: 12 active`,
    `[${service}] Memory usage: 128MB`,
    `[${service}] Uptime: ${service === "postgres" ? "12d 8h" : "12d 8h"}`,
  ];
}

// ─── Onboarding ─────────────────────────────────────

export function completeOnboarding(config: {
  purpose: string;
  engines: string[];
  integrations: string[];
  automation?: { when: string; run: string; then: string };
}) {
  // Install selected engines
  const engines = getEngines().map((e) =>
    config.engines.includes(e.id) ? { ...e, installed: true } : e
  );
  save("engines", engines);

  // Connect selected integrations
  const integrations = getIntegrations().map((i) =>
    config.integrations.includes(i.id)
      ? { ...i, status: "connected" as const, connectedAt: "just now" }
      : i
  );
  save("integrations", integrations);

  // Create first automation if configured
  if (config.automation) {
    const triggerLabels: Record<string, string> = {
      schedule: "Every 10 minutes",
      signal: "On signal",
      webhook: "On webhook",
    };
    const runLabels: Record<string, string> = {
      scanner: "Market Scanner",
      ai: "AI Assistant",
      monitor: "Website Monitor",
    };
    const thenLabels: Record<string, string> = {
      alert: "Send notification",
      store: "Save to database",
    };

    const auto: Automation = {
      id: `auto-${Date.now()}`,
      name: `${runLabels[config.automation.run] || "Custom"} Pipeline`,
      description: `${triggerLabels[config.automation.when] || "Triggered"} → ${runLabels[config.automation.run] || "Run"} → ${thenLabels[config.automation.then] || "Then"}`,
      status: "active",
      trigger: triggerLabels[config.automation.when] || "Manual",
      createdAt: "just now",
      totalRuns: 0,
      steps: [
        { id: "s1", name: triggerLabels[config.automation.when] || "Trigger", status: "pending" },
        { id: "s2", name: `Run ${runLabels[config.automation.run] || "engine"}`, status: "pending" },
        { id: "s3", name: thenLabels[config.automation.then] || "Action", status: "pending" },
      ],
    };
    addAutomation(auto);
  }

  // Add events
  config.engines.forEach((eid) => {
    const engine = engines.find((e) => e.id === eid);
    if (engine) {
      addEvent({ type: "installed", message: `${engine.name} installed during setup`, category: "Engine" });
    }
  });

  addEvent({ type: "online", message: "ClawOS setup completed", category: "System" });
  localStorage.setItem("clawos-onboarded", "true");
}

export function isOnboarded(): boolean {
  return localStorage.getItem("clawos-onboarded") === "true";
}

export function resetOnboarding() {
  localStorage.removeItem("clawos-onboarded");
  localStorage.removeItem("clawos-engines");
  localStorage.removeItem("clawos-agents");
  localStorage.removeItem("clawos-automations");
  localStorage.removeItem("clawos-runs");
  localStorage.removeItem("clawos-events");
  localStorage.removeItem("clawos-integrations");
  localStorage.removeItem("clawos-secrets");
}
