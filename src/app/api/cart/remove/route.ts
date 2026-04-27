import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/cart/remove — removes a specific product from the cart entirely
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.user) {
            return new Response("Unauthorized", { status: 401 });
        }

        // Only approved users can access the cart
        const dbUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { isApproved: true },
        });

        if (!dbUser?.isApproved) {
            return new Response("Forbidden: account pending approval", { status: 403 });
        }

        const userId = session.user.id;
        const body = await request.json();
        const productId = body.productId as string;

        if (!productId) {
            return new Response("Missing productId", { status: 400 });
        }

        const cart = await prisma.cart.findUnique({ where: { userId } });

        if (!cart) {
            return new Response("Cart not found", { status: 404 });
        }

        await prisma.cartItem.deleteMany({
            where: { cartId: cart.id, productId },
        });

        return new Response(null, { status: 204 });

    } catch (error) {
        console.error("POST /api/cart/remove error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
