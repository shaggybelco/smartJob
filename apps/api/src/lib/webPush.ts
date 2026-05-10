import webpush, { type PushSubscription } from "web-push";
import { env } from "../config/env.js";

let configured = false;

const ensureConfigured = () => {
  if (configured) return;
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) return;
  webpush.setVapidDetails(env.MAIL_FROM, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
  configured = true;
};

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export const sendPush = async (
  subscription: PushSubscription,
  payload: PushPayload,
) => {
  ensureConfigured();
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) return;
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (err) {
    // 410 Gone means the subscription is no longer valid; let the caller decide.
    throw err;
  }
};

export const isPushConfigured = () => !!env.VAPID_PUBLIC_KEY && !!env.VAPID_PRIVATE_KEY;
