import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatSafeResponse } from "@/lib/error";
import { checkIsAdmin } from "@/lib/utils";

// GET /api/cart — returns the current user's cart, creating one if it doesn't exist
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.user) {
            return new Response("Unauthorized", { status: 401 });
        }

        // Only approved users (or admins) can access the cart
        const dbUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { isApproved: true, role: true, email: true },
        });

        if (!dbUser?.isApproved && !checkIsAdmin(dbUser)) {
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

        const now = new Date();
        const items = cart.items.map((item) => {
            const p = item.product;
            const isActiveOffer = p.discountPrice != null &&
                (!p.discountStart || now >= p.discountStart) &&
                (!p.discountEnd || now <= p.discountEnd);

            const effectivePrice = isActiveOffer ? p.discountPrice! : p.price;

            return {
                productId: item.productId,
                quantity: item.quantity,
                product: {
                    id: p.id,
                    name: p.name,
                    price: effectivePrice,
                    quantity: p.quantity, // stock level
                },
            };
        });

        return Response.json({ items });

    } catch (error) {
        return formatSafeResponse(error);
    }
}

// DELETE /api/cart — removes all items from the current user's cart
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.user) {
            return new Response("Unauthorized", { status: 401 });
        }

        // Only approved users (or admins) can access the cart
        const dbUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { isApproved: true, role: true, email: true },
        });

        if (!dbUser?.isApproved && !checkIsAdmin(dbUser)) {
            return new Response("Forbidden: account pending approval", { status: 403 });
        }

        const userId = session.user.id;

        const cart = await prisma.cart.findUnique({ where: { userId } });

        if (cart) {
            await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        }

        return new Response(null, { status: 204 });

    } catch (error) {
        return formatSafeResponse(error);
    }
}
