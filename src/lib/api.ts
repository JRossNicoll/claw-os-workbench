const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getToken(): string | null {
  return localStorage.getItem("clawos-token");
}

export function setToken(token: string) {
  localStorage.setItem("clawos-token", token);
}

export function clearToken() {
  localStorage.removeItem("clawos-token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

class ApiError extends Error {
  status: number;
  body: any;

  constructor(status: number, body: any) {
    const message =
      body?.error || body?.message || `Request failed with status ${status}`;
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export { ApiError };

async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearToken();
    window.location.href = "/login";
    throw new ApiError(401, { error: "Session expired. Please log in again." });
  }

  let body: any;
  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    body = await res.json();
  } else {
    body = await res.text();
  }

  if (!res.ok) {
    throw new ApiError(res.status, body);
  }

  return body as T;
}

// ─── Auth ──────────────────────────────────────────
export async function login(username: string, password: string) {
  const data = await request<{ token: string }>("/auth/token", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  setToken(data.token);
  return data;
}

// ─── Engine Library ────────────────────────────────
export async function getEngines() {
  return request("/engine-library");
}

export async function installEngine(engineId: string, config?: Record<string, any>) {
  return request("/engine-library/install", {
    method: "POST",
    body: JSON.stringify({ engine_id: engineId, config }),
  });
}

// ─── Automation Templates ──────────────────────────
export async function getTemplates() {
  return request("/automation-templates");
}

export async function installTemplate(templateId: string) {
  return request("/automation-templates/install", {
    method: "POST",
    body: JSON.stringify({ template_id: templateId }),
  });
}

// ─── Workflows (Automations) ───────────────────────
export async function getWorkflows() {
  return request("/workflows");
}

export async function runWorkflow(workflowId: string) {
  return request(`/workflows/${workflowId}/run`, { method: "POST" });
}

export async function getWorkflowRuns(workflowId: string) {
  return request(`/workflow-runs/${workflowId}`);
}

// ─── Integrations ──────────────────────────────────
export async function getIntegrations() {
  return request("/integrations");
}

export async function connectGithub(code: string) {
  return request("/integrations/github/connect", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export async function connectOpenclaw(token: string) {
  return request("/integrations/openclaw/connect", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export async function addApiKey(name: string, value: string) {
  return request("/integrations/api-key", {
    method: "POST",
    body: JSON.stringify({ name, value }),
  });
}

// ─── WebSocket ─────────────────────────────────────
export function connectEventStream(
  onEvent: (event: any) => void,
  onError?: (error: Event) => void
): WebSocket {
  const wsBase = API_BASE.replace(/^http/, "ws");
  const token = getToken();
  const url = `${wsBase}/events/stream${token ? `?token=${token}` : ""}`;
  const ws = new WebSocket(url);

  ws.onmessage = (msg) => {
    try {
      const event = JSON.parse(msg.data);
      onEvent(event);
    } catch {
      onEvent({ raw: msg.data });
    }
  };

  ws.onerror = (err) => onError?.(err);

  return ws;
}
