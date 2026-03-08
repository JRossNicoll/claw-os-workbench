import { useEffect, useState, useRef } from "react";
import { connectEventStream } from "@/lib/api";

export interface LiveEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  detail?: string;
}

export function useEventStream(enabled: boolean = true) {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!enabled) return;

    let disposed = false;

    function connect() {
      if (disposed) return;

      const ws = connectEventStream(
        (event) => {
          const liveEvent: LiveEvent = {
            id: event.id || crypto.randomUUID(),
            type: event.type || "info",
            message: event.message || event.raw || "Unknown event",
            timestamp: event.timestamp || new Date().toLocaleTimeString(),
            detail: event.detail,
          };
          setEvents((prev) => [liveEvent, ...prev].slice(0, 100));
        },
        () => {
          setConnected(false);
          // Reconnect after 3s
          if (!disposed) {
            reconnectRef.current = setTimeout(connect, 3000);
          }
        }
      );

      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        if (!disposed) {
          reconnectRef.current = setTimeout(connect, 3000);
        }
      };

      wsRef.current = ws;
    }

    connect();

    return () => {
      disposed = true;
      wsRef.current?.close();
      clearTimeout(reconnectRef.current);
    };
  }, [enabled]);

  return { events, connected };
}
