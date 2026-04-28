// src/components/layout/Navbar.tsx
// Server Component — fetches the user session and categories,
// and passes both to NavbarClient which handles interactivity.

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { NavbarClient } from "./NavbarClient";

export default async function Navbar() {
  const session = await auth.api.getSession({ headers: await headers() });

  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === "admin";

  // Fetch all categories for the Shop dropdown
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <NavbarClient
      isAdmin={isAdmin}
      isLoggedIn={isLoggedIn}
      categories={categories}
    />
  );
}
