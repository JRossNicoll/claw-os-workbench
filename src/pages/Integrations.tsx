import { useState, useEffect } from "react";
import { Github, Hexagon, MessageSquare, Hash, MessageCircle, Check, ExternalLink, Loader2, Key, Cpu, Zap, Globe, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { getIntegrations, toggleIntegration, type Integration } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const iconMap: Record<string, typeof Github> = {
  github: Github,
  "message-square": MessageSquare,
  "message-circle": MessageCircle,
  hash: Hash,
  hexagon: Hexagon,
};

interface OpenClawInstanceInfo {
  url: string;
  sessions?: any;
  connectedAt?: string;
}

// OpenClaw integration details panel — shows real data
function OpenClawPanel({ instanceInfo, onDisconnect }: { instanceInfo: OpenClawInstanceInfo | null; onDisconnect: () => void }) {
  if (!instanceInfo) return null;

  const sessionCount = Array.isArray(instanceInfo.sessions) ? instanceInfo.sessions.length : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Gateway", value: new URL(instanceInfo.url).hostname, icon: Globe },
          { label: "Sessions", value: sessionCount, icon: Cpu },
          { label: "Connected", value: instanceInfo.connectedAt || "just now", icon: Zap },
          { label: "Status", value: "Online", icon: Hexagon },
        ].map((item) => (
          <div key={item.label} className="bg-background rounded-lg border border-border p-3 flex items-center gap-3">
            <item.icon className="w-3.5 h-3.5 text-primary/50" />
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</div>
              <div className="text-xs font-medium text-foreground">{String(item.value)}</div>
            </div>
          </div>
        ))}
      </div>

      {Array.isArray(instanceInfo.sessions) && instanceInfo.sessions.length > 0 && (
        <div className="text-[11px] text-muted-foreground">
          Active sessions: {instanceInfo.sessions.map((s: any) => s.name || s.id || 'unnamed').join(', ')}
        </div>
      )}

      <div className="flex gap-2">
        <a href={instanceInfo.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] text-muted-foreground hover:text-foreground border border-border hover:bg-card transition-colors">
          <ExternalLink className="w-3 h-3" /> Open Gateway
        </a>
        <button onClick={onDisconnect} className="px-3 py-1.5 rounded-lg text-[11px] text-destructive/70 hover:text-destructive hover:bg-destructive/10 border border-border transition-colors">
          Disconnect
        </button>
      </div>
    </motion.div>
  );
}

const Integrations = () => {
  const [integrations, setIntegrations] = useState(getIntegrations);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [openclawExpanded, setOpenclawExpanded] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [instanceUrlValue, setInstanceUrlValue] = useState("");
  const [connectError, setConnectError] = useState<string | null>(null);
  const [openclawInstance, setOpenclawInstance] = useState<OpenClawInstanceInfo | null>(() => {
    try {
      const stored = localStorage.getItem("clawos-openclaw-instance");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const handleGithubConnect = async () => {
    setConnecting("github");
    try {
      const redirectUri = `${window.location.origin}/integrations`;
      const { data, error } = await supabase.functions.invoke("github-oauth", {
        body: { action: "get_auth_url", redirect_uri: redirectUri },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || "Failed to get auth URL");
      }

      localStorage.setItem("github-oauth-state", data.state);
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message || "Failed to connect GitHub");
      setConnecting(null);
    }
  };

  // Handle GitHub OAuth callback on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const storedState = localStorage.getItem("github-oauth-state");

    if (code && state && state === storedState) {
      localStorage.removeItem("github-oauth-state");
      window.history.replaceState({}, "", "/integrations");

      const exchangeCode = async () => {
        try {
          const { data, error } = await supabase.functions.invoke("github-oauth", {
            body: {
              action: "exchange_code",
              code,
              redirect_uri: `${window.location.origin}/integrations`,
            },
          });

          if (error || !data?.success) {
            throw new Error(data?.error || "Token exchange failed");
          }

          localStorage.setItem("clawos-github-token", data.access_token);
          localStorage.setItem("clawos-github-user", JSON.stringify(data.user));

          const updated = toggleIntegration("github");
          setIntegrations(updated);
          toast.success(`Connected as ${data.user.login}`);
        } catch (err: any) {
          toast.error(err.message || "GitHub connection failed");
        }
      };

      exchangeCode();
    }
  }, []);

  const handleOpenClawConnect = () => {
    setShowApiKeyInput(true);
    setConnectError(null);
  };

  const handleOpenClawSubmitKey = async () => {
    const token = apiKeyValue.trim();
    const url = instanceUrlValue.trim();

    if (!url) {
      setConnectError("Enter your OpenClaw gateway URL");
      return;
    }
    if (!token) {
      setConnectError("Enter your API token");
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setConnectError("Invalid URL format. Example: http://localhost:18789");
      return;
    }

    setConnecting("openclaw");
    setConnectError(null);

    try {
      const { data, error } = await supabase.functions.invoke("openclaw-proxy", {
        body: {
          action: "validate",
          instance_url: url,
          api_token: token,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to reach OpenClaw proxy");
      }

      if (!data?.success) {
        throw new Error(data?.error || "Validation failed");
      }

      // Store credentials securely in localStorage
      const instanceInfo: OpenClawInstanceInfo = {
        url: data.instance.url,
        sessions: data.instance.sessions,
        connectedAt: new Date().toLocaleString(),
      };

      localStorage.setItem("clawos-openclaw-api-key", token);
      localStorage.setItem("clawos-openclaw-instance", JSON.stringify(instanceInfo));

      setOpenclawInstance(instanceInfo);
      const updated = toggleIntegration("openclaw");
      setIntegrations(updated);
      setShowApiKeyInput(false);
      setApiKeyValue("");
      setInstanceUrlValue("");
      setOpenclawExpanded(true);
      toast.success("OpenClaw gateway connected");
    } catch (err: any) {
      setConnectError(err.message || "Connection failed");
    } finally {
      setConnecting(null);
    }
  };

  const handleToggle = (id: string) => {
    if (id === "github") {
      const integration = integrations.find((i) => i.id === "github");
      if (integration?.status === "connected") {
        localStorage.removeItem("clawos-github-token");
        localStorage.removeItem("clawos-github-user");
        const updated = toggleIntegration(id);
        setIntegrations(updated);
        toast.success("GitHub disconnected");
      } else {
        handleGithubConnect();
      }
      return;
    }

    if (id === "openclaw") {
      const integration = integrations.find((i) => i.id === "openclaw");
      if (integration?.status === "connected") {
        localStorage.removeItem("clawos-openclaw-api-key");
        localStorage.removeItem("clawos-openclaw-instance");
        setOpenclawInstance(null);
        const updated = toggleIntegration(id);
        setIntegrations(updated);
        setOpenclawExpanded(false);
        setShowApiKeyInput(false);
        setApiKeyValue("");
        setInstanceUrlValue("");
        toast.success("OpenClaw disconnected");
      } else {
        handleOpenClawConnect();
      }
      return;
    }

    const updated = toggleIntegration(id);
    setIntegrations(updated);
    const integration = updated.find((i) => i.id === id);
    toast.success(`${integration?.name} ${integration?.status === "connected" ? "connected" : "disconnected"}`);
  };

  const githubUser = (() => {
    try {
      const stored = localStorage.getItem("clawos-github-user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const openclawConnected = integrations.find((i) => i.id === "openclaw")?.status === "connected";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-lg font-semibold text-foreground">Integrations</h1>
        <p className="text-sm text-muted-foreground mt-1">Connect external services to power your engines</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="space-y-2">
        {integrations.map((integration, i) => {
          const Icon = iconMap[integration.icon] || Key;
          const isGithubConnected = integration.id === "github" && githubUser;
          const isOpenClaw = integration.id === "openclaw";

          return (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.06 + i * 0.03 }}
              className={cn("rounded-xl surface-elevated", isOpenClaw && openclawConnected && "border-primary/20")}
            >
              <div className="flex items-center gap-4 p-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", integration.status === "connected" ? "bg-success/10" : "bg-muted")}>
                  <Icon className={cn("w-5 h-5", integration.status === "connected" ? "text-success" : "text-muted-foreground")} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-foreground">{integration.name}</span>
                    {integration.status === "connected" && (
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-success" />
                        <span className="text-[10px] text-success font-medium">Connected</span>
                      </div>
                    )}
                  </div>
                  {isGithubConnected && (
                    <div className="flex items-center gap-2 mt-1">
                      <img src={githubUser.avatar_url} alt="" className="w-4 h-4 rounded-full" />
                      <span className="text-[11px] text-muted-foreground">@{githubUser.login}</span>
                      <a href={githubUser.html_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-muted-foreground/50 hover:text-foreground">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {isOpenClaw && openclawConnected && openclawInstance && (
                    <span className="text-[11px] text-muted-foreground">
                      {(() => { try { return new URL(openclawInstance.url).hostname; } catch { return openclawInstance.url; } })()}
                    </span>
                  )}
                  {integration.connectedAt && !isGithubConnected && !isOpenClaw && (
                    <span className="text-[11px] text-muted-foreground">Connected {integration.connectedAt}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isOpenClaw && openclawConnected && (
                    <button
                      onClick={() => setOpenclawExpanded(!openclawExpanded)}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] text-muted-foreground hover:text-foreground border border-border hover:bg-card transition-colors"
                    >
                      {openclawExpanded ? "Hide" : "Details"}
                    </button>
                  )}
                  <button
                    onClick={() => handleToggle(integration.id)}
                    disabled={connecting === integration.id}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      integration.status === "connected"
                        ? "text-destructive/70 hover:text-destructive hover:bg-destructive/10 border border-border"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {connecting === integration.id ? (
                      <><Loader2 className="w-3 h-3 animate-spin" /> Connecting...</>
                    ) : integration.status === "connected" ? (
                      "Disconnect"
                    ) : (
                      "Connect"
                    )}
                  </button>
                </div>
              </div>

              {/* OpenClaw connection form */}
              {isOpenClaw && showApiKeyInput && !openclawConnected && (
                <div className="px-4 pb-4">
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                    <div className="text-[11px] text-muted-foreground">
                      Connect your running OpenClaw gateway. Get started at{" "}
                      <a href="https://openclaw.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        openclaw.ai
                      </a>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={instanceUrlValue}
                        onChange={(e) => { setInstanceUrlValue(e.target.value); setConnectError(null); }}
                        placeholder="Gateway URL — e.g. http://localhost:18789"
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <input
                        type="password"
                        value={apiKeyValue}
                        onChange={(e) => { setApiKeyValue(e.target.value); setConnectError(null); }}
                        onKeyDown={(e) => e.key === "Enter" && handleOpenClawSubmitKey()}
                        placeholder="API token"
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    {connectError && (
                      <div className="flex items-center gap-1.5 text-[11px] text-destructive">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        {connectError}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={handleOpenClawSubmitKey}
                        disabled={connecting === "openclaw"}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      >
                        {connecting === "openclaw" ? (
                          <><Loader2 className="w-3 h-3 animate-spin" /> Validating...</>
                        ) : (
                          <><Key className="w-3 h-3" /> Connect</>
                        )}
                      </button>
                      <button
                        onClick={() => { setShowApiKeyInput(false); setApiKeyValue(""); setInstanceUrlValue(""); setConnectError(null); }}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] text-muted-foreground hover:text-foreground border border-border hover:bg-card transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* OpenClaw expanded details */}
              {isOpenClaw && openclawConnected && openclawExpanded && (
                <div className="px-4 pb-4">
                  <OpenClawPanel instanceInfo={openclawInstance} onDisconnect={() => handleToggle("openclaw")} />
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default Integrations;
