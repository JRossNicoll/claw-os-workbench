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

export function useRunAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (automation: { id: string; name: string; stepsCount: number }) => {
      const now = new Date();

      // Insert the run
      const { data: run, error } = await supabase
        .from("runs")
        .insert({
          automation_id: automation.id,
          automation_name: automation.name,
          status: "running",
          trigger: "Manual",
          steps: automation.stepsCount,
          steps_completed: 0,
          logs: [
            { timestamp: now.toLocaleTimeString(), level: "info", message: `Starting ${automation.name}...` },
          ],
        })
        .select()
        .single();
      if (error) throw error;

      // Update the automation's last_run and total_runs
      await supabase
        .from("automations")
        .update({
          last_run: "just now",
          total_runs: undefined, // We'll increment via raw
        })
        .eq("id", automation.id);

      // Log activity
      await supabase.from("activity_events").insert({
        type: "started",
        message: `${automation.name} started manually`,
        category: "Automation",
      });

      // Simulate completion after 2s
      setTimeout(async () => {
        const completedAt = new Date();
        const durationMs = completedAt.getTime() - now.getTime();
        const durationStr = `${(durationMs / 1000).toFixed(1)}s`;

        await supabase
          .from("runs")
          .update({
            status: "success",
            steps_completed: automation.stepsCount,
            duration: durationStr,
            completed_at: completedAt.toISOString(),
            logs: [
              { timestamp: now.toLocaleTimeString(), level: "info", message: `Starting ${automation.name}...` },
              { timestamp: completedAt.toLocaleTimeString(), level: "info", message: "All steps completed successfully" },
            ],
          })
          .eq("id", run.id);

        await supabase.from("activity_events").insert({
          type: "completed",
          message: `${automation.name} completed successfully`,
          detail: `Duration: ${durationStr}`,
          category: "Automation",
        });

        qc.invalidateQueries({ queryKey: ["runs"] });
        qc.invalidateQueries({ queryKey: ["automations"] });
        qc.invalidateQueries({ queryKey: ["activity"] });
      }, 2500);

      return run;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["runs"] });
      qc.invalidateQueries({ queryKey: ["activity"] });
    },
  });
}
