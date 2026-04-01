//src/app/login/actions.ts

"use server";

import { auth } from "@/lib/auth/better-auth";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAsAdmin() {
  // 1. Hämta headers asynkront (Next.js 16/React 19)
  const currentHeaders = await headers();

  // 2. Anropa .api() som en funktion! 
  // I Better-Auth v1+ initierar detta API-kontexten för interna anrop.
  const api = auth.api({
    headers: currentHeaders,
  });

  // 3. Skapa sessionen från den initierade API-instansen
  const session = await api.createSession({
    body: {
      userId: "admin-user-1",
    },
  });

  if (!session) {
    throw new Error("Kunde inte skapa session.");
  }

  // 4. Sätt session-cookien manuellt för Next.js 16
  const cookieStore = await cookies();
  cookieStore.set("session", session.token, {
    expires: new Date(session.expiresAt),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });

  // 5. Skicka användaren vidare
  redirect("/admin/inventory");
}
