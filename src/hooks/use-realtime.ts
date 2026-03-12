import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribe to Postgres changes on a table and auto-invalidate the given query keys.
 */
export function useRealtimeTable(
  table: string,
  queryKeys: string[][],
) {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          queryKeys.forEach((key) => qc.invalidateQueries({ queryKey: key }));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, qc]); // queryKeys is stable per call site
}
