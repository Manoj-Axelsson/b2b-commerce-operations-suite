export interface SendCheckoutOrderMailInput {
  orderId: string;
  signal?: AbortSignal;
}

export type CheckoutOrderMailRecipient = "customer" | "admin";

export interface CheckoutOrderMailResult {
  orderId: string;
  sent: CheckoutOrderMailRecipient[];
  skipped: string[];
}
