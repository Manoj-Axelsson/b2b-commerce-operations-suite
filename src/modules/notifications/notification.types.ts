import { z } from "zod";

const orderStatusUpdateSchema = z.object({
  orderId: z.string().uuid(),
  previousStatus: z.string(),
  nextStatus: z.string(),
  notes: z.string().optional(),
});

export const NOTIFICATION_SCHEMAS = {
  ORDER_STATUS_UPDATE: orderStatusUpdateSchema,
} as const;

export type NotificationType = keyof typeof NOTIFICATION_SCHEMAS;

export type NotificationEvent = {
  [K in NotificationType]: {
    type: K;
    payload: z.infer<(typeof NOTIFICATION_SCHEMAS)[K]>;
    dedupeKey?: string;
  };
}[NotificationType];

export type NotificationPayloadFor<K extends NotificationType> = z.infer<
  (typeof NOTIFICATION_SCHEMAS)[K]
>;
