import type { RegisterPushSubscriptionInput } from "@smartjob/shared";
import { env } from "../../config/env.js";
import { isPushConfigured, sendPush } from "../../lib/webPush.js";
import { PushRepository } from "./push.repository.js";

export const PushService = {
  async register(userId: string, input: RegisterPushSubscriptionInput) {
    return PushRepository.upsert({
      userId,
      endpoint: input.endpoint,
      p256dh: input.keys.p256dh,
      authKey: input.keys.auth,
    });
  },

  async unregister(userId: string, endpoint: string) {
    await PushRepository.removeForUser(userId, endpoint);
  },

  async notifyMessage(
    userId: string,
    msg: { threadId: string; senderName: string; preview: string },
  ) {
    if (!isPushConfigured()) return;
    const subs = await PushRepository.listForUser(userId);
    if (subs.length === 0) return;

    await Promise.allSettled(
      subs.map(async (s) => {
        try {
          await sendPush(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.authKey } },
            {
              title: `${msg.senderName} sent you a message`,
              body: msg.preview.slice(0, 140),
              url: `${env.WEB_ORIGIN}/messages/${msg.threadId}`,
            },
          );
        } catch (err: unknown) {
          // 410 Gone or 404 Not Found — clean up dead subscription
          const status = (err as { statusCode?: number })?.statusCode;
          if (status === 410 || status === 404) {
            await PushRepository.removeByEndpoint(s.endpoint).catch(() => undefined);
          }
        }
      }),
    );
  },
};
