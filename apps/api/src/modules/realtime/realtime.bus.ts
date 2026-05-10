import { EventEmitter } from "node:events";
import type { RealtimeEvent } from "@smartjob/shared";

type Channel = `user:${string}` | `company:${string}`;

class RealtimeBus {
  private bus = new EventEmitter();

  constructor() {
    this.bus.setMaxListeners(0);
  }

  subscribe(channel: Channel, handler: (event: RealtimeEvent) => void) {
    this.bus.on(channel, handler);
    return () => this.bus.off(channel, handler);
  }

  publishToUser(userId: string, event: RealtimeEvent) {
    this.bus.emit(`user:${userId}` satisfies Channel, event);
  }

  publishToCompany(companyId: string, event: RealtimeEvent) {
    this.bus.emit(`company:${companyId}` satisfies Channel, event);
  }
}

export const realtime = new RealtimeBus();
