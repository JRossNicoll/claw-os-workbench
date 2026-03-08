import { useState } from "react";
import { Plus, Trash2, Lock, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const secretsData = [
  { name: "TELEGRAM_BOT_TOKEN", createdAt: "Jan 15, 2024", lastUsed: "2 min ago", usedBy: 2 },
  { name: "ETHERSCAN_API_KEY", createdAt: "Jan 10, 2024", lastUsed: "15 min ago", usedBy: 3 },
  { name: "ALCHEMY_API_KEY", createdAt: "Jan 8, 2024", lastUsed: "1h ago", usedBy: 5 },
  { name: "PRIVATE_KEY_MAIN", createdAt: "Jan 5, 2024", lastUsed: "30 min ago", usedBy: 1 },
  { name: "DISCORD_WEBHOOK_URL", createdAt: "Feb 1, 2024", lastUsed: "3h ago", usedBy: 1 },
];

const Secrets = () => {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-semibold text-foreground">Secrets</h1>
          <p className="text-sm text-muted-foreground mt-1">API keys and credentials</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Secret
        </button>
      </motion.div>

      {showAdd && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-xl surface-elevated space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Name</label>
              <input placeholder="MY_API_KEY" className="w-full bg-muted/60 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/30 font-mono transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Value</label>
              <input type="password" placeholder="••••••••" className="w-full bg-muted/60 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/30 font-mono transition-all" />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              Save
            </button>
            <button onClick={() => setShowAdd(false)} className="px-3.5 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="space-y-2"
      >
        {secretsData.map((secret, i) => (
          <motion.div
            key={secret.name}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.06 + i * 0.03 }}
            className="flex items-center gap-4 p-4 rounded-xl surface-elevated group"
          >
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground font-mono">{secret.name}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Created {secret.createdAt} · Used by {secret.usedBy} tool{secret.usedBy > 1 ? "s" : ""} · Last used {secret.lastUsed}
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
        <Lock className="w-3 h-3" />
        Values are encrypted and can never be viewed after creation
      </p>
    </div>
  );
};

export default Secrets;
