import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { BusinessError, formatSafeResponse } from "@/lib/error";
import { runManagedTransaction } from "@/lib/managedTransaction";

// POST /api/cart/update — sets the user's cart line for a product to an explicit quantity.
//
// CONTRACT: cart quantity is ADVISORY, not authoritative.
//   - This endpoint clamps to product.quantity as seen at write time, but does NOT
//     lock or reserve stock. An admin (or another order) may reduce stock between
//     this write and the eventual checkout, leaving cart.quantity > product.quantity
//     for a window. That is acceptable.
//   - The HARD stock guarantee lives in order placement / admin order review, which
//     re-validates every line item against current stock under a row-level lock
//     before persisting the order.
//
// Treat the cart as a draft of intent. Treat the order as the source of truth.

const MAX_QUANTITY = 999;

const bodySchema = z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(0).max(MAX_QUANTITY),
});

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
        return new Response("Unauthorized", { status: 401 });
    }

    // Only approved users can write to the cart (matches sibling cart routes).
    const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isApproved: true },
    });
    if (!dbUser?.isApproved) {
        return new Response("Forbidden: account pending approval", { status: 403 });
    }

    let raw: unknown;
    try {
        raw = await request.json();
    } catch {
        return new Response("Invalid JSON", { status: 400 });
    }

    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
        return new Response("Invalid body", { status: 400 });
    }
    const { productId, quantity } = parsed.data;
    const userId = session.user.id;

    try {
        // runManagedTransaction sets statement_timeout / lock_timeout /
        // idle_in_transaction_session_timeout as SET LOCAL for this txn.
        // Postgres default isolation (READ COMMITTED) is intentional — see CONTRACT.
        const result = await runManagedTransaction(request.signal, async (tx) => {
            // Atomic via INSERT ... ON CONFLICT (userId is @unique on Cart).
            const cart = await tx.cart.upsert({
                where: { userId },
                create: { userId },
                update: {},
                select: { id: true },
            });

            // Declarative zero — remove the line entirely. Idempotent.
            if (quantity === 0) {
                await tx.cartItem.deleteMany({
                    where: { cartId: cart.id, productId },
                });
                return { productId, quantity: 0, stock: null as number | null };
            }

            const product = await tx.product.findUnique({
                where: { id: productId },
                select: { quantity: true, isActive: true, isDeleted: true },
            });

            if (!product || product.isDeleted || !product.isActive) {
                throw new BusinessError("Product not found", 404);
            }

            const final = Math.min(quantity, product.quantity);

            // Stock dropped to 0 — collapse to a delete rather than writing a 0-qty row.
            if (final <= 0) {
                await tx.cartItem.deleteMany({
                    where: { cartId: cart.id, productId },
                });
                return { productId, quantity: 0, stock: product.quantity };
            }

            // Single INSERT ... ON CONFLICT DO UPDATE — atomic at the row level.
            await tx.cartItem.upsert({
                where: { cartId_productId: { cartId: cart.id, productId } },
                create: { cartId: cart.id, productId, quantity: final },
                update: { quantity: final },
            });

            return { productId, quantity: final, stock: product.quantity };
        });

        return NextResponse.json(result);

    } catch (error) {
        // BusinessError (incl. 404 thrown inside the txn) and unexpected errors
        // both flow through the team's masked-response helper.
        return formatSafeResponse(error);
    }
}
