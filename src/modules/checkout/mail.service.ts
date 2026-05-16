import "server-only";

import { sendEmail } from "@/lib/mail";
import prisma from "@/lib/prisma";
import { ADMIN_EMAIL } from "@/lib/utils";
import { z } from "zod";
import type { CheckoutOrderMailResult, SendCheckoutOrderMailInput } from "./mail.types";

const CHECKOUT_EMAIL_TIMEOUT_MS = 5_000;

const sendCheckoutOrderMailSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
});

async function getCheckoutOrderMailPayload(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

type CheckoutOrderMailPayload = NonNullable<Awaited<ReturnType<typeof getCheckoutOrderMailPayload>>>;

function formatCurrency(value: { toString(): string } | number | null): string {
  if (value === null) return "0,00 SEK";

  const amountInCents = typeof value === "number" ? value : Number(value.toString());
  const amount = amountInCents / 100;

  return (
    amount.toLocaleString("sv-SE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " SEK"
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildLineItemsHtml(order: CheckoutOrderMailPayload): string {
  return order.items
    .map((item) => {
      const lineTotal = item.lineTotal ?? item.price;
      return `<li>${escapeHtml(item.productName)} x ${item.quantity} - ${formatCurrency(lineTotal)}</li>`;
    })
    .join("");
}

function buildCustomerEmail(order: CheckoutOrderMailPayload): {
  subject: string;
  html: string;
  text: string;
} {
  const orderNumber = order.id.slice(-6).toUpperCase();

  return {
    subject: `Rajput Foods Sweden order request #${orderNumber}`,
    html: `
      <p>Hi ${escapeHtml(order.user.name)},</p>
      <p>We have received your order request <strong>#${orderNumber}</strong>.</p>
      <p>Our team will review it and contact you with the final quote and payment instructions.</p>
      <p><strong>Delivery address</strong><br>
      ${escapeHtml(order.deliveryStreet)}<br>
      ${escapeHtml(order.deliveryPostalCode)} ${escapeHtml(order.deliveryCity)}<br>
      ${escapeHtml(order.deliveryCountry)}</p>
      <p><strong>Items</strong></p>
      <ul>${buildLineItemsHtml(order)}</ul>
      <p><strong>Estimated total:</strong> ${formatCurrency(order.totalPrice)}</p>
      <p>Rajput Foods Sweden</p>
    `,
    text: [
      `Hi ${order.user.name},`,
      `We have received your order request #${orderNumber}.`,
      "Our team will review it and contact you with the final quote and payment instructions.",
      `Estimated total: ${formatCurrency(order.totalPrice)}`,
      "Rajput Foods Sweden",
    ].join("\n\n"),
  };
}

function buildAdminEmail(order: CheckoutOrderMailPayload): {
  subject: string;
  html: string;
  text: string;
} {
  const orderNumber = order.id.slice(-6).toUpperCase();

  return {
    subject: `New checkout order request #${orderNumber}`,
    html: `
      <p>A new order request is ready for review.</p>
      <p><strong>Order:</strong> ${escapeHtml(order.id)}</p>
      <p><strong>Customer:</strong> ${escapeHtml(order.user.name)} (${escapeHtml(order.user.email)})</p>
      <p><strong>Total:</strong> ${formatCurrency(order.totalPrice)}</p>
      <p><strong>Items</strong></p>
      <ul>${buildLineItemsHtml(order)}</ul>
    `,
    text: [
      "A new order request is ready for review.",
      `Order: ${order.id}`,
      `Customer: ${order.user.name} (${order.user.email})`,
      `Total: ${formatCurrency(order.totalPrice)}`,
    ].join("\n"),
  };
}

export async function sendCheckoutOrderReceivedEmail(
  input: SendCheckoutOrderMailInput
): Promise<CheckoutOrderMailResult> {
  const validated = sendCheckoutOrderMailSchema.parse(input);
  const result: CheckoutOrderMailResult = {
    orderId: validated.orderId,
    sent: [],
    skipped: [],
  };

  if (input.signal?.aborted) {
    result.skipped.push("request was cancelled before checkout email dispatch");
    return result;
  }

  const order = await getCheckoutOrderMailPayload(validated.orderId);

  if (!order) {
    result.skipped.push("order was not found");
    return result;
  }

  if (order.sentToAdminMail) {
    result.skipped.push("checkout email already dispatched for this order");
    return result;
  }

  const customerEmail = buildCustomerEmail(order);
  await sendEmail({
    to: order.user.email,
    ...customerEmail,
    signal: input.signal,
    timeoutMs: CHECKOUT_EMAIL_TIMEOUT_MS,
    throwOnFailure: true,
  });
  result.sent.push("customer");

  const settings = await prisma.settings.findFirst({
    select: { adminEmailNotifications: true },
  });

  if (settings?.adminEmailNotifications !== false && ADMIN_EMAIL) {
    const adminEmail = buildAdminEmail(order);
    await sendEmail({
      to: ADMIN_EMAIL,
      ...adminEmail,
      signal: input.signal,
      timeoutMs: CHECKOUT_EMAIL_TIMEOUT_MS,
      throwOnFailure: true,
    });
    result.sent.push("admin");
  } else {
    result.skipped.push("admin email notifications are disabled");
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { sentToAdminMail: true },
  });

  return result;
}

/**
 * Sends an email to the customer notifying them that their order has been approved.
 */
export async function sendOrderApprovedEmail(
  orderId: string,
  adminName: string
): Promise<void> {
  const order = await getCheckoutOrderMailPayload(orderId);

  if (!order) {
    console.error(`[MAIL_SERVICE] Cannot send approval email: Order ${orderId} not found`);
    return;
  }

  await sendEmail({
    to: order.user.email,
    subject: `Order Approved by ${adminName}`,
    text: `This order was approved by ${adminName}`,
    html: `
      <p>Hi ${escapeHtml(order.user.name)},</p>
      <p>Greetings! Your order has been approved by <strong>${escapeHtml(adminName)}</strong>.</p>
      <p>Thank you for shopping with usWe will contact you shortly with the final steps.</p>
      <p>Rajput Foods Sweden</p>
    `,
    throwOnFailure: true,
  });
}

/**
 * Sends an email to the customer when their order status is updated.
 */
export async function sendOrderStatusUpdateEmail(
  orderId: string,
  newStatus: string,
  notes?: string
): Promise<void> {
  const order = await getCheckoutOrderMailPayload(orderId);

  if (!order) {
    console.error(`[MAIL_SERVICE] Cannot send status update email: Order ${orderId} not found`);
    return;
  }

  const orderNumber = order.id.slice(-6).toUpperCase();
  const statusDisplay = newStatus.replace(/_/g, " ");
  let subject = `Order #${orderNumber} status update`;
  let title = "Order Status Update";
  let content = `The status of your order <strong>#${orderNumber}</strong> has been updated to <strong>${statusDisplay}</strong>.`;

  // Customize based on status
  if (newStatus === "CANCELLED") {
    subject = `Order #${orderNumber} has been cancelled`;
    title = "Order Cancelled";
    content = `Your order <strong>#${orderNumber}</strong> has been cancelled by the administrator.`;
  } else if (newStatus === "AWAITING_PAYMENT") {
    subject = `Payment request for Order #${orderNumber}`;
    title = "Awaiting Payment";
    content = `Your order <strong>#${orderNumber}</strong> has been reviewed and is now awaiting payment. You will receive payment instructions shortly.`;
  } else if (newStatus === "SHIPPED") {
    subject = `Order #${orderNumber} is on its way!`;
    title = "Order Shipped";
    content = `Great news! Your order <strong>#${orderNumber}</strong> has been shipped and is heading to your delivery address.`;
  } else if (newStatus === "DELIVERED") {
    subject = `Order #${orderNumber} delivered`;
    title = "Order Delivered";
    content = `Your order <strong>#${orderNumber}</strong> has been marked as delivered. We hope you enjoy your purchase!`;
  }

  await sendEmail({
    to: order.user.email,
    subject,
    text: `${title}\n\n${content.replace(/<[^>]*>/g, "")}\n\n${notes ? `Notes: ${notes}\n\n` : ""}Rajput Foods Sweden`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
        <h2 style="color: #d4af37;">${title}</h2>
        <p>Hi ${escapeHtml(order.user.name)},</p>
        <p>${content}</p>
        ${notes ? `<div style="margin: 20px 0; padding: 15px; background: #f9f9f9; border-left: 4px solid #d4af37;"><strong>Admin Notes:</strong><br/>${escapeHtml(notes)}</div>` : ""}
        <p>You can view your order details in your account dashboard.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777;">Rajput Foods Sweden</p>
      </div>
    `,
    throwOnFailure: true,
  });
}
