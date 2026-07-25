import { z } from "zod";

const baseNotificationSchema = z.object({
  id: z.number(),
  read: z.boolean(),
  createdAt: z.string(),
  href: z.string(),
});

export const notificationSchema = z.discriminatedUnion("type", [
  baseNotificationSchema.extend({
    type: z.literal("price_alert"),
    ticker: z.string(),
    targetPrice: z.number(),
    condition: z.enum(["above", "below"]),
  }),
  baseNotificationSchema.extend({
    type: z.literal("analysis_done"),
    ticker: z.string(),
    recommendation: z.enum(["BUY", "HOLD", "SELL"]),
  }),
  baseNotificationSchema.extend({
    type: z.literal("news"),
    ticker: z.string(),
    newsId: z.number(),
  }),
]);

export type Notification = z.infer<typeof notificationSchema>;
export type NotificationType = Notification["type"];
