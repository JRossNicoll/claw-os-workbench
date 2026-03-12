import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeTable } from "./use-realtime";
import type { Agent } from "@/lib/store";

async function fetchAgents(): Promise<Agent[]> {
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    type: row.type,
    status: row.status,
    engine: row.engine,
    lastRun: row.last_run,
    totalRuns: row.total_runs,
    successRate: Number(row.success_rate),
    memory: row.memory,
    model: row.model,
  }));
}

export function useAgents() {
  useRealtimeTable("agents", [["agents"]]);
  return useQuery({ queryKey: ["agents"], queryFn: fetchAgents });
}

export function useToggleAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (agentId: string) => {
      const { data: agent, error: fetchErr } = await supabase
        .from("agents")
        .select("status")
        .eq("id", agentId)
        .single();
      if (fetchErr) throw fetchErr;
      const newStatus = agent.status === "active" ? "stopped" : "active";
      const { error } = await supabase
        .from("agents")
        .update({ status: newStatus })
        .eq("id", agentId);
      if (error) throw error;
      return newStatus;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agents"] }),
  });
}

export function useCreateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (agent: {
      name: string;
      description: string;
      type: string;
      engine: string;
      model?: string;
    }) => {
      const { data, error } = await supabase
        .from("agents")
        .insert({
          name: agent.name,
          description: agent.description,
          type: agent.type,
          engine: agent.engine,
          model: agent.model || null,
          status: "idle",
        })
        .select()
        .single();
      if (error) throw error;

      // Log activity
      await supabase.from("activity_events").insert({
        type: "started",
        message: `Agent "${agent.name}" created`,
        category: "Agent",
      });

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agents"] });
      qc.invalidateQueries({ queryKey: ["activity"] });
    },
  });
}

export function useDeleteAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (agentId: string) => {
      const { error } = await supabase.from("agents").delete().eq("id", agentId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agents"] }),
  });
}
