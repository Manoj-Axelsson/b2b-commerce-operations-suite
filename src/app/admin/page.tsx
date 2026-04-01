// src/app/admin/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";

export default async function AdminHomePage() {
  const user = await getCurrentUser();
  const role = user?.role?.toLowerCase(); // Tvinga små bokstäver

  // Ändra till små bokstäver här!
  if (!user || (role !== "admin" && role !== "shop_keeper")) {
    redirect("/"); // Om kontrollen misslyckas skickas du till startsidan
  }

  // Om kontrollen lyckas, skicka till inventory
  redirect("/admin/inventory");
}
