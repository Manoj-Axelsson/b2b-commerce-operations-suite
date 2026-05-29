import { auth } from "./auth";
import { headers } from "next/headers";
import prisma from "./prisma";

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isActive: true },
  });

  if (!user || !user.isActive) {
    return null;
  }

  return session;
}

export type NavbarSession = Awaited<ReturnType<typeof getSession>>;