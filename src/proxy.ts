import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
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
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/two-factor");

  const isAdminPage = pathname.startsWith("/admin");
  const isUserPage = pathname.startsWith("/account");

  const sessionToken =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  // Not logged in — redirect to login
  if (!sessionToken && (isAdminPage || isUserPage)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Prevent logged-in users from accessing auth pages (login, signup, etc.)
  // EXCEPTION: /two-factor MUST be accessible even with a session token,
  // as it is part of the login completion flow.
  if (sessionToken && isAuthPage && !pathname.startsWith("/two-factor")) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  // Protected Admin routes
  if (pathname.startsWith("/admin")) {
    // We fetch the session to check the role. 
    // The ADMIN_EMAIL is also checked as a fallback for the primary account.
    const res = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
      headers: { cookie: request.headers.get("cookie") || "" },
    });
    const session = await res.json();

    const isAdmin = session?.user?.email === "[EMAIL_ADDRESS]" || session?.user?.role === "admin";
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/account", request.url));
    }
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
    "/two-factor",
  ],
};

export default proxy;
