// This endpoint extends the session with custom fields (role, isApproved) from Prisma.
// The admin email is hardcoded — whoever logs in with that email is always treated as admin,
// regardless of the role value stored in the database.
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ADMIN_EMAIL } from "@/lib/utils";
import { formatSafeResponse } from "@/lib/error";

export async function GET(req: Request) {
  try {
    // Verify session with Better Auth
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch full user from Prisma (includes role, isApproved, and other custom fields)
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        role: true,
        isApproved: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // A user is treated as an admin if they have the primary admin email
    // OR if their database role is explicitly set to "admin".
    const role = (dbUser.email === ADMIN_EMAIL || dbUser.role === "admin") ? "admin" : "user";

    return NextResponse.json({ ...dbUser, role });
  } catch (err) {
    return formatSafeResponse(err);
  }
}
