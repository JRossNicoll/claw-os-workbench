import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SecretRow {
  id: string;
  name: string;
  value_hint: string;
  created_at: string;
  last_used: string | null;
  used_by: number;
}

export function useSecrets() {
  return useQuery({
    queryKey: ["secrets"],
    queryFn: async (): Promise<SecretRow[]> => {
      const { data, error } = await supabase
        .from("secrets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useAddSecret() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from("secrets").insert({ name });
      if (error) throw error;
      await supabase.from("activity_events").insert({
        type: "started",
        message: `Secret "${name}" added`,
        category: "System",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["secrets"] });
      qc.invalidateQueries({ queryKey: ["activity"] });
    },
  });
}

export function useDeleteSecret() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("secrets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["secrets"] }),
  });
}
