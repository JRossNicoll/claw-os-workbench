import { useState } from "react";
import { Plus, Trash2, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useSecrets, useAddSecret, useDeleteSecret } from "@/hooks/use-secrets";
import { toast } from "sonner";
import { timeAgo } from "@/hooks/use-activity";

const Secrets = () => {
  const { data: secrets = [], isLoading } = useSecrets();
  const addMutation = useAddSecret();
  const deleteMutation = useDeleteSecret();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    addMutation.mutate(name.trim().toUpperCase(), {
      onSuccess: () => {
        toast.success("Secret added");
        setName("");
        setShowAdd(false);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("Secret deleted"),
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Secrets</h1>
          <p className="text-sm text-muted-foreground mt-1">API keys and credentials</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-3 h-3" /> Add Secret
        </button>
      </motion.div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-xl surface-elevated space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] text-muted-foreground font-medium">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} placeholder="MY_API_KEY" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-1 focus:ring-primary font-mono transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] text-muted-foreground font-medium">Value</label>
              <input type="password" placeholder="••••••••" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-1 focus:ring-primary font-mono transition-all" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={addMutation.isPending} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              {addMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Save
            </button>
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">Cancel</button>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
        {secrets.length > 0 ? (
          <div className="space-y-2">
            {secrets.map((secret, i) => (
              <motion.div key={secret.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.06 + i * 0.03 }} className="flex items-center gap-4 p-4 rounded-xl surface-elevated group">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-foreground font-mono">{secret.name}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Created {timeAgo(secret.created_at)}</div>
                </div>
                <button onClick={() => handleDelete(secret.id)} disabled={deleteMutation.isPending} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl surface-elevated">
            <Lock className="w-10 h-10 text-muted-foreground/25 mb-4" />
            <p className="text-sm text-muted-foreground mb-1">No secrets stored yet</p>
            <p className="text-xs text-muted-foreground/60 mb-5">Add API keys and credentials for your engines</p>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" /> Add Secret
            </button>
          </div>
        )}
      </motion.div>

      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
        <Lock className="w-3 h-3" />
        Values are encrypted and can never be viewed after creation
      </p>
    </div>
  );
};

export default Secrets;
