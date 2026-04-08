import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/cart/add — adds a product to the cart, or increments its quantity
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.user) {
            return new Response("Unauthorized", { status: 401 });
        }

        const userId = session.user.id;
        const body = await request.json();
        const productId = body.productId as string;

        if (!productId) {
            return new Response("Missing productId", { status: 400 });
        }

        // Validate the product exists and has stock
        const product = await prisma.product.findUnique({ where: { id: productId } });

        if (!product) {
            return new Response("Product not found", { status: 404 });
        }

        if (product.quantity <= 0) {
            return new Response("Product is out of stock", { status: 422 });
        }

        // Find or create the user's cart
        let cart = await prisma.cart.findUnique({ where: { userId } });

        if (!cart) {
            cart = await prisma.cart.create({ data: { userId } });
        }

        const existingItem = await prisma.cartItem.findUnique({
            where: { cartId_productId: { cartId: cart.id, productId } },
        });

        if (existingItem) {
            const newQuantity = existingItem.quantity + 1;

            // Guard: do not exceed stock level
            if (newQuantity > product.quantity) {
                return new Response("Cannot exceed available stock", { status: 422 });
            }

            await prisma.cartItem.update({
                where: { cartId_productId: { cartId: cart.id, productId } },
                data: { quantity: newQuantity },
            });
        } else {
            await prisma.cartItem.create({
                data: { cartId: cart.id, productId, quantity: 1 },
            });
        }

        return new Response(null, { status: 204 });

    } catch (error) {
        console.error("POST /api/cart/add error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
