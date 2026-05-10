import { prisma } from "../../config/prisma.js";

export const PushRepository = {
  upsert: (data: {
    userId: string;
    endpoint: string;
    p256dh: string;
    authKey: string;
  }) =>
    prisma.pushSubscription.upsert({
      where: { endpoint: data.endpoint },
      update: { userId: data.userId, p256dh: data.p256dh, authKey: data.authKey },
      create: data,
      select: { id: true },
    }),

  removeByEndpoint: (endpoint: string) =>
    prisma.pushSubscription.deleteMany({ where: { endpoint } }),

  removeForUser: (userId: string, endpoint: string) =>
    prisma.pushSubscription.deleteMany({ where: { userId, endpoint } }),

  listForUser: (userId: string) =>
    prisma.pushSubscription.findMany({ where: { userId } }),
};
