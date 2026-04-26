import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeTable } from "./use-realtime";

export interface StepRun {
  id: string;
  run_id: string;
  step_id: string | null;
  step_order: number;
  name: string;
  kind: string;
  status: "pending" | "running" | "success" | "failed" | "skipped";
  output: any;
  error: string | null;
  duration_ms: number | null;
  started_at: string | null;
  completed_at: string | null;
}

export function useStepRuns(runId?: string) {
  useRealtimeTable("step_runs", [["step_runs", runId ?? ""]]);
  return useQuery({
    queryKey: ["step_runs", runId],
    enabled: !!runId,
    queryFn: async (): Promise<StepRun[]> => {
      const { data, error } = await supabase
        .from("step_runs")
        .select("*")
        .eq("run_id", runId!)
        .order("step_order", { ascending: true });
      if (error) throw error;
      return (data || []) as StepRun[];
    },
  });
}
