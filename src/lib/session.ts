import { auth } from "./auth";
import { headers } from "next/headers";

export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export type NavbarSession = Awaited<ReturnType<typeof getSession>>;