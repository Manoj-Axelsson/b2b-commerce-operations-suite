import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const WishlistActionSchema = z.object({
  productId: z.string(),
  action: z.enum(["add", "remove"]),
});

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true },
    });

    if (!dbUser?.emailVerified) {
      return NextResponse.json({ error: "Email not verified" }, { status: 403 });
    }

    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      select: { productId: true },
    });

    const productIds = wishlistItems.map((item) => item.productId);

    return NextResponse.json({ productIds });
  } catch (error) {
    console.error("GET Wishlist Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true },
    });

    if (!dbUser?.emailVerified) {
      return NextResponse.json({ error: "Email not verified" }, { status: 403 });
    }

    const body = await request.json();
    const result = WishlistActionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    const { productId, action } = result.data;

    // Verify the product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (action === "add") {
      await prisma.wishlist.upsert({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId: productId,
          },
        },
        update: {},
        create: {
          userId: session.user.id,
          productId: productId,
        },
      });
    } else if (action === "remove") {
      await prisma.wishlist.deleteMany({
        where: {
          userId: session.user.id,
          productId: productId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST Wishlist Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
