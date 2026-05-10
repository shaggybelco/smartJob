import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { RealtimeEvent } from "@smartjob/shared";
import { apiUrl } from "./client";

const SOURCE_URL = apiUrl("/realtime");

export function useRealtime(enabled: boolean) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    const source = new EventSource(SOURCE_URL, { withCredentials: true });

    source.onmessage = (msg) => {
      try {
        const event = JSON.parse(msg.data) as RealtimeEvent;
        if (event.type === "ping") return;
        qc.invalidateQueries({ queryKey: ["jobApplications"] });
        qc.invalidateQueries({ queryKey: ["applications"] });
        qc.invalidateQueries({ queryKey: ["jobs"] });
      } catch {
        /* ignore malformed events */
      }
    };

    source.onerror = () => {
      // Browser will retry automatically; nothing to do.
    };

    return () => source.close();
  }, [enabled, qc]);
}
