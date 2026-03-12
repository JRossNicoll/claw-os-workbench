import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface IntegrationRow {
  id: string;
  name: string;
  status: string;
  icon: string;
  connected_at: string | null;
  metadata: Record<string, any>;
}

export function useIntegrations() {
  return useQuery({
    queryKey: ["integrations"],
    queryFn: async (): Promise<IntegrationRow[]> => {
      const { data, error } = await supabase
        .from("integrations")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []).map((row: any) => ({
        ...row,
        metadata: row.metadata || {},
      }));
    },
  });
}

export function useToggleIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      newStatus,
      connected_at,
      metadata,
    }: {
      id: string;
      newStatus: string;
      connected_at?: string | null;
      metadata?: Record<string, any>;
    }) => {
      const update: any = { status: newStatus };
      if (connected_at !== undefined) update.connected_at = connected_at;
      if (metadata !== undefined) update.metadata = metadata;
      const { error } = await supabase
        .from("integrations")
        .update(update)
        .eq("id", id);
      if (error) throw error;

      if (newStatus === "connected") {
        const { data: row } = await supabase
          .from("integrations")
          .select("name")
          .eq("id", id)
          .single();
        await supabase.from("activity_events").insert({
          type: "online",
          message: `${row?.name || id} integration connected`,
          category: "Integration",
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["integrations"] });
      qc.invalidateQueries({ queryKey: ["activity"] });
    },
  });
}
