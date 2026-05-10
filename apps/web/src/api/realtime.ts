import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { RealtimeEvent } from "@smartjob/shared";
import { apiUrl } from "./client";

const SOURCE_URL = apiUrl("/realtime");

type Listener = (event: RealtimeEvent) => void;
const listeners = new Set<Listener>();

export const subscribeRealtime = (fn: Listener): (() => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

export function useRealtime(enabled: boolean) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    const source = new EventSource(SOURCE_URL, { withCredentials: true });

    source.onmessage = (msg) => {
      try {
        const event = JSON.parse(msg.data) as RealtimeEvent;
        if (event.type === "ping") return;

        if (event.type === "chat.message" || event.type === "chat.read") {
          qc.invalidateQueries({ queryKey: ["chat"] });
        }
        if (event.type === "application.status" || event.type === "application.created") {
          qc.invalidateQueries({ queryKey: ["jobApplications"] });
          qc.invalidateQueries({ queryKey: ["applications"] });
          qc.invalidateQueries({ queryKey: ["jobs"] });
        }

        for (const fn of listeners) fn(event);
      } catch {
        /* ignore malformed events */
      }
    };

    source.onerror = () => {
      // Browser auto-retries.
    };

    return () => source.close();
  }, [enabled, qc]);
}
