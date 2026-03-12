import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Automation, AutomationStep } from "@/lib/store";

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
}

function mapAutomation(row: DbAutomation): Automation {
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
      })),
  };
}

async function fetchAutomations(): Promise<Automation[]> {
  const { data, error } = await supabase
    .from("automations")
    .select("*, automation_steps(*)")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map((row: any) => mapAutomation(row));
}

export function useAutomations() {
  return useQuery({ queryKey: ["automations"], queryFn: fetchAutomations });
}

export function useAddAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (auto: { name: string; description: string; status: string; trigger: string; steps: { name: string; condition?: string; retry?: { maxRetries: number; delay: string } }[] }) => {
      const { data: row, error } = await supabase
        .from("automations")
        .insert({ name: auto.name, description: auto.description, status: auto.status, trigger: auto.trigger })
        .select()
        .single();
      if (error) throw error;
      if (auto.steps.length > 0) {
        const { error: stepsErr } = await supabase.from("automation_steps").insert(
          auto.steps.map((s, i) => ({
            automation_id: row.id,
            name: s.name,
            status: "pending",
            condition: s.condition || null,
            retry_config: s.retry || null,
            step_order: i,
          }))
        );
        if (stepsErr) throw stepsErr;
      }
      return row;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["automations"] }),
  });
}
