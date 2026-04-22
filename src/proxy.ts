import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip all API routes, Next.js internals, and static files.
  // The matcher already excludes these, but this guard makes the intent explicit.
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  const isAdminPage = pathname.startsWith("/admin");
  const isUserPage = pathname.startsWith("/account");

  const sessionToken =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  // Not logged in — redirect to login
  if (!sessionToken && (isAdminPage || isUserPage)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Prevent logged-in users from accessing auth pages
  if (sessionToken && isAuthPage) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  return NextResponse.next();
}


export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ],
};
