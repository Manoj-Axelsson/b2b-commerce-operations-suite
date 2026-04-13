import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const cart = await prisma.cart.findFirst({
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        return NextResponse.json(cart || { items: [] });
    } catch (error) {
        console.error("API_GET_CART_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        await prisma.cartItem.deleteMany({});
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { error: "Failed to clear cart" },
            { status: 500 }
        );
    }
}
