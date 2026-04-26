import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeTable } from "./use-realtime";

export interface RunRow {
  id: string;
  automation_id: string;
  automation_name: string;
  agent_name: string | null;
  status: string;
  trigger: string;
  steps: number;
  steps_completed: number;
  duration: string | null;
  logs: { timestamp: string; level: string; message: string }[];
  started_at: string;
  completed_at: string | null;
}

export function useRuns(automationId?: string) {
  useRealtimeTable("runs", [["runs", automationId ?? ""], ["runs", undefined as any]]);
  return useQuery({
    queryKey: ["runs", automationId],
    queryFn: async (): Promise<RunRow[]> => {
      let query = supabase
        .from("runs")
        .select("*")
        .order("started_at", { ascending: false });

      if (automationId) {
        query = query.eq("automation_id", automationId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((row: any) => ({
        ...row,
        logs: Array.isArray(row.logs) ? row.logs : [],
      }));
    },
  });
}

/**
 * Real run: invokes the `run-automation` edge function which executes typed steps,
 * streams logs via realtime, and updates run + activity rows in the DB.
 */
export function useRunAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (automation: { id: string; name: string; stepsCount: number }) => {
      const { data, error } = await supabase.functions.invoke("run-automation", {
        body: { automation_id: automation.id, trigger: "Manual" },
      });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["runs"] });
      qc.invalidateQueries({ queryKey: ["automations"] });
      qc.invalidateQueries({ queryKey: ["activity"] });
    },
  });
}

export function useCancelRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (runId: string) => {
      await supabase
        .from("runs")
        .update({ status: "cancelled", completed_at: new Date().toISOString() })
        .eq("id", runId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["runs"] }),
  });
}

export function useDeleteRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (runId: string) => {
      await supabase.from("step_runs").delete().eq("run_id", runId);
      await supabase.from("runs").delete().eq("id", runId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["runs"] }),
  });
}
