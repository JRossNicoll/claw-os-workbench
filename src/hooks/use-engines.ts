import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Engine } from "@/lib/store";

async function fetchEngines(): Promise<Engine[]> {
  const { data, error } = await supabase
    .from("engines")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map((row: any) => ({
    id: row.slug,
    name: row.name,
    description: row.description,
    category: row.category,
    version: row.version,
    verified: row.verified,
    installed: row.installed,
    stars: row.stars,
    language: row.language,
    url: row.url,
  }));
}

export function useEngines() {
  return useQuery({ queryKey: ["engines"], queryFn: fetchEngines });
}

export function useInstallEngine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (engineSlug: string) => {
      const { error } = await supabase
        .from("engines")
        .update({ installed: true })
        .eq("slug", engineSlug);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["engines"] }),
  });
}
