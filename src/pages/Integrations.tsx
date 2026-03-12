import { useState, useEffect } from "react";
import { Github, Hexagon, MessageSquare, Hash, MessageCircle, Check, ExternalLink, Loader2, Key, Cpu, Zap, Globe, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useIntegrations, useToggleIntegration } from "@/hooks/use-integrations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const iconMap: Record<string, typeof Github> = {
  github: Github,
  "message-square": MessageSquare,
  "message-circle": MessageCircle,
  hash: Hash,
  hexagon: Hexagon,
};

/** Config for integrations that need credential input */
const credentialConfig: Record<string, { label: string; fields: { key: string; label: string; placeholder: string; type?: string }[]; helpText: string; helpUrl?: string }> = {
  slack: {
    label: "Slack",
    helpText: "Create a Slack app at api.slack.com and get a Bot Token (xoxb-...).",
    helpUrl: "https://api.slack.com/apps",
    fields: [
      { key: "webhook_url", label: "Webhook URL", placeholder: "https://hooks.slack.com/services/...", type: "url" },
      { key: "bot_token", label: "Bot Token (optional)", placeholder: "xoxb-...", type: "password" },
    ],
  },
  discord: {
    label: "Discord",
    helpText: "Create a Discord webhook in your channel settings → Integrations → Webhooks.",
    helpUrl: "https://discord.com/developers/docs/resources/webhook",
    fields: [
      { key: "webhook_url", label: "Webhook URL", placeholder: "https://discord.com/api/webhooks/...", type: "url" },
    ],
  },
  telegram: {
    label: "Telegram",
    helpText: "Create a bot via @BotFather on Telegram and get the token.",
    helpUrl: "https://core.telegram.org/bots#botfather",
    fields: [
      { key: "bot_token", label: "Bot Token", placeholder: "123456:ABC-DEF...", type: "password" },
      { key: "chat_id", label: "Chat ID", placeholder: "-1001234567890" },
    ],
  },
};

interface OpenClawInstanceInfo {
  url: string;
  sessions?: any;
  connectedAt?: string;
}

function OpenClawPanel({ instanceInfo, onDisconnect }: { instanceInfo: OpenClawInstanceInfo | null; onDisconnect: () => void }) {
  if (!instanceInfo) return null;
  const sessionCount = Array.isArray(instanceInfo.sessions) ? instanceInfo.sessions.length : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Gateway", value: (() => { try { return new URL(instanceInfo.url).hostname; } catch { return instanceInfo.url; } })(), icon: Globe },
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

function CredentialForm({ integrationId, onConnect, onCancel, connecting }: {
  integrationId: string;
  onConnect: (id: string, fields: Record<string, string>) => void;
  onCancel: () => void;
  connecting: boolean;
}) {
  const config = credentialConfig[integrationId];
  if (!config) return null;

  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    // Validate at least the first (required) field
    const firstField = config.fields[0];
    const firstVal = (values[firstField.key] || "").trim();
    if (!firstVal) {
      setError(`${firstField.label} is required`);
      return;
    }
    // Basic URL validation for url fields
    if (firstField.type === "url") {
      try { new URL(firstVal); } catch { setError("Invalid URL format"); return; }
    }
    setError(null);
    onConnect(integrationId, values);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="px-4 pb-4 space-y-3">
      <div className="text-[11px] text-muted-foreground">
        {config.helpText}{" "}
        {config.helpUrl && (
          <a href={config.helpUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Learn more →
          </a>
        )}
      </div>
      <div className="space-y-2">
        {config.fields.map((field) => (
          <input
            key={field.key}
            type={field.type || "text"}
            value={values[field.key] || ""}
            onChange={(e) => { setValues((v) => ({ ...v, [field.key]: e.target.value })); setError(null); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={field.placeholder}
            className="w-full px-3 py-1.5 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        ))}
      </div>
      {error && (
        <div className="flex items-center gap-1.5 text-[11px] text-destructive">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </div>
      )}
      <div className="flex gap-2">
        <button onClick={handleSubmit} disabled={connecting} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {connecting ? <><Loader2 className="w-3 h-3 animate-spin" /> Validating...</> : <><Key className="w-3 h-3" /> Connect</>}
        </button>
        <button onClick={onCancel} className="px-2.5 py-1.5 rounded-lg text-[11px] text-muted-foreground hover:text-foreground border border-border hover:bg-card transition-colors">
          Cancel
        </button>
      </div>
    </motion.div>
  );
}

const Integrations = () => {
  const { data: integrations = [], isLoading } = useIntegrations();
  const toggleMutation = useToggleIntegration();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [openclawExpanded, setOpenclawExpanded] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [instanceUrlValue, setInstanceUrlValue] = useState("");
  const [connectError, setConnectError] = useState<string | null>(null);
  const [credentialFormId, setCredentialFormId] = useState<string | null>(null);

  const getOpenclawInstance = (): OpenClawInstanceInfo | null => {
    const oc = integrations.find((i) => i.id === "openclaw");
    if (oc?.status === "connected" && oc.metadata?.url) return oc.metadata as OpenClawInstanceInfo;
    return null;
  };

  const githubUser = (() => {
    try {
      const stored = localStorage.getItem("clawos-github-user");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  })();

  const handleGithubConnect = async () => {
    setConnecting("github");
    try {
      const redirectUri = `${window.location.origin}/integrations`;
      const { data, error } = await supabase.functions.invoke("github-oauth", {
        body: { action: "get_auth_url", redirect_uri: redirectUri },
      });
      if (error || !data?.success) throw new Error(data?.error || error?.message || "Failed to get auth URL");
      localStorage.setItem("github-oauth-state", data.state);
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message || "Failed to connect GitHub");
      setConnecting(null);
    }
  };

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
            body: { action: "exchange_code", code, redirect_uri: `${window.location.origin}/integrations` },
          });
          if (error || !data?.success) throw new Error(data?.error || "Token exchange failed");
          localStorage.setItem("clawos-github-token", data.access_token);
          localStorage.setItem("clawos-github-user", JSON.stringify(data.user));
          toggleMutation.mutate({
            id: "github",
            newStatus: "connected",
            connected_at: "just now",
            metadata: { login: data.user.login, avatar_url: data.user.avatar_url },
          });
          toast.success(`Connected as ${data.user.login}`);
        } catch (err: any) {
          toast.error(err.message || "GitHub connection failed");
        }
      };
      exchangeCode();
    }
  }, []);

  const handleOpenClawSubmitKey = async () => {
    const token = apiKeyValue.trim();
    const url = instanceUrlValue.trim();
    if (!url) { setConnectError("Enter your OpenClaw gateway URL"); return; }
    if (!token) { setConnectError("Enter your API token"); return; }
    try { new URL(url); } catch { setConnectError("Invalid URL format"); return; }

    setConnecting("openclaw");
    setConnectError(null);
    try {
      const { data, error } = await supabase.functions.invoke("openclaw-proxy", {
        body: { action: "validate", instance_url: url, api_token: token },
      });
      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || "Validation failed");

      const instanceInfo: OpenClawInstanceInfo = {
        url: data.instance.url,
        sessions: data.instance.sessions,
        connectedAt: new Date().toLocaleString(),
      };
      localStorage.setItem("clawos-openclaw-api-key", token);
      toggleMutation.mutate({
        id: "openclaw",
        newStatus: "connected",
        connected_at: "just now",
        metadata: instanceInfo,
      });
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

  /** Validate & connect a webhook/token-based integration (Slack, Discord, Telegram) */
  const handleCredentialConnect = async (id: string, fields: Record<string, string>) => {
    setConnecting(id);
    const config = credentialConfig[id];
    if (!config) return;

    try {
      // Validate the credential by making a test request
      if (id === "slack") {
        const webhookUrl = (fields.webhook_url || "").trim();
        // Test the Slack webhook with a dry-run style message
        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: "✅ ClawOS connected successfully" }),
        });
        if (!res.ok) throw new Error(`Slack webhook returned ${res.status}. Check the URL.`);
      } else if (id === "discord") {
        const webhookUrl = (fields.webhook_url || "").trim();
        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: "✅ ClawOS connected successfully" }),
        });
        if (!res.ok && res.status !== 204) throw new Error(`Discord webhook returned ${res.status}. Check the URL.`);
      } else if (id === "telegram") {
        const botToken = (fields.bot_token || "").trim();
        const chatId = (fields.chat_id || "").trim();
        const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text: "✅ ClawOS connected successfully" }),
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.description || `Telegram API error: ${res.status}`);
      }

      // Save credentials to metadata & mark connected
      toggleMutation.mutate({
        id,
        newStatus: "connected",
        connected_at: new Date().toLocaleString(),
        metadata: { ...fields, connectedAt: new Date().toISOString() },
      });
      setCredentialFormId(null);
      toast.success(`${config.label} connected & verified`);
    } catch (err: any) {
      toast.error(err.message || "Connection failed — check your credentials");
    } finally {
      setConnecting(null);
    }
  };

  const handleToggle = (id: string) => {
    const integration = integrations.find((i) => i.id === id);
    if (!integration) return;

    if (id === "github") {
      if (integration.status === "connected") {
        localStorage.removeItem("clawos-github-token");
        localStorage.removeItem("clawos-github-user");
        toggleMutation.mutate({ id, newStatus: "disconnected", connected_at: null, metadata: {} });
        toast.success("GitHub disconnected");
      } else {
        handleGithubConnect();
      }
      return;
    }

    if (id === "openclaw") {
      if (integration.status === "connected") {
        localStorage.removeItem("clawos-openclaw-api-key");
        toggleMutation.mutate({ id, newStatus: "disconnected", connected_at: null, metadata: {} });
        setOpenclawExpanded(false);
        setShowApiKeyInput(false);
        toast.success("OpenClaw disconnected");
      } else {
        setShowApiKeyInput(true);
        setConnectError(null);
      }
      return;
    }

    // Credential-based integrations (Slack, Discord, Telegram)
    if (credentialConfig[id]) {
      if (integration.status === "connected") {
        toggleMutation.mutate({ id, newStatus: "disconnected", connected_at: null, metadata: {} });
        setCredentialFormId(null);
        toast.success(`${integration.name} disconnected`);
      } else {
        setCredentialFormId(id);
      }
      return;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
          const hasCredConfig = !!credentialConfig[integration.id];
          const isConnected = integration.status === "connected";

          return (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.06 + i * 0.03 }}
              className={cn("rounded-xl surface-elevated", isOpenClaw && openclawConnected && "border-primary/20")}
            >
              <div className="flex items-center gap-4 p-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", isConnected ? "bg-success/10" : "bg-muted")}>
                  <Icon className={cn("w-5 h-5", isConnected ? "text-success" : "text-muted-foreground")} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-foreground">{integration.name}</span>
                    {isConnected && (
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
                    </div>
                  )}
                  {isOpenClaw && openclawConnected && getOpenclawInstance() && (
                    <span className="text-[11px] text-muted-foreground">
                      {(() => { try { return new URL(getOpenclawInstance()!.url).hostname; } catch { return getOpenclawInstance()!.url; } })()}
                    </span>
                  )}
                  {hasCredConfig && isConnected && integration.metadata?.connectedAt && (
                    <span className="text-[11px] text-muted-foreground">
                      Verified · Connected {new Date(integration.metadata.connectedAt).toLocaleDateString()}
                    </span>
                  )}
                  {!isGithubConnected && !isOpenClaw && !hasCredConfig && integration.connected_at && (
                    <span className="text-[11px] text-muted-foreground">Connected {integration.connected_at}</span>
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
                    disabled={connecting === integration.id || toggleMutation.isPending}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      isConnected
                        ? "text-destructive/70 hover:text-destructive hover:bg-destructive/10 border border-border"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {connecting === integration.id ? (
                      <><Loader2 className="w-3 h-3 animate-spin" /> Connecting...</>
                    ) : isConnected ? "Disconnect" : "Connect"}
                  </button>
                </div>
              </div>

              {/* Credential form for Slack/Discord/Telegram */}
              {hasCredConfig && credentialFormId === integration.id && !isConnected && (
                <CredentialForm
                  integrationId={integration.id}
                  onConnect={handleCredentialConnect}
                  onCancel={() => setCredentialFormId(null)}
                  connecting={connecting === integration.id}
                />
              )}

              {isOpenClaw && showApiKeyInput && !openclawConnected && (
                <div className="px-4 pb-4">
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                    <div className="text-[11px] text-muted-foreground">
                      Connect your running OpenClaw gateway. Get started at{" "}
                      <a href="https://openclaw.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">openclaw.ai</a>
                    </div>
                    <div className="space-y-2">
                      <input type="url" value={instanceUrlValue} onChange={(e) => { setInstanceUrlValue(e.target.value); setConnectError(null); }} placeholder="Gateway URL — e.g. http://localhost:18789" className="w-full px-3 py-1.5 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary" />
                      <input type="password" value={apiKeyValue} onChange={(e) => { setApiKeyValue(e.target.value); setConnectError(null); }} onKeyDown={(e) => e.key === "Enter" && handleOpenClawSubmitKey()} placeholder="API token" className="w-full px-3 py-1.5 rounded-lg text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    {connectError && (
                      <div className="flex items-center gap-1.5 text-[11px] text-destructive">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />{connectError}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button onClick={handleOpenClawSubmitKey} disabled={connecting === "openclaw"} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                        {connecting === "openclaw" ? <><Loader2 className="w-3 h-3 animate-spin" /> Validating...</> : <><Key className="w-3 h-3" /> Connect</>}
                      </button>
                      <button onClick={() => { setShowApiKeyInput(false); setApiKeyValue(""); setInstanceUrlValue(""); setConnectError(null); }} className="px-2.5 py-1.5 rounded-lg text-[11px] text-muted-foreground hover:text-foreground border border-border hover:bg-card transition-colors">Cancel</button>
                    </div>
                  </motion.div>
                </div>
              )}

              {isOpenClaw && openclawConnected && openclawExpanded && (
                <div className="px-4 pb-4">
                  <OpenClawPanel instanceInfo={getOpenclawInstance()} onDisconnect={() => handleToggle("openclaw")} />
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
