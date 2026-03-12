import { useState } from "react";
import { Github, Hexagon, MessageSquare, Hash, MessageCircle, Check, ExternalLink, Loader2, Key } from "lucide-react";
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

const Integrations = () => {
  const [integrations, setIntegrations] = useState(getIntegrations);
  const [connecting, setConnecting] = useState<string | null>(null);

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

  // Handle OAuth callback on mount
  useState(() => {
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
  });

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

          return (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.06 + i * 0.03 }}
              className="flex items-center gap-4 p-4 rounded-xl surface-elevated group"
            >
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
                {integration.connectedAt && !isGithubConnected && (
                  <span className="text-[11px] text-muted-foreground">Connected {integration.connectedAt}</span>
                )}
              </div>
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
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : integration.status === "connected" ? (
                  "Disconnect"
                ) : (
                  "Connect"
                )}
              </button>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default Integrations;
