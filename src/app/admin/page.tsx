// src/app/admin/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/better-auth"; // ✅ Fix: Use the correct auth object
import { headers } from "next/headers";       // ✅ Fix: Add headers for session check

export default async function AdminHomePage() {
  // ✅ Fix: Use Better-Auth session check instead of missing getCurrentUser
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  const user = session?.user;

  // Simple Redirect Logic
  if (!user || (user.role !== "ADMIN" && user.role !== "SHOP_KEEPER")) {
    redirect("/login");
  }

  // If they are an admin, send them to the inventory (or dashboard)
  redirect("/admin/inventory");
}
