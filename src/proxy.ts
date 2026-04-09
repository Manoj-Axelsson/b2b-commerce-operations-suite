import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 👇 your existing logic preserved
  const isAuthPage =
    pathname.startsWith("/user-login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password");

  const isProtectedPage = pathname.startsWith("/account");

  // ✅ cookie check only (edge-safe)
  const sessionToken = request.cookies.get("better-auth.session_token");

  // 🔒 Protect private routes
  if (isProtectedPage && !sessionToken) {
    return NextResponse.redirect(new URL("/user-login", request.url));
  }

  // 🔁 Prevent logged-in users from going back to auth pages
  if (isAuthPage && sessionToken) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  return NextResponse.next();
}

// ✅ Required config (from docs)
export const config = {
  matcher: ["/account", "/user-login", "/signup", "/forgot-password"],
};
