import "server-only";

import {
  buildOrderStatusUpdateEmail,
  getCheckoutOrderMailPayload,
} from "@/modules/checkout/mail.service";
import type { NotificationEvent } from "./notification.types";

export interface RenderedEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Returns `null` when the email should be permanently skipped — e.g. the
 * underlying order was deleted between enqueue and dispatch. The dispatcher
 * treats `null` as a permanent failure and marks the job DEAD.
 */
export async function renderNotification(
  event: NotificationEvent,
): Promise<RenderedEmail | null> {
  switch (event.type) {
    case "ORDER_STATUS_UPDATE": {
      const order = await getCheckoutOrderMailPayload(event.payload.orderId);
      if (!order) return null;
      const { subject, html, text } = buildOrderStatusUpdateEmail(
        order,
        event.payload.nextStatus,
        event.payload.notes,
      );
      return { to: order.user.email, subject, html, text };
    }
  }
}
