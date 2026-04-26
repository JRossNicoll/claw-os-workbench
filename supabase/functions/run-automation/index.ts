// Real automation step engine.
// Executes typed steps (http, ai, delay, condition, log, transform) sequentially,
// streaming step status + logs to Postgres so the UI gets live progress via realtime.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") ?? "";

interface Step {
  id: string;
  name: string;
  step_order: number;
  kind: string;
  config: Record<string, unknown>;
  retry_config?: { maxRetries?: number; delay?: string } | null;
  condition?: string | null;
}

function nowTime() {
  return new Date().toLocaleTimeString("en-US", { hour12: false });
}

function getPath(obj: any, path: string): any {
  return path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
}

// {{steps.<idx>.output.foo}} or {{vars.bar}}
function interpolate(value: any, ctx: Record<string, any>): any {
  if (typeof value === "string") {
    return value.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, expr) => {
      const v = getPath(ctx, expr.trim());
      return v == null ? "" : typeof v === "string" ? v : JSON.stringify(v);
    });
  }
  if (Array.isArray(value)) return value.map((v) => interpolate(v, ctx));
  if (value && typeof value === "object") {
    const out: any = {};
    for (const k of Object.keys(value)) out[k] = interpolate(value[k], ctx);
    return out;
  }
  return value;
}

function safeEvalCondition(expr: string, ctx: Record<string, any>): boolean {
  // Tiny safe-ish evaluator: replace {{...}} placeholders with JSON-encoded values,
  // then allow only ===, !==, ==, !=, <, >, <=, >=, &&, ||, !, parens, numbers, strings, true/false/null.
  const replaced = expr.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, e) => {
    const v = getPath(ctx, e.trim());
    return JSON.stringify(v ?? null);
  });
  if (!/^[\s\d\w."'`!=<>&|()\-+*/%,:]*$/.test(replaced)) return false;
  try {
    return Boolean(new Function(`"use strict"; return (${replaced});`)());
  } catch {
    return false;
  }
}

async function callAI(prompt: string, model: string, system?: string): Promise<string> {
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model || "google/gemini-3-flash-preview",
      messages: [
        ...(system ? [{ role: "system", content: system }] : []),
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    if (r.status === 429) throw new Error("AI rate limit exceeded");
    if (r.status === 402) throw new Error("AI credits exhausted");
    throw new Error(`AI error ${r.status}: ${t.slice(0, 200)}`);
  }
  const data = await r.json();
  return data.choices?.[0]?.message?.content ?? "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    const { automation_id, trigger = "Manual" } = await req.json();
    if (!automation_id) throw new Error("automation_id required");

    const { data: auto, error: autoErr } = await supabase
      .from("automations")
      .select("*, automation_steps(*)")
      .eq("id", automation_id)
      .single();
    if (autoErr || !auto) throw new Error(autoErr?.message ?? "automation not found");

    const steps: Step[] = (auto.automation_steps || []).sort(
      (a: Step, b: Step) => a.step_order - b.step_order,
    );

    // Create run
    const { data: run, error: runErr } = await supabase
      .from("runs")
      .insert({
        automation_id,
        automation_name: auto.name,
        status: "running",
        trigger,
        steps: steps.length,
        steps_completed: 0,
        logs: [{ timestamp: nowTime(), level: "info", message: `Starting ${auto.name}` }],
      })
      .select()
      .single();
    if (runErr) throw runErr;

    // Seed step_runs
    if (steps.length > 0) {
      await supabase.from("step_runs").insert(
        steps.map((s) => ({
          run_id: run.id,
          step_id: s.id,
          step_order: s.step_order,
          name: s.name,
          kind: s.kind,
          status: "pending",
        })),
      );
    }

    const logs: { timestamp: string; level: string; message: string }[] = [
      { timestamp: nowTime(), level: "info", message: `Starting ${auto.name}` },
    ];
    const ctx: Record<string, any> = { steps: {} as Record<string, any>, vars: {} };
    let completed = 0;
    const startTotal = Date.now();

    async function pushLog(level: string, message: string) {
      logs.push({ timestamp: nowTime(), level, message });
      await supabase.from("runs").update({ logs }).eq("id", run.id);
    }

    let finalStatus: "success" | "failed" = "success";

    for (const step of steps) {
      const cfg = interpolate(step.config || {}, ctx) as Record<string, any>;

      // Conditional skip
      if (step.condition && !safeEvalCondition(step.condition, ctx)) {
        await supabase
          .from("step_runs")
          .update({ status: "skipped", completed_at: new Date().toISOString() })
          .eq("run_id", run.id)
          .eq("step_id", step.id);
        await pushLog("info", `Step "${step.name}" skipped (condition not met)`);
        completed += 1;
        await supabase.from("runs").update({ steps_completed: completed }).eq("id", run.id);
        ctx.steps[step.step_order] = { skipped: true };
        continue;
      }

      const stepStart = Date.now();
      await supabase
        .from("step_runs")
        .update({ status: "running", started_at: new Date().toISOString() })
        .eq("run_id", run.id)
        .eq("step_id", step.id);
      await pushLog("info", `→ ${step.name}`);

      const maxRetries = step.retry_config?.maxRetries ?? 0;
      let attempt = 0;
      let lastErr: string | null = null;
      let output: any = null;
      let stepOk = false;

      while (attempt <= maxRetries) {
        try {
          switch (step.kind) {
            case "http": {
              const url = String(cfg.url ?? "");
              if (!url) throw new Error("HTTP step missing url");
              const method = String(cfg.method ?? "GET").toUpperCase();
              const r = await fetch(url, {
                method,
                headers: cfg.headers as Record<string, string> | undefined,
                body: ["GET", "HEAD"].includes(method)
                  ? undefined
                  : typeof cfg.body === "string"
                  ? cfg.body
                  : JSON.stringify(cfg.body ?? {}),
              });
              const ct = r.headers.get("content-type") ?? "";
              const body = ct.includes("json") ? await r.json() : await r.text();
              output = { status: r.status, ok: r.ok, body };
              if (!r.ok) throw new Error(`HTTP ${r.status}`);
              break;
            }
            case "ai": {
              const prompt = String(cfg.prompt ?? "");
              if (!prompt) throw new Error("AI step missing prompt");
              const text = await callAI(
                prompt,
                String(cfg.model ?? "google/gemini-3-flash-preview"),
                cfg.system ? String(cfg.system) : undefined,
              );
              output = { text };
              break;
            }
            case "delay": {
              const ms = Math.min(Number(cfg.ms ?? 500), 30_000);
              await new Promise((res) => setTimeout(res, ms));
              output = { delayed_ms: ms };
              break;
            }
            case "log": {
              const msg = String(cfg.message ?? step.name);
              await pushLog(String(cfg.level ?? "info"), msg);
              output = { message: msg };
              break;
            }
            case "transform": {
              // Pull a value from ctx and store under vars
              const from = String(cfg.from ?? "");
              const into = String(cfg.into ?? "value");
              const v = from ? getPath(ctx, from) : cfg.value;
              ctx.vars[into] = v;
              output = { [into]: v };
              break;
            }
            case "condition": {
              const expr = String(cfg.expr ?? "true");
              output = { result: safeEvalCondition(expr, ctx) };
              break;
            }
            default:
              output = { note: `Unknown step kind '${step.kind}', treated as no-op` };
          }
          stepOk = true;
          break;
        } catch (e) {
          lastErr = e instanceof Error ? e.message : String(e);
          attempt += 1;
          if (attempt <= maxRetries) {
            await pushLog("warn", `Retry ${attempt}/${maxRetries} for "${step.name}": ${lastErr}`);
            await new Promise((res) => setTimeout(res, 400));
          }
        }
      }

      const duration_ms = Date.now() - stepStart;
      ctx.steps[step.step_order] = { output, error: lastErr, ok: stepOk };

      await supabase
        .from("step_runs")
        .update({
          status: stepOk ? "success" : "failed",
          output,
          error: stepOk ? null : lastErr,
          duration_ms,
          completed_at: new Date().toISOString(),
        })
        .eq("run_id", run.id)
        .eq("step_id", step.id);

      if (stepOk) {
        await pushLog("info", `✓ ${step.name} (${duration_ms}ms)`);
        completed += 1;
        await supabase.from("runs").update({ steps_completed: completed }).eq("id", run.id);
      } else {
        await pushLog("error", `✗ ${step.name}: ${lastErr}`);
        finalStatus = "failed";
        // Mark remaining as skipped
        await supabase
          .from("step_runs")
          .update({ status: "skipped" })
          .eq("run_id", run.id)
          .eq("status", "pending");
        break;
      }
    }

    const totalMs = Date.now() - startTotal;
    const durationStr = `${(totalMs / 1000).toFixed(1)}s`;

    await supabase
      .from("runs")
      .update({
        status: finalStatus,
        duration: durationStr,
        completed_at: new Date().toISOString(),
        logs,
      })
      .eq("id", run.id);

    await supabase
      .from("automations")
      .update({
        last_run: "just now",
        total_runs: (auto.total_runs ?? 0) + 1,
        status: finalStatus === "failed" ? "error" : auto.status,
      })
      .eq("id", automation_id);

    await supabase.from("activity_events").insert({
      type: finalStatus === "success" ? "completed" : "warning",
      message: `${auto.name} ${finalStatus === "success" ? "completed" : "failed"}`,
      detail: `Duration: ${durationStr}`,
      category: "Automation",
    });

    return new Response(
      JSON.stringify({ run_id: run.id, status: finalStatus, duration: durationStr }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("run-automation error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
