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
      const { data: engine } = await supabase
        .from("engines")
        .select("name")
        .eq("slug", engineSlug)
        .single();
      const { error } = await supabase
        .from("engines")
        .update({ installed: true })
        .eq("slug", engineSlug);
      if (error) throw error;
      await supabase.from("activity_events").insert({
        type: "installed",
        message: `${engine?.name ?? engineSlug} engine installed`,
        category: "Engine",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["engines"] });
      qc.invalidateQueries({ queryKey: ["activity"] });
    },
  });
}

export function useUninstallEngine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (engineSlug: string) => {
      const { error } = await supabase
        .from("engines")
        .update({ installed: false })
        .eq("slug", engineSlug);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["engines"] }),
  });
}
