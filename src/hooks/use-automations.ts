import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeTable } from "./use-realtime";
import type { Automation, AutomationStep } from "@/lib/store";

export type StepKind = "http" | "ai" | "delay" | "log" | "condition" | "transform";

export interface BuilderStep {
  name: string;
  kind: StepKind;
  config: Record<string, any>;
  condition?: string | null;
  retry?: { maxRetries: number; delay: string } | null;
}

interface DbAutomation {
  id: string;
  name: string;
  description: string;
  status: string;
  trigger: string;
  created_at: string;
  last_run: string | null;
  total_runs: number;
  automation_steps: DbStep[];
}

interface DbStep {
  id: string;
  name: string;
  status: string;
  duration: string | null;
  condition: string | null;
  retry_config: any;
  step_order: number;
  kind?: string;
  config?: any;
}

function mapAutomation(row: DbAutomation): Automation & { steps: (AutomationStep & { kind?: string; config?: any })[] } {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status as Automation["status"],
    trigger: row.trigger,
    createdAt: row.created_at,
    lastRun: row.last_run || undefined,
    totalRuns: row.total_runs,
    steps: (row.automation_steps || [])
      .sort((a, b) => a.step_order - b.step_order)
      .map((s) => ({
        id: s.id,
        name: s.name,
        status: s.status as AutomationStep["status"],
        duration: s.duration || undefined,
        condition: s.condition || undefined,
        retry: s.retry_config
          ? { maxRetries: s.retry_config.maxRetries, delay: s.retry_config.delay }
          : undefined,
        kind: s.kind,
        config: s.config,
      })),
  };
}

async function fetchAutomations(): Promise<ReturnType<typeof mapAutomation>[]> {
  const { data, error } = await supabase
    .from("automations")
    .select("*, automation_steps(*)")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map((row: any) => mapAutomation(row));
}

export function useAutomations() {
  useRealtimeTable("automations", [["automations"]]);
  useRealtimeTable("automation_steps", [["automations"]]);
  return useQuery({ queryKey: ["automations"], queryFn: fetchAutomations });
}

export function useAddAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (auto: {
      name: string;
      description: string;
      status?: string;
      trigger: string;
      steps: BuilderStep[];
    }) => {
      const { data: row, error } = await supabase
        .from("automations")
        .insert({
          name: auto.name,
          description: auto.description,
          status: auto.status ?? "active",
          trigger: auto.trigger,
        })
        .select()
        .single();
      if (error) throw error;
      if (auto.steps.length > 0) {
        const { error: stepsErr } = await supabase.from("automation_steps").insert(
          auto.steps.map((s, i) => ({
            automation_id: row.id,
            name: s.name,
            status: "pending",
            kind: s.kind,
            config: s.config ?? {},
            condition: s.condition || null,
            retry_config: s.retry || null,
            step_order: i,
          })),
        );
        if (stepsErr) throw stepsErr;
      }
      await supabase.from("activity_events").insert({
        type: "installed",
        message: `Automation "${auto.name}" created`,
        category: "Automation",
      });
      return row;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["automations"] });
      qc.invalidateQueries({ queryKey: ["activity"] });
    },
  });
}

export function useDeleteAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // delete steps first (no FK cascade configured)
      await supabase.from("automation_steps").delete().eq("automation_id", id);
      await supabase.from("step_runs").delete().eq("run_id", id); // safe no-op for stale data
      await supabase.from("runs").delete().eq("automation_id", id);
      const { error } = await supabase.from("automations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["automations"] }),
  });
}

export function useToggleAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: row } = await supabase
        .from("automations")
        .select("status")
        .eq("id", id)
        .single();
      const next = row?.status === "active" ? "inactive" : "active";
      const { error } = await supabase
        .from("automations")
        .update({ status: next })
        .eq("id", id);
      if (error) throw error;
      return next;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["automations"] }),
  });
}
