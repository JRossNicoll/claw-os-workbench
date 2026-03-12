import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeTable } from "./use-realtime";

export interface ActivityEvent {
  id: string;
  type: string;
  message: string;
  detail: string | null;
  category: string | null;
  created_at: string;
}

export function useActivity() {
  useRealtimeTable("activity_events", [["activity"]]);
  return useQuery({
    queryKey: ["activity"],
    queryFn: async (): Promise<ActivityEvent[]> => {
      const { data, error } = await supabase
        .from("activity_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useAddActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (event: { type: string; message: string; detail?: string; category?: string }) => {
      const { error } = await supabase.from("activity_events").insert({
        type: event.type,
        message: event.message,
        detail: event.detail || null,
        category: event.category || null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activity"] }),
  });
}

/** Format a timestamp relative to now */
export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}
