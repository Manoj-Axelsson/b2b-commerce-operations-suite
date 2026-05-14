import "server-only";

import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/mail";
import { ADMIN_EMAIL } from "@/lib/utils";
import { z } from "zod";
import type { SendCheckoutOrderMailInput, CheckoutOrderMailResult } from "./mail.types";

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
  if (value === null) return "0 SEK";

  const amount = typeof value === "number" ? value : Number(value.toString());
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
  }).format(amount);
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
