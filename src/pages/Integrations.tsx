import { useState } from "react";
import { motion } from "framer-motion";
import { Github, Hexagon, MessageSquare, Key, Check, Loader2, AlertCircle, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getIntegrations, connectGithub, connectOpenclaw, addApiKey, ApiError } from "@/lib/api";
import { toast } from "sonner";

const integrationMeta: Record<string, { icon: typeof Github; description: string }> = {
  github: { icon: Github, description: "Connect your GitHub account to allow engines to access your repositories" },
  telegram: { icon: MessageSquare, description: "Link your Telegram bot to send and receive messages" },
  openclaw: { icon: Hexagon, description: "Connect to the ClawOS ecosystem for shared engines and templates" },
};

const Integrations = () => {
  const queryClient = useQueryClient();
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyName, setApiKeyName] = useState("");
  const [apiKeyValue, setApiKeyValue] = useState("");

  const { data: integrations, isLoading } = useQuery({
    queryKey: ["integrations"],
    queryFn: getIntegrations,
  });

  const addKeyMutation = useMutation({
    mutationFn: () => addApiKey(apiKeyName, apiKeyValue),
    onSuccess: () => {
      toast.success("API key added");
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      setShowApiKey(false);
      setApiKeyName("");
      setApiKeyValue("");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const integrationList = Array.isArray(integrations) ? integrations : [];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-lg font-semibold text-foreground">Integrations</h1>
        <p className="text-sm text-muted-foreground mt-1">Connect services to power your engines</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="space-y-2"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : integrationList.length > 0 ? (
          integrationList.map((integration: any) => {
            const meta = integrationMeta[integration.type] || { icon: Link2, description: "" };
            const Icon = meta.icon;
            return (
              <div key={integration.id || integration.type} className="flex items-center gap-3.5 p-4 rounded-lg surface-elevated">
                <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground capitalize">{integration.type || integration.name}</div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{meta.description || integration.description}</p>
                </div>
                <span className={cn(
                  "text-[10px] font-medium px-2.5 py-1 rounded-md",
                  integration.connected || integration.status === "connected"
                    ? "text-success bg-success/10"
                    : "text-muted-foreground bg-muted"
                )}>
                  {integration.connected || integration.status === "connected" ? "Connected" : "Not connected"}
                </span>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16 rounded-lg surface-elevated">
            <Link2 className="w-8 h-8 text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground">No integrations configured</p>
            <p className="text-xs text-muted-foreground/50 mt-1">Connect services to get started</p>
          </div>
        )}
      </motion.div>

      {/* Add API Key */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {!showApiKey ? (
          <button
            onClick={() => setShowApiKey(true)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Key className="w-3.5 h-3.5" /> Add API key
          </button>
        ) : (
          <div className="p-4 rounded-lg surface-elevated space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Name</label>
                <input
                  value={apiKeyName}
                  onChange={(e) => setApiKeyName(e.target.value)}
                  placeholder="MY_API_KEY"
                  className="w-full bg-muted/60 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-1 focus:ring-primary/30 font-mono transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Value</label>
                <input
                  type="password"
                  value={apiKeyValue}
                  onChange={(e) => setApiKeyValue(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-muted/60 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-1 focus:ring-primary/30 font-mono transition-all"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => addKeyMutation.mutate()}
                disabled={!apiKeyName || !apiKeyValue || addKeyMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {addKeyMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                Save
              </button>
              <button onClick={() => setShowApiKey(false)} className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Integrations;
