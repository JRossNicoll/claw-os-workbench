import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Loader2, Bot, User, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Msg { id?: string; role: "user" | "assistant"; content: string }

export function AgentChat({ agentId, agentName, onClose }: { agentId: string; agentName: string; onClose: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load history
  useEffect(() => {
    supabase
      .from("chat_messages")
      .select("id, role, content")
      .eq("agent_id", agentId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data as Msg[]);
      });
  }, [agentId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setStreaming(true);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-chat`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ agent_id: agentId, message: text }),
      });

      if (!resp.ok) {
        if (resp.status === 429) toast.error("Rate limit reached. Try again shortly.");
        else if (resp.status === 402) toast.error("AI credits exhausted. Add credits in Settings → Workspace → Usage.");
        else toast.error("Chat failed");
        const t = await resp.text();
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: `_Error: ${t.slice(0, 200)}_` };
          return copy;
        });
        setStreaming(false);
        return;
      }

      const reader = resp.body!.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let assistant = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          const raw = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          const line = raw.endsWith("\r") ? raw.slice(0, -1) : raw;
          if (!line.startsWith("data:")) continue;
          const json = line.slice(5).trim();
          if (json === "[DONE]") continue;
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistant += delta;
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: assistant };
                return copy;
              });
            }
          } catch { /* partial */ }
        }
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Network error");
    } finally {
      setStreaming(false);
    }
  };

  const clearHistory = async () => {
    await supabase.from("chat_messages").delete().eq("agent_id", agentId);
    setMessages([]);
    toast.success("Chat history cleared");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex justify-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: 400 }}
        animate={{ x: 0 }}
        exit={{ x: 400 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="w-full max-w-md h-full bg-background border-l border-border flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">{agentName}</div>
              <div className="text-[10px] text-muted-foreground">Live · powered by Lovable AI</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={clearHistory} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" title="Clear history">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <Bot className="w-8 h-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Chat with {agentName}</p>
              <p className="text-[11px] text-muted-foreground/60 mt-1">Ask it to plan, summarize, or analyze.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={cn("flex gap-2.5", m.role === "user" && "flex-row-reverse")}>
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
                m.role === "user" ? "bg-primary/15" : "bg-muted",
              )}>
                {m.role === "user" ? <User className="w-3.5 h-3.5 text-primary" /> : <Bot className="w-3.5 h-3.5 text-muted-foreground" />}
              </div>
              <div className={cn(
                "max-w-[78%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed whitespace-pre-wrap",
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-card border border-border text-foreground rounded-tl-sm",
              )}>
                {m.content || (streaming && i === messages.length - 1 ? <Loader2 className="w-3 h-3 animate-spin" /> : "…")}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-border bg-background">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Type a message…"
              rows={1}
              className="flex-1 resize-none bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary max-h-32"
            />
            <button
              onClick={send}
              disabled={streaming || !input.trim()}
              className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
            >
              {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
