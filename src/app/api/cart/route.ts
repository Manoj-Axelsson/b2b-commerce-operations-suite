import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/cart — returns the current user's cart, creating one if it doesn't exist
export async function GET(request: NextRequest) {
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

        let cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: { product: true },
                },
            },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
                include: {
                    items: {
                        include: { product: true },
                    },
                },
            });
        }

        const items = cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            product: {
                id: item.product.id,
                name: item.product.name,
                price: item.product.price,
                quantity: item.product.quantity, // stock level
            },
        }));

        return Response.json({ items });

    } catch (error) {
        console.error("GET /api/cart error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

// DELETE /api/cart — removes all items from the current user's cart
export async function DELETE(request: NextRequest) {
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

        const cart = await prisma.cart.findUnique({ where: { userId } });

        if (cart) {
            await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        }

        return new Response(null, { status: 204 });

    } catch (error) {
        console.error("DELETE /api/cart error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
