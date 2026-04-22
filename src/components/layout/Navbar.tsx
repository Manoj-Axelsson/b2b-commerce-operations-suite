// src/components/layout/Navbar.tsx
// Server Component — fetches the user session and passes auth state
// to NavbarClient which handles interactivity and mobile menu.

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NavbarClient } from "./NavbarClient";

export default async function Navbar() {
  const session = await auth.api.getSession({ headers: await headers() });

  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === "admin";

  return <NavbarClient isAdmin={isAdmin} isLoggedIn={isLoggedIn} />;
}
