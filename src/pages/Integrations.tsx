import { useState, useEffect } from "react";
import { Github, Hexagon, MessageSquare, Hash, MessageCircle, Check, ExternalLink, Loader2, Key, Cpu, Zap } from "lucide-react";
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

// OpenClaw integration details panel
function OpenClawPanel({ onDisconnect }: { onDisconnect: () => void }) {
  const instanceInfo = {
    name: "ClawOS Agent",
    version: "0.14.2",
    status: "online",
    uptime: "3d 14h",
    skills: 12,
    memories: 847,
    model: "claude-3.5-sonnet",
    channels: ["Telegram", "Discord"],
  };

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Instance", value: instanceInfo.name, icon: Hexagon },
          { label: "Version", value: `v${instanceInfo.version}`, icon: Cpu },
          { label: "Skills", value: instanceInfo.skills, icon: Zap },
          { label: "Memories", value: instanceInfo.memories, icon: Cpu },
        ].map((item) => (
          <div key={item.label} className="bg-background rounded-lg border border-border p-3 flex items-center gap-3">
            <item.icon className="w-3.5 h-3.5 text-primary/50" />
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</div>
              <div className="text-xs font-medium text-foreground">{item.value}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        <span>Model: {instanceInfo.model}</span>
        <span className="text-border">·</span>
        <span>Channels: {instanceInfo.channels.join(", ")}</span>
        <span className="text-border">·</span>
        <span className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          Uptime: {instanceInfo.uptime}
        </span>
      </div>
      <div className="flex gap-2">
        <a href="https://openclaw.ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] text-muted-foreground hover:text-foreground border border-border hover:bg-card transition-colors">
          <ExternalLink className="w-3 h-3" /> openclaw.ai
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

  // Check if OpenClaw was previously connected
  useEffect(() => {
    const stored = localStorage.getItem("clawos-openclaw-api-key");
    if (stored) {
      const ocIntegration = integrations.find((i) => i.id === "openclaw");
      if (ocIntegration?.status === "connected") {
        setOpenclawExpanded(false);
      }
    }
  }, []);

  const handleOpenClawConnect = () => {
    setShowApiKeyInput(true);
  };

  const handleOpenClawSubmitKey = () => {
    const key = apiKeyValue.trim();
    if (!key) {
      toast.error("Please enter your OpenClaw API key");
      return;
    }
    if (!key.startsWith("oc_") && !key.startsWith("sk-") && key.length < 20) {
      toast.error("Invalid API key format");
      return;
    }
    setConnecting("openclaw");
    // Simulate validating the key against OpenClaw API
    setTimeout(() => {
      localStorage.setItem("clawos-openclaw-api-key", key);
      const updated = toggleIntegration("openclaw");
      setIntegrations(updated);
      setConnecting(null);
      setShowApiKeyInput(false);
      setApiKeyValue("");
      setOpenclawExpanded(true);
      toast.success("OpenClaw connected with your API key");
    }, 1500);
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
        const updated = toggleIntegration(id);
        setIntegrations(updated);
        setOpenclawExpanded(false);
        setShowApiKeyInput(false);
        setApiKeyValue("");
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
                  {isOpenClaw && integration.status === "connected" && (
                    <span className="text-[11px] text-muted-foreground">openclaw.ai · v0.14.2</span>
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

              {/* OpenClaw expanded details */}
              {isOpenClaw && openclawConnected && openclawExpanded && (
                <div className="px-4 pb-4">
                  <OpenClawPanel onDisconnect={() => handleToggle("openclaw")} />
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
