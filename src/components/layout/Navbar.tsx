// src/components/layout/Navbar.tsx
// Server Component — fetches the user session and categories,
// and passes both to NavbarClient which handles interactivity.

import prisma from "@/lib/prisma";
import { NavbarClient } from "./NavbarClient";
import { checkIsAdmin } from "@/lib/utils";
import type { NavbarSession } from "@/lib/session";

interface NavbarProps {
  session: NavbarSession;
}

export default async function Navbar({ session }: NavbarProps) {
  const isLoggedIn = !!session?.user;
  const isAdmin = checkIsAdmin(session?.user);

  // Fetch isApproved from DB — needed to gate the cart icon.
  // Only runs when a user is logged in; resolves to false otherwise.
  const userId = session?.user?.id;
  const userData = userId
    ? await prisma.user.findUnique({
      where: { id: userId },
      select: { isApproved: true },
    })
    : null;
  const isApproved = userData?.isApproved ?? false;

  // Fetch all categories for the Shop dropdown
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <NavbarClient
      isAdmin={isAdmin}
      isLoggedIn={isLoggedIn}
      isApproved={isApproved}
      categories={categories}
    />
  );
}
