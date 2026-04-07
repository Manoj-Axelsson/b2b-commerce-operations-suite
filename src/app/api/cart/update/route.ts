import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/cart/update — sets the quantity of a cart item to an explicit value
// Removes the item if quantity drops to zero or below
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.user) {
            return new Response("Unauthorized", { status: 401 });
        }

        const userId = session.user.id;
        const body = await request.json();
        const productId = body.productId as string;
        const quantity = body.quantity as number;

        if (!productId || quantity == null) {
            return new Response("Missing productId or quantity", { status: 400 });
        }

        const cart = await prisma.cart.findUnique({ where: { userId } });

        if (!cart) {
            return new Response("Cart not found", { status: 404 });
        }

        // Quantity of zero or below — remove the item instead
        if (quantity <= 0) {
            await prisma.cartItem.deleteMany({
                where: { cartId: cart.id, productId },
            });

            return new Response(null, { status: 204 });
        }

        // Validate quantity does not exceed stock
        const product = await prisma.product.findUnique({ where: { id: productId } });

        if (!product) {
            return new Response("Product not found", { status: 404 });
        }

        const cappedQuantity = Math.min(quantity, product.quantity);

        await prisma.cartItem.updateMany({
            where: { cartId: cart.id, productId },
            data: { quantity: cappedQuantity },
        });

        return new Response(null, { status: 204 });

    } catch (error) {
        console.error("POST /api/cart/update error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
