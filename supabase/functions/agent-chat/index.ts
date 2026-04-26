// Streaming chat endpoint for an Agent. Persists messages, replays history to the model.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const MODEL_MAP: Record<string, string> = {
  "gpt-4o": "openai/gpt-5",
  "gpt-4o-mini": "openai/gpt-5-mini",
  "claude-3.5-sonnet": "openai/gpt-5",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { agent_id, message } = await req.json();
    if (!agent_id || !message) throw new Error("agent_id and message required");

    const { data: agent, error: agentErr } = await supabase
      .from("agents")
      .select("*")
      .eq("id", agent_id)
      .single();
    if (agentErr || !agent) throw new Error("Agent not found");

    // Load history
    const { data: history } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("agent_id", agent_id)
      .order("created_at", { ascending: true })
      .limit(40);

    // Persist user message
    await supabase.from("chat_messages").insert({
      agent_id,
      role: "user",
      content: message,
    });

    const model =
      MODEL_MAP[agent.model ?? ""] ?? agent.model ?? "google/gemini-3-flash-preview";

    const system = `You are "${agent.name}", a ${agent.type} AI agent running on the ClawOS automation platform.
Engine: ${agent.engine}. Description: ${agent.description || "general purpose"}.
Be concise, action-oriented, and helpful. Use markdown formatting.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        stream: true,
        messages: [
          { role: "system", content: system },
          ...(history ?? []),
          { role: "user", content: message },
        ],
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      const status = aiResp.status === 429 ? 429 : aiResp.status === 402 ? 402 : 500;
      const errMsg =
        aiResp.status === 429
          ? "Rate limit reached. Please try again shortly."
          : aiResp.status === 402
          ? "AI credits exhausted. Add credits in Settings → Workspace → Usage."
          : `Upstream AI error: ${t.slice(0, 200)}`;
      return new Response(JSON.stringify({ error: errMsg }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Tee the stream so we can both forward to client AND collect the full assistant
    // response for persistence.
    const [streamForClient, streamForCollect] = aiResp.body!.tee();

    // Background-collect for persistence
    (async () => {
      try {
        const reader = streamForCollect.getReader();
        const dec = new TextDecoder();
        let buf = "";
        let assembled = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let nl: number;
          while ((nl = buf.indexOf("\n")) !== -1) {
            const line = buf.slice(0, nl).trim();
            buf = buf.slice(nl + 1);
            if (!line.startsWith("data:")) continue;
            const json = line.slice(5).trim();
            if (json === "[DONE]") continue;
            try {
              const parsed = JSON.parse(json);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) assembled += delta;
            } catch {
              /* skip partials */
            }
          }
        }
        if (assembled) {
          await supabase.from("chat_messages").insert({
            agent_id,
            role: "assistant",
            content: assembled,
          });
          await supabase
            .from("agents")
            .update({
              last_run: "just now",
              total_runs: (agent.total_runs ?? 0) + 1,
            })
            .eq("id", agent_id);
        }
      } catch (e) {
        console.error("collect stream error", e);
      }
    })();

    return new Response(streamForClient, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("agent-chat error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
