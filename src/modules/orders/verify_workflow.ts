import { AdjustmentType, OrderStatus, PaymentStatus } from "../../generated/prisma/client";
import prisma from "../../lib/prisma";
import { addOrderAdjustment } from "./order.adjustment";
import { updateOrderStatus } from "./order.services";

async function runVerification() {
  console.log("Starting Managed Workflow Verification...");

  // 1. Create Mock Order
  const testOrder = await prisma.order.create({
    data: {
      userId: "test-user-id", // Assume this exists or use a valid one
      deliveryStreet: "Test St",
      deliveryCity: "Stockholm",
      deliveryPostalCode: "12345",
      deliveryCountry: "Sweden",
      subtotalPrice: 500,
      totalPrice: 500,
      status: OrderStatus.IN_PROCESS,
      items: {
        create: {
          productId: "any-valid-product-id", // Placeholder
          quantity: 1,
          productName: "Test Product",
          price: 500,
          lineTotal: 500
        }
      }
    }
  });

  console.log(`Test Order Created: ${testOrder.id} (Status: IN_PROCESS)`);

  try {
    // 2. Add Adjustment
    console.log("Attempting to add Delivery Fee (79 SEK)...");
    await addOrderAdjustment({
      orderId: testOrder.id,
      type: AdjustmentType.DELIVERY_FEE,
      amount: 79,
      description: "Express Shipping",
      actorId: "admin-1"
    });

    const updated = await prisma.order.findUnique({ where: { id: testOrder.id } });
    console.log(`New Total: ${updated?.totalPrice} SEK (Adjustment Total: ${updated?.adjustmentTotal})`);

    if (Number(updated?.totalPrice) !== 579) throw new Error("Price calculation mismatch!");
    console.log("Atomic Calculation Verified.");

    // 3. Test Security Guard: Try to confirm without payment
    console.log("🔒 Attempting illegal transition to CONFIRMED without payment...");
    try {
      await updateOrderStatus({
        orderId: testOrder.id,
        nextStatus: OrderStatus.CONFIRMED,
        actorId: "admin-1",
        actorRole: "ADMIN"
      });
      console.error("FAILED: Security guard did not block confirmation.");
    } catch (e) {
      const error = e as Error;
      console.log(`SUCCESS: Blocked illegal transition. Reason: ${error.message}`);
    }

    // 4. Finalize Adjustment -> Move to AWAITING_PAYMENT
    console.log("Finalizing review and moving to AWAITING_PAYMENT...");
    await updateOrderStatus({
      orderId: testOrder.id,
      nextStatus: OrderStatus.AWAITING_PAYMENT,
      actorId: "admin-1",
      actorRole: "ADMIN"
    });
    console.log("Transition to AWAITING_PAYMENT Successful.");

    // 5. Test Immutability: Try to adjust after finalized
    console.log("Attempting to adjust price while AWAITING_PAYMENT (should be locked)...");
    try {
      await addOrderAdjustment({
        orderId: testOrder.id,
        type: AdjustmentType.DISCOUNT,
        amount: -10,
        actorId: "admin-1"
      });
      console.error("FAILED: Immutability guard did not block adjustment.");
    } catch (e) {
      const error = e as Error;
      console.log(`SUCCESS: Financials locked. Reason: ${error.message}`);
    }

    // 6. Simulate Payment Receipt and Confirm
    console.log("Marking as PAID via provider signal...");
    await prisma.order.update({
      where: { id: testOrder.id },
      data: { paymentStatus: PaymentStatus.RECEIVED }
    });

    await updateOrderStatus({
      orderId: testOrder.id,
      nextStatus: OrderStatus.CONFIRMED,
      actorId: "admin-1",
      actorRole: "ADMIN"
    });
    console.log(" Order CONFIRMED after payment verification.");

  } finally {
    // Cleanup
    // await prisma.order.delete({ where: { id: testOrder.id } });
    console.log("Verification Completed.");
  }
}

runVerification().catch(console.error);
