import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

/**
 * ROLE: Network Boundary & Security Hardening
 * CONTEXT: Rajput-foods-Sweden (Next.js 16.2 + Node 24)
 * TASK: Direct DB Session Validation & Node 24 Optimization
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // 1. Security Hardening: Node 24 LTS Alignment
  response.headers.set("x-rajput-runtime", "node-24-lts");
  response.headers.set("X-Frame-Options", "DENY");

  // 2. Direct Session Check (Next.js 16 Proxy runs on Node.js by default)
  // We use the direct API to avoid internal HTTP overhead and leverage Node 24 performance
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // 3. Routing Logic
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/two-factor");

  const isProtectedRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/account");

  // Redirect unauthenticated users from protected areas
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Prevent logged-in users from accessing auth pages (except 2FA flow)
  if (isAuthRoute && session && !pathname.startsWith("/two-factor")) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  return response;
}

export const config = {
  // Optimal Matcher: Skips static assets and internal paths for performance
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public|.*\\..*).*)",
  ],
};