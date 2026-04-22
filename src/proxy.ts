import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password");

  const isAdminPage = pathname.startsWith("/admin");
  const isUserPage = pathname.startsWith("/account");

  const sessionToken = request.cookies.get("better-auth.session_token") || request.cookies.get("__Secure-better-auth.session_token");

  //  Not logged in
  if (!sessionToken && (isAdminPage || isUserPage)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Prevent logged-in users from auth pages
  if (sessionToken && isAuthPage) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/login", "/signup"],
};
