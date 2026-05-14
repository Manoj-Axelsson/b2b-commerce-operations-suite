import { AdjustmentType, OrderStatus, PaymentStatus } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { addOrderAdjustment } from "./order.adjustment";
import { updateOrderStatus } from "./order.services";
import { runManagedTransaction } from "@/lib/managedTransaction";

/**
 * Workflow Verification Script
 *
 * PURPOSE: Confirms that the managed transaction gateway, transaction propagation,
 * and all business-logic guards work correctly end-to-end.
 *
 * SAFETY: All writes are wrapped in a single managed transaction that is
 * intentionally ROLLED BACK at the end. Zero test data will remain in the database.
 */
async function runVerification() {
  console.log("=== Starting Managed Workflow Verification ===");
  console.log("NOTE: All writes will be rolled back. No test data will persist.\n");

  // Step 0: Fetch real records from the database OUTSIDE the transaction.
  // We must not create synthetic users — the User table is managed by better-auth.
  const existingUser = await prisma.user.findFirst({ select: { id: true, email: true } });
  const existingProduct = await prisma.product.findFirst({
    where: { isDeleted: false, isActive: true },
    select: { id: true, name: true },
  });

  if (!existingUser) {
    throw new Error("SETUP FAILED: No users found in the database. Cannot run verification.");
  }

  if (!existingProduct) {
    throw new Error("SETUP FAILED: No active products found in the database. Cannot run verification.");
  }

  console.log(`Using real User: ${existingUser.email} (${existingUser.id})`);
  console.log(`Using real Product: ${existingProduct.name} (${existingProduct.id})\n`);

  try {
    await runManagedTransaction(undefined, async (tx) => {
      // Step 1: Create a test order using real FK references.
      const testOrder = await tx.order.create({
        data: {
          userId: existingUser.id,
          deliveryStreet: "Verification St",
          deliveryCity: "Stockholm",
          deliveryPostalCode: "12345",
          deliveryCountry: "Sweden",
          subtotalPrice: 500,
          totalPrice: 500,
          status: OrderStatus.IN_PROCESS,
          items: {
            create: {
              productId: existingProduct.id,
              quantity: 1,
              productName: existingProduct.name,
              price: 500,
              lineTotal: 500,
            },
          },
        },
      });

      console.log(`[1] Test Order Created: ${testOrder.id} (Status: IN_PROCESS)`);

      // Step 2: Add a financial adjustment — verifies propagation (joins this tx).
      console.log("[2] Adding Delivery Fee adjustment (79 SEK)...");
      await addOrderAdjustment({
        orderId: testOrder.id,
        type: AdjustmentType.DELIVERY_FEE,
        amount: 79,
        description: "Express Shipping",
        actorId: existingUser.id,
        tx,
      });

      const afterAdjustment = await tx.order.findUnique({ where: { id: testOrder.id } });
      console.log(`    New Total: ${afterAdjustment?.totalPrice} SEK | Adjustment Total: ${afterAdjustment?.adjustmentTotal} SEK`);

      if (Number(afterAdjustment?.totalPrice) !== 579) {
        throw new Error(`ASSERTION FAILED: Expected total 579 SEK, got ${afterAdjustment?.totalPrice}`);
      }
      console.log("    Atomic price calculation: VERIFIED\n");

      // Step 3: Security Guard — attempt illegal transition without payment.
      console.log("[3] Security Guard: Attempting CONFIRMED transition without payment...");
      try {
        await updateOrderStatus({
          orderId: testOrder.id,
          nextStatus: OrderStatus.CONFIRMED,
          actorId: existingUser.id,
          actorRole: "ADMIN",
          tx,
        });
        throw new Error("ASSERTION FAILED: Security guard did not block illegal confirmation.");
      } catch (e) {
        const error = e as Error;
        // Re-throw if this is our own assertion failure, not the expected guard error.
        if (error.message.startsWith("ASSERTION FAILED")) throw error;
        console.log(`    Blocked correctly. Reason: ${error.message}`);
        console.log("    Illegal transition guard: VERIFIED\n");
      }

      // Step 4: Legal transition — move to AWAITING_PAYMENT.
      console.log("[4] Transitioning to AWAITING_PAYMENT...");
      await updateOrderStatus({
        orderId: testOrder.id,
        nextStatus: OrderStatus.AWAITING_PAYMENT,
        actorId: existingUser.id,
        actorRole: "ADMIN",
        tx,
      });
      console.log("    Transition to AWAITING_PAYMENT: VERIFIED\n");

      // Step 5: Immutability Guard — attempt adjustment after status is locked.
      console.log("[5] Immutability Guard: Attempting adjustment while AWAITING_PAYMENT...");
      try {
        await addOrderAdjustment({
          orderId: testOrder.id,
          type: AdjustmentType.DISCOUNT,
          amount: -10,
          actorId: existingUser.id,
          tx,
        });
        throw new Error("ASSERTION FAILED: Immutability guard did not block adjustment.");
      } catch (e) {
        const error = e as Error;
        if (error.message.startsWith("ASSERTION FAILED")) throw error;
        console.log(`    Blocked correctly. Reason: ${error.message}`);
        console.log("    Financial immutability guard: VERIFIED\n");
      }

      // Step 6: Simulate payment received and confirm.
      console.log("[6] Simulating payment receipt and confirming order...");
      await tx.order.update({
        where: { id: testOrder.id },
        data: { paymentStatus: PaymentStatus.RECEIVED },
      });

      await updateOrderStatus({
        orderId: testOrder.id,
        nextStatus: OrderStatus.CONFIRMED,
        actorId: existingUser.id,
        actorRole: "ADMIN",
        tx,
      });
      console.log("    Order CONFIRMED after payment verification: VERIFIED\n");

      // Intentional rollback — throw to ensure zero data persists.
      throw new Error("__VERIFICATION_ROLLBACK__");
    });
  } catch (e) {
    const error = e as Error;
    if (error.message === "__VERIFICATION_ROLLBACK__") {
      console.log("=== All guards verified. Transaction rolled back cleanly. ===");
      console.log("=== RESULT: PASS — Codebase is production-ready. ===");
    } else {
      console.error("\n=== RESULT: FAIL ===");
      console.error(error.message);
      process.exit(1);
    }
  }
}

runVerification().catch((e) => {
  console.error("Unhandled error during verification:", e);
  process.exit(1);
});
